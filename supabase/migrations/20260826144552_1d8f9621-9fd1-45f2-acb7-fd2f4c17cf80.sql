-- Provider-neutral commercial fields on the existing events catalogue (additive only).
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS external_provider_id text,
  ADD COLUMN IF NOT EXISTS external_booking_url text,
  ADD COLUMN IF NOT EXISTS integration_type text NOT NULL DEFAULT 'internal_ticket',
  ADD COLUMN IF NOT EXISTS affiliate_campaign_id text,
  ADD COLUMN IF NOT EXISTS commission_type text,
  ADD COLUMN IF NOT EXISTS commission_rate numeric(6,4),
  ADD COLUMN IF NOT EXISTS source_category text,
  ADD COLUMN IF NOT EXISTS programme_status text NOT NULL DEFAULT 'independent',
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS availability_confidence text,
  ADD COLUMN IF NOT EXISTS terms_url text,
  ADD COLUMN IF NOT EXISTS refund_summary text,
  ADD COLUMN IF NOT EXISTS age_min integer;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_integration_type_check') THEN
    ALTER TABLE public.events ADD CONSTRAINT events_integration_type_check
      CHECK (integration_type IN ('internal_ticket','affiliate_link','widget','api'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_programme_status_check') THEN
    ALTER TABLE public.events ADD CONSTRAINT events_programme_status_check
      CHECK (programme_status IN ('programme_included','programme_official','independent'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_availability_confidence_check') THEN
    ALTER TABLE public.events ADD CONSTRAINT events_availability_confidence_check
      CHECK (availability_confidence IS NULL OR availability_confidence IN ('live','recent','unknown'));
  END IF;
END $$;

-- Outbound attribution records so future commission reconciliation is possible.
CREATE TABLE IF NOT EXISTS public.activity_outbound_clicks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  provider text NOT NULL,
  external_provider_id text,
  destination_url text NOT NULL,
  affiliate_campaign_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.activity_outbound_clicks TO authenticated;
GRANT ALL ON public.activity_outbound_clicks TO service_role;

ALTER TABLE public.activity_outbound_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members read their own outbound clicks" ON public.activity_outbound_clicks;
CREATE POLICY "Members read their own outbound clicks"
  ON public.activity_outbound_clicks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all outbound clicks" ON public.activity_outbound_clicks;
CREATE POLICY "Admins read all outbound clicks"
  ON public.activity_outbound_clicks FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS activity_outbound_clicks_event_idx ON public.activity_outbound_clicks(event_id, created_at DESC);