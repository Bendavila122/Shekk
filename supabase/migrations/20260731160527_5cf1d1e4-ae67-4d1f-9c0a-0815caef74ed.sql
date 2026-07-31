CREATE TABLE public.insurance_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id text NOT NULL,
  provider_name text NOT NULL,
  plan text,
  member_number text,
  group_number text,
  policy_holder text,
  valid_from date,
  valid_until date,
  hotline text,
  covers text,
  is_primary boolean NOT NULL DEFAULT false,
  front_path text,
  back_path text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX insurance_cards_user_idx ON public.insurance_cards (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.insurance_cards TO authenticated;
GRANT ALL ON public.insurance_cards TO service_role;

ALTER TABLE public.insurance_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own insurance cards"
  ON public.insurance_cards FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Members add their own insurance cards"
  ON public.insurance_cards FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members edit their own insurance cards"
  ON public.insurance_cards FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members delete their own insurance cards"
  ON public.insurance_cards FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER insurance_cards_touch
  BEFORE UPDATE ON public.insurance_cards
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();