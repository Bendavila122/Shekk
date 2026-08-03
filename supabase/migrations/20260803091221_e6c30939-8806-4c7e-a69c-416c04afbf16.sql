-- ============================================================ programmes ===
CREATE TABLE public.programmes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  organisation text,
  city text,
  is_demo boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programmes TO authenticated;
GRANT ALL ON public.programmes TO service_role;
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.programme_cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
  name text NOT NULL,
  join_code text NOT NULL,
  welcome_message text,
  starts_on date,
  ends_on date,
  status text NOT NULL DEFAULT 'open',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX programme_cohorts_join_code_key ON public.programme_cohorts (upper(join_code));
GRANT SELECT ON public.programme_cohorts TO authenticated;
GRANT ALL ON public.programme_cohorts TO service_role;
ALTER TABLE public.programme_cohorts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.programme_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_id uuid NOT NULL REFERENCES public.programme_cohorts(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  joined_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX programme_memberships_one_active
  ON public.programme_memberships (user_id) WHERE status = 'active';
GRANT SELECT, UPDATE ON public.programme_memberships TO authenticated;
GRANT ALL ON public.programme_memberships TO service_role;
ALTER TABLE public.programme_memberships ENABLE ROW LEVEL SECURITY;

-- membership helper (security definer avoids recursive policy reads)
CREATE OR REPLACE FUNCTION public.in_cohort(_cohort_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.programme_memberships m
    WHERE m.cohort_id = _cohort_id AND m.user_id = _user_id AND m.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.my_cohort_id(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.cohort_id FROM public.programme_memberships m
  WHERE m.user_id = _user_id AND m.status = 'active' LIMIT 1;
$$;

CREATE POLICY "Members read their own membership" ON public.programme_memberships
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Members leave their own membership" ON public.programme_memberships
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members read their cohort" ON public.programme_cohorts
  FOR SELECT TO authenticated USING (public.in_cohort(id, auth.uid()));
CREATE POLICY "Members read their programme" ON public.programmes
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.programme_cohorts c
      WHERE c.programme_id = programmes.id AND public.in_cohort(c.id, auth.uid())
    )
  );

-- ================================================= cohort content tables ===
CREATE TABLE public.programme_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.programme_cohorts(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programme_announcements TO authenticated;
GRANT ALL ON public.programme_announcements TO service_role;
ALTER TABLE public.programme_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cohort members read announcements" ON public.programme_announcements
  FOR SELECT TO authenticated USING (public.in_cohort(cohort_id, auth.uid()));

CREATE TABLE public.programme_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.programme_cohorts(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  phone text,
  email text,
  is_emergency boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programme_contacts TO authenticated;
GRANT ALL ON public.programme_contacts TO service_role;
ALTER TABLE public.programme_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cohort members read contacts" ON public.programme_contacts
  FOR SELECT TO authenticated USING (public.in_cohort(cohort_id, auth.uid()));

CREATE TABLE public.programme_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.programme_cohorts(id) ON DELETE CASCADE,
  label text NOT NULL,
  description text,
  link_url text,
  category text NOT NULL DEFAULT 'other',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programme_documents TO authenticated;
GRANT ALL ON public.programme_documents TO service_role;
ALTER TABLE public.programme_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cohort members read documents" ON public.programme_documents
  FOR SELECT TO authenticated USING (public.in_cohort(cohort_id, auth.uid()));

CREATE TABLE public.programme_schedule_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.programme_cohorts(id) ON DELETE CASCADE,
  title text NOT NULL,
  details text,
  location text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programme_schedule_items TO authenticated;
GRANT ALL ON public.programme_schedule_items TO service_role;
ALTER TABLE public.programme_schedule_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cohort members read schedule" ON public.programme_schedule_items
  FOR SELECT TO authenticated USING (public.in_cohort(cohort_id, auth.uid()));

CREATE TABLE public.programme_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.programme_cohorts(id) ON DELETE CASCADE,
  item_key text NOT NULL,
  title text NOT NULL,
  details text,
  due_on date,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cohort_id, item_key)
);
GRANT SELECT ON public.programme_checklist_items TO authenticated;
GRANT ALL ON public.programme_checklist_items TO service_role;
ALTER TABLE public.programme_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cohort members read checklist" ON public.programme_checklist_items
  FOR SELECT TO authenticated USING (public.in_cohort(cohort_id, auth.uid()));

CREATE TABLE public.programme_checklist_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.programme_checklist_items(id) ON DELETE CASCADE,
  done boolean NOT NULL DEFAULT true,
  done_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programme_checklist_progress TO authenticated;
GRANT ALL ON public.programme_checklist_progress TO service_role;
ALTER TABLE public.programme_checklist_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage their checklist progress" ON public.programme_checklist_progress
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================== travel ====
CREATE TABLE public.member_travel (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  travel_style text NOT NULL DEFAULT 'unknown',
  arrival_date date,
  departure_date date,
  funding_currency text,
  israel_city text,
  accommodation_area text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.member_travel TO authenticated;
GRANT ALL ON public.member_travel TO service_role;
ALTER TABLE public.member_travel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage their own travel details" ON public.member_travel
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ========================================================= updated_at ====
CREATE TRIGGER touch_programmes BEFORE UPDATE ON public.programmes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_programme_cohorts BEFORE UPDATE ON public.programme_cohorts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_programme_memberships BEFORE UPDATE ON public.programme_memberships
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_programme_announcements BEFORE UPDATE ON public.programme_announcements
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_programme_contacts BEFORE UPDATE ON public.programme_contacts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_programme_documents BEFORE UPDATE ON public.programme_documents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_programme_schedule_items BEFORE UPDATE ON public.programme_schedule_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_programme_checklist_items BEFORE UPDATE ON public.programme_checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_programme_checklist_progress BEFORE UPDATE ON public.programme_checklist_progress
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_member_travel BEFORE UPDATE ON public.member_travel
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ====================================================== join + preview ====
CREATE OR REPLACE FUNCTION public.programme_code_preview(_code text)
RETURNS TABLE (
  cohort_id uuid,
  programme_name text,
  cohort_name text,
  organisation text,
  city text,
  starts_on date,
  ends_on date,
  is_demo boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.id, p.name, c.name, p.organisation, p.city, c.starts_on, c.ends_on, c.is_demo
  FROM public.programme_cohorts c
  JOIN public.programmes p ON p.id = c.programme_id
  WHERE upper(c.join_code) = upper(btrim(_code))
    AND c.status = 'open'
    AND p.status = 'active'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.programme_join(_user_id uuid, _code text)
RETURNS programme_memberships
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  target uuid;
  existing public.programme_memberships;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'user required'; END IF;

  SELECT c.id INTO target
    FROM public.programme_cohorts c
    JOIN public.programmes p ON p.id = c.programme_id
   WHERE upper(c.join_code) = upper(btrim(COALESCE(_code, '')))
     AND c.status = 'open'
     AND p.status = 'active'
   LIMIT 1;

  IF target IS NULL THEN
    RAISE EXCEPTION 'That programme code was not recognised';
  END IF;

  SELECT * INTO existing FROM public.programme_memberships
   WHERE user_id = _user_id AND status = 'active';

  IF FOUND AND existing.cohort_id = target THEN
    RETURN existing;
  END IF;

  IF FOUND THEN
    UPDATE public.programme_memberships SET status = 'left', updated_at = now()
     WHERE id = existing.id;
  END IF;

  INSERT INTO public.programme_memberships (user_id, cohort_id)
  VALUES (_user_id, target)
  RETURNING * INTO existing;

  RETURN existing;
END;
$$;

REVOKE ALL ON FUNCTION public.programme_join(uuid, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.programme_join(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.programme_code_preview(text) TO authenticated, service_role;

-- =============================================== clearly fictional demo ====
WITH prog AS (
  INSERT INTO public.programmes (name, organisation, city, is_demo)
  VALUES ('Shekk Demo Programme', 'Shekk (demo content — not a real organisation)', 'Jerusalem', true)
  RETURNING id
), coh AS (
  INSERT INTO public.programme_cohorts (programme_id, name, join_code, welcome_message, starts_on, ends_on, is_demo)
  SELECT id, 'Demo Cohort · Autumn', 'SHEKKDEMO',
         'Welcome to the Shekk demo programme. Everything you see here is sample content so you can explore how a real programme looks inside Shekk.',
         current_date + 21, current_date + 200, true
  FROM prog RETURNING id
)
INSERT INTO public.programme_announcements (cohort_id, title, body, pinned, published_at)
SELECT id, 'Demo: flight details due', 'Please send your flight number and landing time to the office at least two weeks before departure.', true, now() FROM coh
UNION ALL
SELECT id, 'Demo: opening Shabbaton', 'Our opening Shabbaton is in the Old City. Bring smart clothes and a refillable water bottle.', false, now() - interval '2 days' FROM coh;

INSERT INTO public.programme_contacts (cohort_id, name, role, phone, email, is_emergency, sort_order)
SELECT c.id, v.name, v.role, v.phone, v.email, v.emergency, v.ord
FROM public.programme_cohorts c,
LATERAL (VALUES
  ('Demo Programme Office', 'General questions', '+972 2 000 0000', 'demo@example.com', false, 0),
  ('Demo Madrich On Call', 'Evenings and weekends', '+972 50 000 0000', NULL, true, 1),
  ('Israel Emergency Services', 'Ambulance (Magen David Adom)', '101', NULL, true, 2)
) AS v(name, role, phone, email, emergency, ord)
WHERE c.join_code = 'SHEKKDEMO';

INSERT INTO public.programme_documents (cohort_id, label, description, link_url, category, sort_order)
SELECT c.id, v.label, v.descr, v.url, v.cat, v.ord
FROM public.programme_cohorts c,
LATERAL (VALUES
  ('Demo participant handbook', 'Sample handbook placeholder — a real programme would upload its own.', NULL, 'handbook', 0),
  ('Demo packing list', 'What to bring for an Israeli autumn and winter.', NULL, 'packing', 1),
  ('Demo insurance summary', 'Placeholder cover summary for the demo cohort.', NULL, 'insurance', 2)
) AS v(label, descr, url, cat, ord)
WHERE c.join_code = 'SHEKKDEMO';

INSERT INTO public.programme_schedule_items (cohort_id, title, details, location, starts_at, ends_at)
SELECT c.id, v.title, v.details, v.loc, v.starts, v.ends
FROM public.programme_cohorts c,
LATERAL (VALUES
  ('Demo: arrivals and airport pickup', 'Meet your madrichim at Ben Gurion Terminal 3 arrivals hall.', 'Ben Gurion Airport', now() + interval '21 days', now() + interval '21 days 3 hours'),
  ('Demo: orientation morning', 'Programme rules, safety briefing, phones and Rav-Kav.', 'Jerusalem campus', now() + interval '22 days', now() + interval '22 days 4 hours'),
  ('Demo: opening Shabbaton', 'Old City walking tour, dinner and tefillot.', 'Old City, Jerusalem', now() + interval '25 days', now() + interval '27 days')
) AS v(title, details, loc, starts, ends)
WHERE c.join_code = 'SHEKKDEMO';

INSERT INTO public.programme_checklist_items (cohort_id, item_key, title, details, due_on, sort_order)
SELECT c.id, v.k, v.title, v.details, v.due, v.ord
FROM public.programme_cohorts c,
LATERAL (VALUES
  ('flight-details', 'Send your flight details', 'Flight number, landing time and terminal.', current_date + 7, 0),
  ('medical-form', 'Complete the medical form', 'Allergies, medication and emergency contacts.', current_date + 10, 1),
  ('insurance-proof', 'Upload proof of travel insurance', 'A PDF or photo of your policy summary.', current_date + 14, 2),
  ('parent-contacts', 'Confirm parent or guardian contacts', 'Two contactable phone numbers.', NULL, 3)
) AS v(k, title, details, due, ord)
WHERE c.join_code = 'SHEKKDEMO';