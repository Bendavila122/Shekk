-- ============================================================ ACCOUNTS ===
CREATE TABLE public.accounts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  currency text NOT NULL DEFAULT 'ILS',
  balance_agorot bigint NOT NULL DEFAULT 0,
  held_agorot bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT accounts_balance_non_negative CHECK (balance_agorot >= 0),
  CONSTRAINT accounts_held_non_negative CHECK (held_agorot >= 0),
  CONSTRAINT accounts_status_valid CHECK (status IN ('active','frozen','closed'))
);

GRANT SELECT ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own account"
  ON public.accounts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ====================================================== LEDGER ENTRIES ===
CREATE TABLE public.ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  direction text NOT NULL,
  amount_agorot bigint NOT NULL,
  balance_after_agorot bigint NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  merchant text NOT NULL,
  icon text NOT NULL DEFAULT '💳',
  counterparty text,
  external_ref text,
  hold_id uuid,
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ledger_direction_valid CHECK (direction IN ('credit','debit')),
  CONSTRAINT ledger_amount_positive CHECK (amount_agorot > 0),
  CONSTRAINT ledger_idempotency_unique UNIQUE (user_id, idempotency_key)
);

CREATE INDEX ledger_entries_user_created_idx
  ON public.ledger_entries (user_id, created_at DESC);
CREATE INDEX ledger_entries_external_ref_idx
  ON public.ledger_entries (external_ref) WHERE external_ref IS NOT NULL;

GRANT SELECT ON public.ledger_entries TO authenticated;
GRANT ALL ON public.ledger_entries TO service_role;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own ledger"
  ON public.ledger_entries FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- The ledger is append-only: block edits and deletes at the database level.
CREATE OR REPLACE FUNCTION public.ledger_is_immutable()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'ledger_entries is append-only; post a reversing entry instead';
END;
$$;

CREATE TRIGGER ledger_entries_no_update
  BEFORE UPDATE OR DELETE ON public.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION public.ledger_is_immutable();

-- ================================================================ HOLDS ===
CREATE TABLE public.holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_agorot bigint NOT NULL,
  status text NOT NULL DEFAULT 'open',
  merchant text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  icon text NOT NULL DEFAULT '💳',
  external_ref text,
  settled_entry_id uuid REFERENCES public.ledger_entries(id),
  settled_amount_agorot bigint,
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  CONSTRAINT holds_amount_positive CHECK (amount_agorot > 0),
  CONSTRAINT holds_status_valid CHECK (status IN ('open','settled','released')),
  CONSTRAINT holds_idempotency_unique UNIQUE (user_id, idempotency_key)
);

CREATE INDEX holds_user_status_idx ON public.holds (user_id, status);

GRANT SELECT ON public.holds TO authenticated;
GRANT ALL ON public.holds TO service_role;
ALTER TABLE public.holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own holds"
  ON public.holds FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ====================================================== FUNDING EVENTS ===
CREATE TABLE public.funding_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'simulator',
  provider_ref text,
  method text NOT NULL DEFAULT 'apple-pay',
  pay_currency text NOT NULL,
  pay_amount_minor bigint NOT NULL,
  interbank_rate numeric(16,6) NOT NULL,
  quoted_rate numeric(16,6) NOT NULL,
  fee_minor bigint NOT NULL DEFAULT 0,
  shekels_agorot bigint NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  entry_id uuid REFERENCES public.ledger_entries(id),
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  settled_at timestamptz,
  CONSTRAINT funding_amount_positive CHECK (pay_amount_minor > 0 AND shekels_agorot > 0),
  CONSTRAINT funding_status_valid CHECK (status IN ('pending','settled','failed')),
  CONSTRAINT funding_idempotency_unique UNIQUE (idempotency_key)
);

CREATE INDEX funding_events_user_created_idx
  ON public.funding_events (user_id, created_at DESC);

GRANT SELECT ON public.funding_events TO authenticated;
GRANT ALL ON public.funding_events TO service_role;
ALTER TABLE public.funding_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own top ups"
  ON public.funding_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- =========================================================== ROUTINES ====

-- Make sure the signed-in member has an account row.
CREATE OR REPLACE FUNCTION public.ensure_account()
RETURNS public.accounts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  acct public.accounts;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.accounts (user_id)
  VALUES (uid)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO acct FROM public.accounts WHERE user_id = uid;
  RETURN acct;
END;
$$;

