-- =========================================================== handles ===
CREATE TABLE public.member_handles (
  user_id uuid PRIMARY KEY,
  handle text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  avatar_url text,
  discoverable boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX member_handles_handle_key ON public.member_handles (lower(handle));
ALTER TABLE public.member_handles
  ADD CONSTRAINT member_handles_handle_format
  CHECK (handle ~ '^[a-z0-9_]{3,20}$');

GRANT SELECT, INSERT, UPDATE ON public.member_handles TO authenticated;
GRANT ALL ON public.member_handles TO service_role;
ALTER TABLE public.member_handles ENABLE ROW LEVEL SECURITY;

-- ========================================================== programs ===
CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'program',
  city text,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programs TO authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  name text NOT NULL,
  join_code text NOT NULL,
  is_public boolean NOT NULL DEFAULT false,
  starts_on date,
  ends_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX cohorts_join_code_key ON public.cohorts (upper(join_code));
GRANT SELECT ON public.cohorts TO authenticated;
GRANT ALL ON public.cohorts TO service_role;
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cohort_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cohort_id, user_id)
);
CREATE INDEX cohort_members_user_idx ON public.cohort_members (user_id);
GRANT SELECT ON public.cohort_members TO authenticated;
GRANT ALL ON public.cohort_members TO service_role;
ALTER TABLE public.cohort_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.shares_cohort(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cohort_members x
    JOIN public.cohort_members y ON y.cohort_id = x.cohort_id
    WHERE x.user_id = _a AND y.user_id = _b
  );
$$;

-- ========================================================= friendships ===
CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  addressee_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  blocked_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (requester_id <> addressee_id),
  CHECK (status IN ('pending','accepted','declined','blocked'))
);
CREATE UNIQUE INDEX friendships_pair_key
  ON public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
CREATE INDEX friendships_addressee_idx ON public.friendships (addressee_id, status);
CREATE INDEX friendships_requester_idx ON public.friendships (requester_id, status);

GRANT SELECT ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.are_friends(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships f
    WHERE f.status = 'accepted'
      AND ((f.requester_id = _a AND f.addressee_id = _b)
        OR (f.requester_id = _b AND f.addressee_id = _a))
  );
$$;

CREATE OR REPLACE FUNCTION public.is_blocked_pair(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships f
    WHERE f.status = 'blocked'
      AND ((f.requester_id = _a AND f.addressee_id = _b)
        OR (f.requester_id = _b AND f.addressee_id = _a))
  );
$$;

-- ============================================================== chat ===
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'dm',
  title text,
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE CASCADE,
  created_by uuid,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (kind IN ('dm','cohort','group'))
);
CREATE UNIQUE INDEX conversations_cohort_key ON public.conversations (cohort_id) WHERE cohort_id IS NOT NULL;
GRANT SELECT ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.conversation_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  last_read_at timestamptz NOT NULL DEFAULT to_timestamp(0),
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);
CREATE INDEX conversation_members_user_idx ON public.conversation_members (user_id);
GRANT SELECT, UPDATE ON public.conversation_members TO authenticated;
GRANT ALL ON public.conversation_members TO service_role;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.in_conversation(_conversation_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_members m
    WHERE m.conversation_id = _conversation_id AND m.user_id = _user_id
  );
$$;

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid,
  kind text NOT NULL DEFAULT 'text',
  body text NOT NULL DEFAULT '',
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (kind IN ('text','payment','request','system')),
  CHECK (length(body) <= 2000)
);
CREATE INDEX messages_conversation_idx ON public.messages (conversation_id, created_at DESC);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ======================================================== split bills ===
CREATE TABLE public.split_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  total_agorot bigint NOT NULL,
  note text NOT NULL DEFAULT '',
  mode text NOT NULL DEFAULT 'even',
  status text NOT NULL DEFAULT 'open',
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (total_agorot > 0),
  CHECK (status IN ('open','settled','cancelled'))
);
CREATE INDEX split_bills_creator_idx ON public.split_bills (creator_id, created_at DESC);
GRANT SELECT ON public.split_bills TO authenticated;
GRANT ALL ON public.split_bills TO service_role;
ALTER TABLE public.split_bills ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.split_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid NOT NULL REFERENCES public.split_bills(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  amount_agorot bigint NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  entry_id uuid,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bill_id, user_id),
  CHECK (amount_agorot > 0),
  CHECK (status IN ('pending','paid','declined'))
);
CREATE INDEX split_shares_user_idx ON public.split_shares (user_id, status);
GRANT SELECT ON public.split_shares TO authenticated;
GRANT ALL ON public.split_shares TO service_role;
ALTER TABLE public.split_shares ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.owes_on_bill(_bill_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.split_shares s
    WHERE s.bill_id = _bill_id AND s.user_id = _user_id
  );
$$;

-- ============================================================ reports ===
CREATE TABLE public.member_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  target_user_id uuid,
  message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  reason text NOT NULL,
  detail text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.member_reports TO authenticated;
GRANT ALL ON public.member_reports TO service_role;
ALTER TABLE public.member_reports ENABLE ROW LEVEL SECURITY;

