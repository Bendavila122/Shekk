-- Shekk-owned venue metadata, linked to Google places by place id only.
CREATE TABLE public.venue_meta (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  google_place_id text NOT NULL UNIQUE,
  label text,
  name_snapshot text,
  chain text,
  city text,
  day_pass_ils integer,
  monthly_ils integer,
  min_contract_months integer,
  facilities text[] NOT NULL DEFAULT '{}',
  english_friendly boolean NOT NULL DEFAULT false,
  short_stay boolean NOT NULL DEFAULT false,
  partner boolean NOT NULL DEFAULT false,
  partner_offer text,
  verified_at timestamp with time zone,
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.venue_meta TO authenticated;
GRANT SELECT ON public.venue_meta TO anon;
GRANT ALL ON public.venue_meta TO service_role;

ALTER TABLE public.venue_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active venue metadata"
  ON public.venue_meta FOR SELECT
  USING (active);

CREATE INDEX venue_meta_city_idx ON public.venue_meta (city);
CREATE INDEX venue_meta_partner_idx ON public.venue_meta (partner) WHERE partner;

CREATE TRIGGER venue_meta_touch
  BEFORE UPDATE ON public.venue_meta
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Member saved/favourite places.
CREATE TABLE public.saved_places (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_place_id text NOT NULL,
  app text NOT NULL DEFAULT 'maps',
  category text,
  label text,
  name_snapshot text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, google_place_id, app)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_places TO authenticated;
GRANT ALL ON public.saved_places TO service_role;

ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own saved places"
  ON public.saved_places FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Members save their own places"
  ON public.saved_places FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members update their own saved places"
  ON public.saved_places FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members remove their own saved places"
  ON public.saved_places FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX saved_places_user_idx ON public.saved_places (user_id, app);

CREATE TRIGGER saved_places_touch
  BEFORE UPDATE ON public.saved_places
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();