-- Post a movement of money. The only way a balance ever changes.
CREATE OR REPLACE FUNCTION public.ledger_post(
  _direction text,
  _amount_agorot bigint,
  _merchant text,
  _category text DEFAULT 'Other',
  _icon text DEFAULT '💳',
  _counterparty text DEFAULT NULL,
  _external_ref text DEFAULT NULL,
  _idempotency_key text DEFAULT NULL,
  _hold_id uuid DEFAULT NULL
)
RETURNS public.ledger_entries
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  key text := COALESCE(_idempotency_key, gen_random_uuid()::text);
  acct public.accounts;
  new_balance bigint;
  entry public.ledger_entries;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _direction NOT IN ('credit','debit') THEN RAISE EXCEPTION 'bad direction'; END IF;
  IF _amount_agorot IS NULL OR _amount_agorot <= 0 THEN RAISE EXCEPTION 'amount must be positive'; END IF;

  -- Replay of the same request returns the original entry, never a second one.
  SELECT * INTO entry FROM public.ledger_entries
   WHERE user_id = uid AND idempotency_key = key;
  IF FOUND THEN RETURN entry; END IF;

  PERFORM public.ensure_account();
  SELECT * INTO acct FROM public.accounts WHERE user_id = uid FOR UPDATE;

  IF acct.status <> 'active' THEN
    RAISE EXCEPTION 'account is % and cannot move money', acct.status;
  END IF;

  IF _direction = 'credit' THEN
    new_balance := acct.balance_agorot + _amount_agorot;
  ELSE
    -- A hold has already reserved this money, so it is not checked twice.
    IF _hold_id IS NULL
       AND (acct.balance_agorot - acct.held_agorot) < _amount_agorot THEN
      RAISE EXCEPTION 'insufficient balance';
    END IF;
    new_balance := acct.balance_agorot - _amount_agorot;
    IF new_balance < 0 THEN RAISE EXCEPTION 'insufficient balance'; END IF;
  END IF;

  UPDATE public.accounts
     SET balance_agorot = new_balance, updated_at = now()
   WHERE user_id = uid;

  INSERT INTO public.ledger_entries (
    user_id, direction, amount_agorot, balance_after_agorot,
    category, merchant, icon, counterparty, external_ref, hold_id, idempotency_key
  ) VALUES (
    uid, _direction, _amount_agorot, new_balance,
    COALESCE(_category,'Other'), _merchant, COALESCE(_icon,'💳'),
    _counterparty, _external_ref, _hold_id, key
  ) RETURNING * INTO entry;

  RETURN entry;
END;
$$;

-- Reserve money for a payment whose final amount is not known yet.
CREATE OR REPLACE FUNCTION public.hold_create(
  _amount_agorot bigint,
  _merchant text,
  _category text DEFAULT 'Other',
  _icon text DEFAULT '💳',
  _external_ref text DEFAULT NULL,
  _idempotency_key text DEFAULT NULL
)
RETURNS public.holds
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  key text := COALESCE(_idempotency_key, gen_random_uuid()::text);
  acct public.accounts;
  h public.holds;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _amount_agorot IS NULL OR _amount_agorot <= 0 THEN RAISE EXCEPTION 'amount must be positive'; END IF;

  SELECT * INTO h FROM public.holds WHERE user_id = uid AND idempotency_key = key;
  IF FOUND THEN RETURN h; END IF;

  PERFORM public.ensure_account();
  SELECT * INTO acct FROM public.accounts WHERE user_id = uid FOR UPDATE;

  IF acct.status <> 'active' THEN
    RAISE EXCEPTION 'account is % and cannot move money', acct.status;
  END IF;
  IF (acct.balance_agorot - acct.held_agorot) < _amount_agorot THEN
    RAISE EXCEPTION 'insufficient balance';
  END IF;

  UPDATE public.accounts
     SET held_agorot = held_agorot + _amount_agorot, updated_at = now()
   WHERE user_id = uid;

  INSERT INTO public.holds (
    user_id, amount_agorot, merchant, category, icon, external_ref, idempotency_key
  ) VALUES (
    uid, _amount_agorot, _merchant, COALESCE(_category,'Other'),
    COALESCE(_icon,'💳'), _external_ref, key
  ) RETURNING * INTO h;

  RETURN h;
END;
$$;

