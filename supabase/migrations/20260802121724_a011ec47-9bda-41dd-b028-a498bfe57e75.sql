CREATE TABLE public.official_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track text NOT NULL,
  step_key text NOT NULL,
  title text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  done_at timestamp with time zone,
  due_on date,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, track, step_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.official_tasks TO authenticated;
GRANT ALL ON public.official_tasks TO service_role;
ALTER TABLE public.official_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own tasks" ON public.official_tasks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Members create their own tasks" ON public.official_tasks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members update their own tasks" ON public.official_tasks
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members delete their own tasks" ON public.official_tasks
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER official_tasks_touch BEFORE UPDATE ON public.official_tasks
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.official_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  label text NOT NULL,
  storage_path text NOT NULL,
  mime_type text,
  byte_size integer,
  expires_on date,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.official_documents TO authenticated;
GRANT ALL ON public.official_documents TO service_role;
ALTER TABLE public.official_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own documents" ON public.official_documents
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Members create their own documents" ON public.official_documents
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members update their own documents" ON public.official_documents
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members delete their own documents" ON public.official_documents
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER official_documents_touch BEFORE UPDATE ON public.official_documents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX official_documents_user_idx ON public.official_documents (user_id, created_at DESC);

CREATE POLICY "Members read their own document files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'member-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Members upload their own document files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'member-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Members replace their own document files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'member-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Members remove their own document files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'member-documents' AND auth.uid()::text = (storage.foldername(name))[1]);