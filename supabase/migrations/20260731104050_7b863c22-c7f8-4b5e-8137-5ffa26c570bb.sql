-- ─────────────────────────────────────────────────────────── events catalogue ───

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'other'
    CHECK (kind IN ('shabbaton','tiyul','club','shiur','chesed','other')),
  description text,
  includes text,
  host text NOT NULL,
  venue text,
  city text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  price_agorot bigint NOT NULL DEFAULT 0 CHECK (price_agorot >= 0),
  capacity integer NOT NULL DEFAULT 0 CHECK (capacity >= 0),
  per_person_limit integer NOT NULL DEFAULT 2 CHECK (per_person_limit BETWEEN 1 AND 20),
  cover_url text,
  emoji text NOT NULL DEFAULT '🎟️',
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','cancelled')),
  provider text NOT NULL DEFAULT 'shekk',
  provider_ref text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_ref)
);

CREATE INDEX idx_events_published ON public.events (status, starts_at);

GRANT SELECT ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view published events"
  ON public.events FOR SELECT TO authenticated
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));

-- ──────────────────────────────────────────────────────────────────── tickets ───

CREATE TABLE public.event_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 20),
  amount_agorot bigint NOT NULL CHECK (amount_agorot >= 0),
  code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'valid'
    CHECK (status IN ('valid','used','cancelled')),
  entry_id uuid,
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz
);

CREATE INDEX idx_event_tickets_user ON public.event_tickets (user_id, created_at DESC);
CREATE INDEX idx_event_tickets_event ON public.event_tickets (event_id);

GRANT SELECT ON public.event_tickets TO authenticated;
GRANT ALL ON public.event_tickets TO service_role;

ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their own tickets"
  ON public.event_tickets FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ───────────────────────────────────────────────────────── updated_at trigger ───

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER events_touch_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ─────────────────────────────────────────────────── atomic ticket purchase ───

CREATE OR REPLACE FUNCTION public.ticket_purchase(
  _user_id uuid,
  _event_id uuid,
  _quantity integer,
  _idempotency_key text DEFAULT NULL
)
RETURNS public.event_tickets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  key text := COALESCE(_idempotency_key, gen_random_uuid()::text);
  ev public.events;
  sold integer;
  mine integer;
  total bigint;
  entry public.ledger_entries;
  ticket public.event_tickets;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'user required'; END IF;
  IF _quantity IS NULL OR _quantity < 1 THEN RAISE EXCEPTION 'quantity must be at least 1'; END IF;

  SELECT * INTO ticket FROM public.event_tickets WHERE idempotency_key = key;
  IF FOUND THEN RETURN ticket; END IF;

  SELECT * INTO ev FROM public.events WHERE id = _event_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'event not found'; END IF;
  IF ev.status <> 'published' THEN RAISE EXCEPTION 'this event is not on sale'; END IF;
  IF ev.starts_at < now() THEN RAISE EXCEPTION 'this event has already started'; END IF;
  IF _quantity > ev.per_person_limit THEN
    RAISE EXCEPTION 'limit of % per person', ev.per_person_limit;
  END IF;

  SELECT COALESCE(SUM(quantity), 0) INTO sold
    FROM public.event_tickets
   WHERE event_id = ev.id AND status <> 'cancelled';

  IF ev.capacity > 0 AND sold + _quantity > ev.capacity THEN
    RAISE EXCEPTION 'not enough spots left';
  END IF;

  SELECT COALESCE(SUM(quantity), 0) INTO mine
    FROM public.event_tickets
   WHERE event_id = ev.id AND user_id = _user_id AND status <> 'cancelled';

  IF mine + _quantity > ev.per_person_limit THEN
    RAISE EXCEPTION 'limit of % per person', ev.per_person_limit;
  END IF;

  total := ev.price_agorot * _quantity;

  IF total > 0 THEN
    entry := public.ledger_post(
      _user_id, 'debit', total, ev.title, 'Events', ev.emoji,
      ev.host, 'event:' || ev.id::text, 'ticket:' || key, NULL
    );
  END IF;

  INSERT INTO public.event_tickets (
    event_id, user_id, quantity, amount_agorot, code, entry_id, idempotency_key
  ) VALUES (
    ev.id, _user_id, _quantity, total,
    encode(gen_random_bytes(16), 'hex'),
    entry.id, key
  ) RETURNING * INTO ticket;

  RETURN ticket;
END;
$$;

REVOKE EXECUTE ON FUNCTION
  public.ticket_purchase(uuid, uuid, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION
  public.ticket_purchase(uuid, uuid, integer, text) TO service_role;