-- Turn a hold into a real charge at its final amount.
CREATE OR REPLACE FUNCTION public.hold_settle(
  _hold_id uuid,
  _final_amount_agorot bigint DEFAULT NULL
)
RETURNS public.ledger_entries
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  h public.holds;
  final_amount bigint;
  acct public.accounts;
  entry public.ledger_entries;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  SELECT * INTO h FROM public.holds
   WHERE id = _hold_id AND user_id = uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'hold not found'; END IF;

  IF h.status = 'settled' THEN
    SELECT * INTO entry FROM public.ledger_entries WHERE id = h.settled_entry_id;
    RETURN entry;
  END IF;
  IF h.status <> 'open' THEN RAISE EXCEPTION 'hold already %', h.status; END IF;

  final_amount := COALESCE(_final_amount_agorot, h.amount_agorot);
  IF final_amount <= 0 THEN RAISE EXCEPTION 'final amount must be positive'; END IF;

  -- Release the reservation first, then charge the true amount.
  UPDATE public.accounts
     SET held_agorot = GREATEST(0, held_agorot - h.amount_agorot), updated_at = now()
   WHERE user_id = uid;

  SELECT * INTO acct FROM public.accounts WHERE user_id = uid FOR UPDATE;
  IF (acct.balance_agorot - acct.held_agorot) < final_amount THEN
    RAISE EXCEPTION 'insufficient balance to settle';
  END IF;

  entry := public.ledger_post(
    'debit', final_amount, h.merchant, h.category, h.icon,
    NULL, h.external_ref, 'hold:' || h.id::text, h.id
  );

  UPDATE public.holds
     SET status = 'settled',
         settled_entry_id = entry.id,
         settled_amount_agorot = final_amount,
         resolved_at = now()
   WHERE id = h.id;

  RETURN entry;
END;
$$;

-- Give a reservation back without charging anything.
CREATE OR REPLACE FUNCTION public.hold_release(_hold_id uuid)
RETURNS public.holds
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  h public.holds;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  SELECT * INTO h FROM public.holds WHERE id = _hold_id AND user_id = uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'hold not found'; END IF;
  IF h.status <> 'open' THEN RETURN h; END IF;

  UPDATE public.accounts
     SET held_agorot = GREATEST(0, held_agorot - h.amount_agorot), updated_at = now()
   WHERE user_id = uid;

  UPDATE public.holds
     SET status = 'released', resolved_at = now()
   WHERE id = h.id
  RETURNING * INTO h;

  RETURN h;
END;
$$;

-- Record a top up and credit the shekels it bought, in one step.
CREATE OR REPLACE FUNCTION public.funding_settle(
  _pay_currency text,
  _pay_amount_minor bigint,
  _interbank_rate numeric,
  _quoted_rate numeric,
  _fee_minor bigint,
  _shekels_agorot bigint,
  _method text DEFAULT 'apple-pay',
  _provider text DEFAULT 'simulator',
  _provider_ref text DEFAULT NULL,
  _idempotency_key text DEFAULT NULL
)
RETURNS public.funding_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  key text := COALESCE(_idempotency_key, gen_random_uuid()::text);
  ev public.funding_events;
  entry public.ledger_entries;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  SELECT * INTO ev FROM public.funding_events WHERE idempotency_key = key;
  IF FOUND THEN RETURN ev; END IF;

  INSERT INTO public.funding_events (
    user_id, provider, provider_ref, method, pay_currency, pay_amount_minor,
    interbank_rate, quoted_rate, fee_minor, shekels_agorot, status, idempotency_key
  ) VALUES (
    uid, _provider, _provider_ref, _method, _pay_currency, _pay_amount_minor,
    _interbank_rate, _quoted_rate, COALESCE(_fee_minor,0), _shekels_agorot,
    'pending', key
  ) RETURNING * INTO ev;

  entry := public.ledger_post(
    'credit', _shekels_agorot,
    'Money added · ' || _pay_currency || ' ' || round(_pay_amount_minor / 100.0, 2)::text,
    'Top up', '💳', NULL, _provider_ref, 'funding:' || ev.id::text, NULL
  );

  UPDATE public.funding_events
     SET status = 'settled', entry_id = entry.id, settled_at = now()
   WHERE id = ev.id
  RETURNING * INTO ev;

  RETURN ev;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_account() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ledger_post(text, bigint, text, text, text, text, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hold_create(bigint, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hold_settle(uuid, bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hold_release(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.funding_settle(text, bigint, numeric, numeric, bigint, bigint, text, text, text, text) TO authenticated;