-- ============================================================ policies ===
CREATE POLICY "Members see discoverable people, friends and themselves"
  ON public.member_handles FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (discoverable AND NOT public.is_blocked_pair(auth.uid(), user_id))
    OR public.are_friends(auth.uid(), user_id)
  );
CREATE POLICY "Members claim their own handle"
  ON public.member_handles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Members edit their own handle"
  ON public.member_handles FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "No direct deletes on handles"
  ON public.member_handles AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);

CREATE POLICY "Public programs are browsable"
  ON public.programs FOR SELECT TO authenticated USING (is_public);
CREATE POLICY "Public cohorts and my own are browsable"
  ON public.cohorts FOR SELECT TO authenticated
  USING (is_public OR EXISTS (
    SELECT 1 FROM public.cohort_members m WHERE m.cohort_id = cohorts.id AND m.user_id = auth.uid()
  ));
CREATE POLICY "Cohort mates are visible to each other"
  ON public.cohort_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.shares_cohort(auth.uid(), user_id));

CREATE POLICY "Members see their own friendships"
  ON public.friendships FOR SELECT TO authenticated
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Members see conversations they are in"
  ON public.conversations FOR SELECT TO authenticated
  USING (public.in_conversation(id, auth.uid()));
CREATE POLICY "Members see who else is in their conversations"
  ON public.conversation_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.in_conversation(conversation_id, auth.uid()));
CREATE POLICY "Members update their own read marker"
  ON public.conversation_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members read messages in their conversations"
  ON public.messages FOR SELECT TO authenticated
  USING (public.in_conversation(conversation_id, auth.uid()));
CREATE POLICY "Members post as themselves in their conversations"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND kind = 'text' AND public.in_conversation(conversation_id, auth.uid()));

CREATE POLICY "Bills are visible to the creator and the people who owe"
  ON public.split_bills FOR SELECT TO authenticated
  USING (creator_id = auth.uid() OR public.owes_on_bill(id, auth.uid()));
CREATE POLICY "Shares are visible to the creator and the owner"
  ON public.split_shares FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.split_bills b WHERE b.id = split_shares.bill_id AND b.creator_id = auth.uid()
  ));

CREATE POLICY "Reporters see their own reports"
  ON public.member_reports FOR SELECT TO authenticated
  USING (reporter_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));

-- ==================================================== member transfers ===
CREATE OR REPLACE FUNCTION public.transfer_post(
  _sender uuid,
  _recipient uuid,
  _amount_agorot bigint,
  _note text DEFAULT NULL,
  _idempotency_key text DEFAULT NULL,
  _daily_cap_agorot bigint DEFAULT 500000
) RETURNS ledger_entries
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  key text := COALESCE(_idempotency_key, gen_random_uuid()::text);
  sender_name text;
  recipient_name text;
  spent_today bigint;
  out_entry public.ledger_entries;
BEGIN
  IF _sender IS NULL OR _recipient IS NULL THEN RAISE EXCEPTION 'user required'; END IF;
  IF _sender = _recipient THEN RAISE EXCEPTION 'cannot send to yourself'; END IF;
  IF _amount_agorot IS NULL OR _amount_agorot <= 0 THEN RAISE EXCEPTION 'amount must be positive'; END IF;
  IF public.is_blocked_pair(_sender, _recipient) THEN RAISE EXCEPTION 'cannot send to this member'; END IF;

  SELECT * INTO out_entry FROM public.ledger_entries
   WHERE user_id = _sender AND idempotency_key = 'p2p-out:' || key;
  IF FOUND THEN RETURN out_entry; END IF;

  SELECT COALESCE(SUM(amount_agorot), 0) INTO spent_today
    FROM public.ledger_entries
   WHERE user_id = _sender
     AND direction = 'debit'
     AND category = 'Friends'
     AND created_at > now() - interval '24 hours';
  IF spent_today + _amount_agorot > _daily_cap_agorot THEN
    RAISE EXCEPTION 'daily sending limit reached';
  END IF;

  SELECT COALESCE(NULLIF(display_name, ''), '@' || handle) INTO sender_name
    FROM public.member_handles WHERE user_id = _sender;
  SELECT COALESCE(NULLIF(display_name, ''), '@' || handle) INTO recipient_name
    FROM public.member_handles WHERE user_id = _recipient;
  sender_name := COALESCE(sender_name, 'A Shekk member');
  recipient_name := COALESCE(recipient_name, 'A Shekk member');

  PERFORM public.ensure_account(_recipient);

  out_entry := public.ledger_post(
    _sender, 'debit', _amount_agorot,
    'Sent to ' || recipient_name,
    'Friends', '👥', recipient_name, _note, 'p2p-out:' || key, NULL
  );

  PERFORM public.ledger_post(
    _recipient, 'credit', _amount_agorot,
    'Received from ' || sender_name,
    'Friends', '👥', sender_name, _note, 'p2p-in:' || key, NULL
  );

  RETURN out_entry;
END;
$$;

REVOKE ALL ON FUNCTION public.transfer_post(uuid, uuid, bigint, text, text, bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.transfer_post(uuid, uuid, bigint, text, text, bigint) TO service_role;

-- ============================================================ realtime ===
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.split_shares;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;