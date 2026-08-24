ALTER TABLE public.venue_meta ADD COLUMN IF NOT EXISTS internal_notes text;

-- Public place reads happen through the service role only; members and
-- anonymous visitors may read member-facing columns but never internal notes.
REVOKE SELECT ON public.venue_meta FROM anon;
REVOKE SELECT ON public.venue_meta FROM authenticated;

GRANT SELECT (
  id, google_place_id, label, name_snapshot, chain, city,
  day_pass_ils, monthly_ils, min_contract_months, facilities,
  english_friendly, short_stay, partner, partner_offer,
  verified_at, notes, active, created_at, updated_at
) ON public.venue_meta TO anon, authenticated;

GRANT ALL ON public.venue_meta TO service_role;