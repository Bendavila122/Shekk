-- ═══════════════════════════════ 1. Programme + cohort detail ═══════════════════════════════

ALTER TABLE public.programmes
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS programme_type text NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid;

CREATE UNIQUE INDEX IF NOT EXISTS programmes_slug_key ON public.programmes (lower(slug)) WHERE slug IS NOT NULL;

ALTER TABLE public.programme_cohorts
  ADD COLUMN IF NOT EXISTS year text,
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Asia/Jerusalem';

-- ═══════════════════════════════ 2. Staff ═══════════════════════════════

CREATE TABLE IF NOT EXISTS public.programme_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('owner','staff')),
  permissions text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (programme_id, user_id)
);
GRANT SELECT ON public.programme_staff TO authenticated;
GRANT ALL ON public.programme_staff TO service_role;
ALTER TABLE public.programme_staff ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER programme_staff_touch BEFORE UPDATE ON public.programme_staff
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.is_programme_staff(_programme_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.programme_staff s
                 WHERE s.programme_id = _programme_id AND s.user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_programme_owner(_programme_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.programme_staff s
                 WHERE s.programme_id = _programme_id AND s.user_id = _user_id AND s.role = 'owner');
$$;

CREATE OR REPLACE FUNCTION public.cohort_programme_id(_cohort_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.programme_id FROM public.programme_cohorts c WHERE c.id = _cohort_id;
$$;

-- Owners may do anything; staff fall back to a sensible default permission set.
CREATE OR REPLACE FUNCTION public.staff_can(_programme_id uuid, _user_id uuid, _perm text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.programme_staff s
    WHERE s.programme_id = _programme_id AND s.user_id = _user_id
      AND (
        s.role = 'owner'
        OR _perm = ANY (s.permissions)
        OR (cardinality(s.permissions) = 0 AND _perm IN
            ('events','announcements','participants','groups','documents','votes','acknowledgements','checklists','contacts','places'))
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.cohort_staff_can(_cohort_id uuid, _user_id uuid, _perm text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.staff_can(public.cohort_programme_id(_cohort_id), _user_id, _perm);
$$;

CREATE OR REPLACE FUNCTION public.is_cohort_staff(_cohort_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_programme_staff(public.cohort_programme_id(_cohort_id), _user_id);
$$;

CREATE POLICY "Staff read their programme staff list" ON public.programme_staff
  FOR SELECT TO authenticated USING (public.is_programme_staff(programme_id, auth.uid()) OR user_id = auth.uid());

-- ═══════════════════════════════ 3. Groups ═══════════════════════════════

CREATE TABLE IF NOT EXISTS public.programme_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.programme_cohorts(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  colour text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programme_groups TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.programme_groups TO authenticated;
GRANT ALL ON public.programme_groups TO service_role;
ALTER TABLE public.programme_groups ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER programme_groups_touch BEFORE UPDATE ON public.programme_groups
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX IF NOT EXISTS programme_groups_cohort_idx ON public.programme_groups(cohort_id);

CREATE TABLE IF NOT EXISTS public.programme_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.programme_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.programme_group_members TO authenticated;
GRANT ALL ON public.programme_group_members TO service_role;
ALTER TABLE public.programme_group_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS programme_group_members_user_idx ON public.programme_group_members(user_id);

CREATE OR REPLACE FUNCTION public.group_cohort_id(_group_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT g.cohort_id FROM public.programme_groups g WHERE g.id = _group_id;
$$;

CREATE POLICY "Cohort members read groups" ON public.programme_groups
  FOR SELECT TO authenticated USING (public.in_cohort(cohort_id, auth.uid()) OR public.is_cohort_staff(cohort_id, auth.uid()));
CREATE POLICY "Staff write groups" ON public.programme_groups
  FOR ALL TO authenticated
  USING (public.cohort_staff_can(cohort_id, auth.uid(), 'groups'))
  WITH CHECK (public.cohort_staff_can(cohort_id, auth.uid(), 'groups'));

CREATE POLICY "Members read group membership" ON public.programme_group_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_cohort_staff(public.group_cohort_id(group_id), auth.uid()));
CREATE POLICY "Staff manage group membership" ON public.programme_group_members
  FOR ALL TO authenticated
  USING (public.cohort_staff_can(public.group_cohort_id(group_id), auth.uid(), 'groups'))
  WITH CHECK (public.cohort_staff_can(public.group_cohort_id(group_id), auth.uid(), 'groups'));

-- ═══════════════════════════════ 4. Audience targeting ═══════════════════════════════

CREATE TABLE IF NOT EXISTS public.programme_audiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.programme_cohorts(id) ON DELETE CASCADE,
  subject_type text NOT NULL CHECK (subject_type IN ('event','announcement','vote','checklist_item','document','contact','place')),
  subject_id uuid NOT NULL,
  group_id uuid REFERENCES public.programme_groups(id) ON DELETE CASCADE,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((group_id IS NOT NULL) <> (user_id IS NOT NULL))
);
GRANT SELECT, INSERT, DELETE ON public.programme_audiences TO authenticated;
GRANT ALL ON public.programme_audiences TO service_role;
ALTER TABLE public.programme_audiences ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS programme_audiences_subject_idx ON public.programme_audiences(subject_type, subject_id);
CREATE INDEX IF NOT EXISTS programme_audiences_user_idx ON public.programme_audiences(user_id);

CREATE POLICY "Audience rows follow the cohort" ON public.programme_audiences
  FOR SELECT TO authenticated
  USING (public.in_cohort(cohort_id, auth.uid()) OR public.is_cohort_staff(cohort_id, auth.uid()));
CREATE POLICY "Staff manage audiences" ON public.programme_audiences
  FOR ALL TO authenticated
  USING (public.is_cohort_staff(cohort_id, auth.uid()))
  WITH CHECK (public.is_cohort_staff(cohort_id, auth.uid()));

-- Does this participant fall inside the audience of a targeted row?
CREATE OR REPLACE FUNCTION public.audience_allows(_subject_type text, _subject_id uuid, _kind text, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN _kind IS NULL OR _kind = 'everyone' THEN true
    ELSE EXISTS (
      SELECT 1 FROM public.programme_audiences a
      WHERE a.subject_type = _subject_type AND a.subject_id = _subject_id
        AND (
          a.user_id = _user_id
          OR (a.group_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.programme_group_members m
                WHERE m.group_id = a.group_id AND m.user_id = _user_id))
        )
    )
  END;
$$;

-- ═══════════════════════════════ 5. Live events ═══════════════════════════════

CREATE TABLE IF NOT EXISTS public.programme_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.programme_cohorts(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  original_starts_at timestamptz,
  timezone text NOT NULL DEFAULT 'Asia/Jerusalem',
  location_label text,
  meeting_point text,
  google_place_id text,
  latitude double precision,
  longitude double precision,
  online_url text,
  event_type text NOT NULL DEFAULT 'activity',
  mandatory boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','confirmed','tentative','delayed','moved','cancelled','completed')),
  status_note text,
  audience_kind text NOT NULL DEFAULT 'everyone' CHECK (audience_kind IN ('everyone','groups','individuals')),
  rsvp_enabled boolean NOT NULL DEFAULT false,
  capacity integer,
  requires_ack boolean NOT NULL DEFAULT false,
  urgent boolean NOT NULL DEFAULT false,
  created_by uuid,
  updated_by uuid,
  last_changed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programme_events TO authenticated;
GRANT ALL ON public.programme_events TO service_role;
ALTER TABLE public.programme_events ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER programme_events_touch BEFORE UPDATE ON public.programme_events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX IF NOT EXISTS programme_events_cohort_starts_idx ON public.programme_events(cohort_id, starts_at);

CREATE POLICY "Participants read events aimed at them" ON public.programme_events
  FOR SELECT TO authenticated
  USING (
    public.is_cohort_staff(cohort_id, auth.uid())
    OR (public.in_cohort(cohort_id, auth.uid())
        AND public.audience_allows('event', id, audience_kind, auth.uid()))
  );
CREATE POLICY "Staff write events" ON public.programme_events
  FOR ALL TO authenticated
  USING (public.cohort_staff_can(cohort_id, auth.uid(), 'events'))
  WITH CHECK (public.cohort_staff_can(cohort_id, auth.uid(), 'events'));

CREATE TABLE IF NOT EXISTS public.programme_event_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.programme_events(id) ON DELETE CASCADE,
  cohort_id uuid NOT NULL REFERENCES public.programme_cohorts(id) ON DELETE CASCADE,
  field text NOT NULL,
  before_value text,
  after_value text,
  note text,
  notify_level text NOT NULL DEFAULT 'silent' CHECK (notify_level IN ('silent','notify','urgent')),
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.programme_event_changes TO authenticated;
GRANT ALL ON public.programme_event_changes TO service_role;
ALTER TABLE public.programme_event_changes ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS programme_event_changes_event_idx ON public.programme_event_changes(event_id, changed_at DESC);

CREATE POLICY "Cohort reads event history" ON public.programme_event_changes
  FOR SELECT TO authenticated
  USING (public.in_cohort(cohort_id, auth.uid()) OR public.is_cohort_staff(cohort_id, auth.uid()));
CREATE POLICY "Staff record event history" ON public.programme_event_changes
  FOR INSERT TO authenticated
  WITH CHECK (public.cohort_staff_can(cohort_id, auth.uid(), 'events'));

CREATE TABLE IF NOT EXISTS public.programme_event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.programme_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  response text NOT NULL CHECK (response IN ('going','maybe','not_going')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programme_event_rsvps TO authenticated;
GRANT ALL ON public.programme_event_rsvps TO service_role;
ALTER TABLE public.programme_event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER programme_event_rsvps_touch BEFORE UPDATE ON public.programme_event_rsvps
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.event_cohort_id(_event_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT e.cohort_id FROM public.programme_events e WHERE e.id = _event_id;
$$;

CREATE POLICY "Members manage their own RSVP" ON public.programme_event_rsvps
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND public.in_cohort(public.event_cohort_id(event_id), auth.uid()));
CREATE POLICY "Staff read RSVPs" ON public.programme_event_rsvps
  FOR SELECT TO authenticated
  USING (public.is_cohort_staff(public.event_cohort_id(event_id), auth.uid()));

-- Capacity guard: a full event cannot take another "going".
CREATE OR REPLACE FUNCTION public.programme_rsvp_capacity_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cap integer; going integer;
BEGIN
  IF NEW.response <> 'going' THEN RETURN NEW; END IF;
  SELECT capacity INTO cap FROM public.programme_events WHERE id = NEW.event_id;
  IF cap IS NULL OR cap <= 0 THEN RETURN NEW; END IF;
  SELECT count(*) INTO going FROM public.programme_event_rsvps
   WHERE event_id = NEW.event_id AND response = 'going' AND user_id <> NEW.user_id;
  IF going >= cap THEN RAISE EXCEPTION 'This event is full'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER programme_rsvp_capacity BEFORE INSERT OR UPDATE ON public.programme_event_rsvps
  FOR EACH ROW EXECUTE FUNCTION public.programme_rsvp_capacity_guard();

-- ═══════════════════════════════ 6. Announcements ═══════════════════════════════

ALTER TABLE public.programme_announcements
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal','important','urgent')),
  ADD COLUMN IF NOT EXISTS audience_kind text NOT NULL DEFAULT 'everyone' CHECK (audience_kind IN ('everyone','groups','individuals')),
  ADD COLUMN IF NOT EXISTS requires_ack boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.programme_events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS link_url text,
  ADD COLUMN IF NOT EXISTS created_by uuid;

DROP POLICY IF EXISTS "Cohort members read announcements" ON public.programme_announcements;
CREATE POLICY "Cohort members read announcements" ON public.programme_announcements
  FOR SELECT TO authenticated
  USING (
    public.is_cohort_staff(cohort_id, auth.uid())
    OR (public.in_cohort(cohort_id, auth.uid())
        AND public.audience_allows('announcement', id, audience_kind, auth.uid()))
  );
CREATE POLICY "Staff write announcements" ON public.programme_announcements
  FOR ALL TO authenticated
  USING (public.cohort_staff_can(cohort_id, auth.uid(), 'announcements'))
  WITH CHECK (public.cohort_staff_can(cohort_id, auth.uid(), 'announcements'));
GRANT INSERT, UPDATE, DELETE ON public.programme_announcements TO authenticated;

-- ═══════════════════════════════ 7. Acknowledgements ═══════════════════════════════

CREATE TABLE IF NOT EXISTS public.programme_acknowledgements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.programme_cohorts(id) ON DELETE CASCADE,
  subject_type text NOT NULL CHECK (subject_type IN ('event','announcement')),
  subject_id uuid NOT NULL,
  user_id uuid NOT NULL,
  acknowledged_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subject_type, subject_id, user_id)
);
GRANT SELECT, INSERT ON public.programme_acknowledgements TO authenticated;
GRANT ALL ON public.programme_acknowledgements TO service_role;
ALTER TABLE public.programme_acknowledgements ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS programme_ack_subject_idx ON public.programme_acknowledgements(subject_type, subject_id);

CREATE POLICY "Members read their acknowledgements" ON public.programme_acknowledgements
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_cohort_staff(cohort_id, auth.uid()));
CREATE POLICY "Members acknowledge for themselves" ON public.programme_acknowledgements
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.in_cohort(cohort_id, auth.uid()));

-- ═══════════════════════════════ 8. Votes ═══════════════════════════════

CREATE TABLE IF NOT EXISTS public.programme_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.programme_cohorts(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.programme_events(id) ON DELETE SET NULL,
  question text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  anonymous boolean NOT NULL DEFAULT true,
  allow_change boolean NOT NULL DEFAULT true,
  results_visible boolean NOT NULL DEFAULT true,
  audience_kind text NOT NULL DEFAULT 'everyone' CHECK (audience_kind IN ('everyone','groups','individuals')),
  closes_at timestamptz,
  closed_at timestamptz,
  winning_option_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programme_votes TO authenticated;
GRANT ALL ON public.programme_votes TO service_role;
ALTER TABLE public.programme_votes ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER programme_votes_touch BEFORE UPDATE ON public.programme_votes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE POLICY "Participants read votes aimed at them" ON public.programme_votes
  FOR SELECT TO authenticated
  USING (
    public.is_cohort_staff(cohort_id, auth.uid())
    OR (public.in_cohort(cohort_id, auth.uid())
        AND public.audience_allows('vote', id, audience_kind, auth.uid()))
  );
CREATE POLICY "Staff write votes" ON public.programme_votes
  FOR ALL TO authenticated
  USING (public.cohort_staff_can(cohort_id, auth.uid(), 'votes'))
  WITH CHECK (public.cohort_staff_can(cohort_id, auth.uid(), 'votes'));

CREATE TABLE IF NOT EXISTS public.programme_vote_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id uuid NOT NULL REFERENCES public.programme_votes(id) ON DELETE CASCADE,
  label text NOT NULL,
  detail text,
  capacity integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programme_vote_options TO authenticated;
GRANT ALL ON public.programme_vote_options TO service_role;
ALTER TABLE public.programme_vote_options ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.vote_cohort_id(_vote_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT v.cohort_id FROM public.programme_votes v WHERE v.id = _vote_id;
$$;

CREATE POLICY "Cohort reads vote options" ON public.programme_vote_options
  FOR SELECT TO authenticated
  USING (public.in_cohort(public.vote_cohort_id(vote_id), auth.uid())
      OR public.is_cohort_staff(public.vote_cohort_id(vote_id), auth.uid()));
CREATE POLICY "Staff write vote options" ON public.programme_vote_options
  FOR ALL TO authenticated
  USING (public.cohort_staff_can(public.vote_cohort_id(vote_id), auth.uid(), 'votes'))
  WITH CHECK (public.cohort_staff_can(public.vote_cohort_id(vote_id), auth.uid(), 'votes'));

CREATE TABLE IF NOT EXISTS public.programme_vote_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id uuid NOT NULL REFERENCES public.programme_votes(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES public.programme_vote_options(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vote_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programme_vote_responses TO authenticated;
GRANT ALL ON public.programme_vote_responses TO service_role;
ALTER TABLE public.programme_vote_responses ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER programme_vote_responses_touch BEFORE UPDATE ON public.programme_vote_responses
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE POLICY "Members manage their own vote" ON public.programme_vote_responses
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND public.in_cohort(public.vote_cohort_id(vote_id), auth.uid()));
CREATE POLICY "Staff read vote responses" ON public.programme_vote_responses
  FOR SELECT TO authenticated
  USING (public.is_cohort_staff(public.vote_cohort_id(vote_id), auth.uid()));

-- A closed vote takes no more responses; a locked vote takes no changes; options must be full.
CREATE OR REPLACE FUNCTION public.programme_vote_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v public.programme_votes; cap integer; taken integer;
BEGIN
  SELECT * INTO v FROM public.programme_votes WHERE id = NEW.vote_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'vote not found'; END IF;
  IF v.status <> 'open' THEN RAISE EXCEPTION 'This vote is closed'; END IF;
  IF TG_OP = 'UPDATE' AND NOT v.allow_change THEN
    RAISE EXCEPTION 'You have already voted';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.programme_vote_options o WHERE o.id = NEW.option_id AND o.vote_id = NEW.vote_id) THEN
    RAISE EXCEPTION 'That option is not part of this vote';
  END IF;
  SELECT capacity INTO cap FROM public.programme_vote_options WHERE id = NEW.option_id;
  IF cap IS NOT NULL AND cap > 0 THEN
    SELECT count(*) INTO taken FROM public.programme_vote_responses
     WHERE option_id = NEW.option_id AND user_id <> NEW.user_id;
    IF taken >= cap THEN RAISE EXCEPTION 'That option is full'; END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER programme_vote_response_guard BEFORE INSERT OR UPDATE ON public.programme_vote_responses
  FOR EACH ROW EXECUTE FUNCTION public.programme_vote_guard();

ALTER TABLE public.programme_votes
  ADD CONSTRAINT programme_votes_winner_fk FOREIGN KEY (winning_option_id)
  REFERENCES public.programme_vote_options(id) ON DELETE SET NULL;

-- ═══════════════════════════════ 9. Checklists ═══════════════════════════════

ALTER TABLE public.programme_checklist_items
  ADD COLUMN IF NOT EXISTS audience_kind text NOT NULL DEFAULT 'everyone' CHECK (audience_kind IN ('everyone','groups','individuals')),
  ADD COLUMN IF NOT EXISTS required boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS action_url text,
  ADD COLUMN IF NOT EXISTS feature_key text;

DROP POLICY IF EXISTS "Cohort members read checklist" ON public.programme_checklist_items;
CREATE POLICY "Cohort members read checklist" ON public.programme_checklist_items
  FOR SELECT TO authenticated
  USING (
    public.is_cohort_staff(cohort_id, auth.uid())
    OR (public.in_cohort(cohort_id, auth.uid())
        AND public.audience_allows('checklist_item', id, audience_kind, auth.uid()))
  );
CREATE POLICY "Staff write checklist items" ON public.programme_checklist_items
  FOR ALL TO authenticated
  USING (public.cohort_staff_can(cohort_id, auth.uid(), 'checklists'))
  WITH CHECK (public.cohort_staff_can(cohort_id, auth.uid(), 'checklists'));
GRANT INSERT, UPDATE, DELETE ON public.programme_checklist_items TO authenticated;

CREATE POLICY "Staff read checklist progress" ON public.programme_checklist_progress
  FOR SELECT TO authenticated
  USING (public.is_cohort_staff(
    (SELECT i.cohort_id FROM public.programme_checklist_items i WHERE i.id = item_id), auth.uid()));

-- ═══════════════════════════════ 10. Documents, contacts, places ═══════════════════════════════

ALTER TABLE public.programme_documents
  ADD COLUMN IF NOT EXISTS audience_kind text NOT NULL DEFAULT 'everyone' CHECK (audience_kind IN ('everyone','groups','individuals')),
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS byte_size integer,
  ADD COLUMN IF NOT EXISTS created_by uuid;

DROP POLICY IF EXISTS "Cohort members read documents" ON public.programme_documents;
CREATE POLICY "Cohort members read documents" ON public.programme_documents
  FOR SELECT TO authenticated
  USING (
    public.is_cohort_staff(cohort_id, auth.uid())
    OR (public.in_cohort(cohort_id, auth.uid())
        AND public.audience_allows('document', id, audience_kind, auth.uid()))
  );
CREATE POLICY "Staff write documents" ON public.programme_documents
  FOR ALL TO authenticated
  USING (public.cohort_staff_can(cohort_id, auth.uid(), 'documents'))
  WITH CHECK (public.cohort_staff_can(cohort_id, auth.uid(), 'documents'));
GRANT INSERT, UPDATE, DELETE ON public.programme_documents TO authenticated;

ALTER TABLE public.programme_contacts
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS availability text,
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS audience_kind text NOT NULL DEFAULT 'everyone' CHECK (audience_kind IN ('everyone','groups','individuals'));

DROP POLICY IF EXISTS "Cohort members read contacts" ON public.programme_contacts;
CREATE POLICY "Cohort members read contacts" ON public.programme_contacts
  FOR SELECT TO authenticated
  USING (
    public.is_cohort_staff(cohort_id, auth.uid())
    OR (public.in_cohort(cohort_id, auth.uid())
        AND public.audience_allows('contact', id, audience_kind, auth.uid()))
  );
CREATE POLICY "Staff write contacts" ON public.programme_contacts
  FOR ALL TO authenticated
  USING (public.cohort_staff_can(cohort_id, auth.uid(), 'contacts'))
  WITH CHECK (public.cohort_staff_can(cohort_id, auth.uid(), 'contacts'));
GRANT INSERT, UPDATE, DELETE ON public.programme_contacts TO authenticated;

CREATE TABLE IF NOT EXISTS public.programme_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.programme_cohorts(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'other',
  label text NOT NULL,
  notes text,
  meeting_instructions text,
  google_place_id text,
  address text,
  latitude double precision,
  longitude double precision,
  audience_kind text NOT NULL DEFAULT 'everyone' CHECK (audience_kind IN ('everyone','groups','individuals')),
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programme_places TO authenticated;
GRANT ALL ON public.programme_places TO service_role;
ALTER TABLE public.programme_places ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER programme_places_touch BEFORE UPDATE ON public.programme_places
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE POLICY "Participants read programme places" ON public.programme_places
  FOR SELECT TO authenticated
  USING (
    public.is_cohort_staff(cohort_id, auth.uid())
    OR (public.in_cohort(cohort_id, auth.uid())
        AND public.audience_allows('place', id, audience_kind, auth.uid()))
  );
CREATE POLICY "Staff write programme places" ON public.programme_places
  FOR ALL TO authenticated
  USING (public.cohort_staff_can(cohort_id, auth.uid(), 'places'))
  WITH CHECK (public.cohort_staff_can(cohort_id, auth.uid(), 'places'));

-- ═══════════════════════════════ 11. Invites ═══════════════════════════════

CREATE TABLE IF NOT EXISTS public.programme_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
  cohort_id uuid REFERENCES public.programme_cohorts(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'claim' CHECK (kind IN ('claim','staff')),
  role text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner','staff')),
  code text NOT NULL UNIQUE,
  email text,
  note text,
  expires_at timestamptz,
  accepted_by uuid,
  accepted_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programme_invites TO authenticated;
GRANT ALL ON public.programme_invites TO service_role;
ALTER TABLE public.programme_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read their programme invites" ON public.programme_invites
  FOR SELECT TO authenticated USING (public.is_programme_staff(programme_id, auth.uid()));

-- ═══════════════════════════════ 12. In-app notifications ═══════════════════════════════

CREATE TABLE IF NOT EXISTS public.programme_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cohort_id uuid NOT NULL REFERENCES public.programme_cohorts(id) ON DELETE CASCADE,
  level text NOT NULL DEFAULT 'notify' CHECK (level IN ('notify','urgent')),
  title text NOT NULL,
  body text,
  subject_type text CHECK (subject_type IN ('event','announcement','vote')),
  subject_id uuid,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.programme_notifications TO authenticated;
GRANT ALL ON public.programme_notifications TO service_role;
ALTER TABLE public.programme_notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS programme_notifications_user_idx ON public.programme_notifications(user_id, created_at DESC);

CREATE POLICY "Members read their notifications" ON public.programme_notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Members mark their notifications read" ON public.programme_notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ═══════════════════════════════ 13. Staff visibility of programme + roster ═══════════════════════════════

CREATE POLICY "Staff read their programmes" ON public.programmes
  FOR SELECT TO authenticated USING (public.is_programme_staff(id, auth.uid()));
CREATE POLICY "Staff read their cohorts" ON public.programme_cohorts
  FOR SELECT TO authenticated USING (public.is_programme_staff(programme_id, auth.uid()));
CREATE POLICY "Staff read cohort roster" ON public.programme_memberships
  FOR SELECT TO authenticated USING (public.is_cohort_staff(cohort_id, auth.uid()));
CREATE POLICY "Staff update cohort roster" ON public.programme_memberships
  FOR UPDATE TO authenticated
  USING (public.cohort_staff_can(cohort_id, auth.uid(), 'participants'))
  WITH CHECK (public.cohort_staff_can(cohort_id, auth.uid(), 'participants'));
GRANT UPDATE ON public.programme_memberships TO authenticated;