CREATE TABLE public.setup_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  task_key text NOT NULL,
  done boolean NOT NULL DEFAULT true,
  done_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, task_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.setup_tasks TO authenticated;
GRANT ALL ON public.setup_tasks TO service_role;
ALTER TABLE public.setup_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage their own setup tasks" ON public.setup_tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER setup_tasks_touch BEFORE UPDATE ON public.setup_tasks FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.money_waitlist (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  email text,
  interests text[] NOT NULL DEFAULT '{}',
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.money_waitlist TO authenticated;
GRANT ALL ON public.money_waitlist TO service_role;
ALTER TABLE public.money_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members join the money waitlist" ON public.money_waitlist FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members see their own waitlist entry" ON public.money_waitlist FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins see the money waitlist" ON public.money_waitlist FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  name text NOT NULL,
  props jsonb NOT NULL DEFAULT '{}',
  path text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX analytics_events_name_created_idx ON public.analytics_events (name, created_at DESC);
GRANT INSERT ON public.analytics_events TO authenticated, anon;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone may record an event" ON public.analytics_events FOR INSERT TO authenticated, anon WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Admins read analytics" ON public.analytics_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));