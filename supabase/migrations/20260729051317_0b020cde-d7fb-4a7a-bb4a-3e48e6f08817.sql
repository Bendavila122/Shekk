-- Nobody but the server may move money.
REVOKE ALL ON FUNCTION public.ensure_account() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ledger_post(text, bigint, text, text, text, text, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.hold_create(bigint, text, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.hold_settle(uuid, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.hold_release(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.funding_settle(text, bigint, numeric, numeric, bigint, bigint, text, text, text, text) FROM PUBLIC, anon, authenticated;

DROP FUNCTION IF EXISTS public.ensure_account();
DROP FUNCTION IF EXISTS public.funding_settle(text, bigint, numeric, numeric, bigint, bigint, text, text, text, text);
DROP FUNCTION IF EXISTS public.hold_settle(uuid, bigint);
DROP FUNCTION IF EXISTS public.hold_release(uuid);
DROP FUNCTION IF EXISTS public.hold_create(bigint, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.ledger_post(text, bigint, text, text, text, text, text, text, uuid);

-- Every routine below takes the member explicitly and is server-only.

CREATE FUNCTION public.ensure_account(_user_id uuid)
RETURNS public.accounts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE acct public.accounts;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'user required'; END IF;
  INSERT INTO public.accounts (user_id) VALUES (_user_id) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO acct FROM public.accounts WHERE user_id = _user_id;
  RETURN acct;
END;
$$;

CREATE FUNCTION public.ledger_post(
  _user_id uuid,
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
  key text := COALESCE(_idempotency_key, gen_random_uuid()::text);
  acct public.accounts;
  new_balance bigint;
  entry public.ledger_entries;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'user required'; END IF;
  IF _direction NOT IN ('credit','debit') THEN RAISE EXCEPTION 'bad direction'; END IF;
  IF _amount_agorot IS NULL OR _amount_agorot <= 0 THEN RAISE EXCEPTION 'amount must be positive'; END IF;

  SELECT * INTO entry FROM public.ledger_entries
   WHERE user_id = _user_id AND idempotency_key = key;
  IF FOUND THEN RETURN entry; END IF;

  PERFORM public.ensure_account(_user_id);
  SELECT * INTO acct FROM public.accounts WHERE user_id = _user_id FOR UPDATE;

  IF acct.status <> 'active' THEN
    RAISE EXCEPTION 'account is % and cannot move money', acct.status;
  END IF;

  IF _direction = 'credit' THEN
    new_balance := acct.balance_agorot + _amount_agorot;
  ELSE
    IF _hold_id IS NULL
       AND (acct.balance_agorot - acct.held_agorot) < _amount_agorot THEN
      RAISE EXCEPTION 'insufficient balance';
    END IF;
    new_balance := acct.balance_agorot - _amount_agorot;
    IF new_balance < 0 THEN RAISE EXCEPTION 'insufficient balance'; END IF;
  END IF;

  UPDATE public.accounts
     SET balance_agorot = new_balance, updated_at = now()
   WHERE user_id = _user_id;

  INSERT INTO public.ledger_entries (
    user_id, direction, amount_agorot, balance_after_agorot,
    category, merchant, icon, counterparty, external_ref, hold_id, idempotency_key
  ) VALUES (
    _user_id, _direction, _amount_agorot, new_balance,
    COALESCE(_category,'Other'), _merchant, COALESCE(_icon,'💳'),
    _counterparty, _external_ref, _hold_id, key
  ) RETURNING * INTO entry;

  RETURN entry;
END;
$$;

CREATE FUNCTION public.hold_create(
  _user_id uuid,
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
  key text := COALESCE(_idempotency_key, gen_random_uuid()::text);
  acct public.accounts;
  h public.holds;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'user required'; END IF;
  IF _amount_agorot IS NULL OR _amount_agorot <= 0 THEN RAISE EXCEPTION 'amount must be positive'; END IF;

  SELECT * INTO h FROM public.holds WHERE user_id = _user_id AND idempotency_key = key;
  IF FOUND THEN RETURN h; END IF;

  PERFORM public.ensure_account(_user_id);
  SELECT * INTO acct FROM public.accounts WHERE user_id = _user_id FOR UPDATE;

  IF acct.status <> 'active' THEN
    RAISE EXCEPTION 'account is % and cannot move money', acct.status;
  END IF;
  IF (acct.balance_agorot - acct.held_agorot) < _amount_agorot THEN
    RAISE EXCEPTION 'insufficient balance';
  END IF;

  UPDATE public.accounts
     SET held_agorot = held_agorot + _amount_agorot, updated_at = now()
   WHERE user_id = _user_id;

  INSERT INTO public.holds (
    user_id, amount_agorot, merchant, category, icon, external_ref, idempotency_key
  ) VALUES (
    _user_id, _amount_agorot, _merchant, COALESCE(_category,'Other'),
    COALESCE(_icon,'💳'), _external_ref, key
  ) RETURNING * INTO h;

  RETURN h;
END;
$$;

CREATE FUNCTION public.hold_settle(
  _user_id uuid,
  _hold_id uuid,
  _final_amount_agorot bigint DEFAULT NULL
)
RETURNS public.ledger_entries
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  h public.holds;
  final_amount bigint;
  acct public.accounts;
  entry public.ledger_entries;
BEGIN
  SELECT * INTO h FROM public.holds
   WHERE id = _hold_id AND user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'hold not found'; END IF;

  IF h.status = 'settled' THEN
    SELECT * INTO entry FROM public.ledger_entries WHERE id = h.settled_entry_id;
    RETURN entry;
  END IF;
  IF h.status <> 'open' THEN RAISE EXCEPTION 'hold already %', h.status; END IF;

  final_amount := COALESCE(_final_amount_agorot, h.amount_agorot);
  IF final_amount <= 0 THEN RAISE EXCEPTION 'final amount must be positive'; END IF;

  UPDATE public.accounts
     SET held_agorot = GREATEST(0, held_agorot - h.amount_agorot), updated_at = now()
   WHERE user_id = _user_id;

  SELECT * INTO acct FROM public.accounts WHERE user_id = _user_id FOR UPDATE;
  IF (acct.balance_agorot - acct.held_agorot) < final_amount THEN
    RAISE EXCEPTION 'insufficient balance to settle';
  END IF;

  entry := public.ledger_post(
    _user_id, 'debit', final_amount, h.merchant, h.category, h.icon,
    NULL, h.external_ref, 'hold:' || h.id::text, h.id
  );

  UPDATE public.holds
     SET status = 'settled', settled_entry_id = entry.id,
         settled_amount_agorot = final_amount, resolved_at = now()
   WHERE id = h.id;

  RETURN entry;
END;
$$;

CREATE FUNCTION public.hold_release(_user_id uuid, _hold_id uuid)
RETURNS public.holds
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE h public.holds;
BEGIN
  SELECT * INTO h FROM public.holds WHERE id = _hold_id AND user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'hold not found'; END IF;
  IF h.status <> 'open' THEN RETURN h; END IF;

  UPDATE public.accounts
     SET held_agorot = GREATEST(0, held_agorot - h.amount_agorot), updated_at = now()
   WHERE user_id = _user_id;

  UPDATE public.holds SET status = 'released', resolved_at = now()
   WHERE id = h.id RETURNING * INTO h;

  RETURN h;
END;
$$;

CREATE FUNCTION public.funding_settle(
  _user_id uuid,
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
  key text := COALESCE(_idempotency_key, gen_random_uuid()::text);
  ev public.funding_events;
  entry public.ledger_entries;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'user required'; END IF;

  SELECT * INTO ev FROM public.funding_events WHERE idempotency_key = key;
  IF FOUND THEN RETURN ev; END IF;

  INSERT INTO public.funding_events (
    user_id, provider, provider_ref, method, pay_currency, pay_amount_minor,
    interbank_rate, quoted_rate, fee_minor, shekels_agorot, status, idempotency_key
  ) VALUES (
    _user_id, _provider, _provider_ref, _method, _pay_currency, _pay_amount_minor,
    _interbank_rate, _quoted_rate, COALESCE(_fee_minor,0), _shekels_agorot,
    'pending', key
  ) RETURNING * INTO ev;

  entry := public.ledger_post(
    _user_id, 'credit', _shekels_agorot,
    'Money added · ' || _pay_currency || ' ' || round(_pay_amount_minor / 100.0, 2)::text,
    'Top up', '💳', NULL, _provider_ref, 'funding:' || ev.id::text, NULL
  );

  UPDATE public.funding_events
     SET status = 'settled', entry_id = entry.id, settled_at = now()
   WHERE id = ev.id RETURNING * INTO ev;

  RETURN ev;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_account(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ledger_post(uuid, text, bigint, text, text, text, text, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.hold_create(uuid, bigint, text, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.hold_settle(uuid, uuid, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.hold_release(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.funding_settle(uuid, text, bigint, numeric, numeric, bigint, bigint, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ledger_is_immutable() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.ensure_account(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.ledger_post(uuid, text, bigint, text, text, text, text, text, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.hold_create(uuid, bigint, text, text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.hold_settle(uuid, uuid, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.hold_release(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.funding_settle(uuid, text, bigint, numeric, numeric, bigint, bigint, text, text, text, text) TO service_role;