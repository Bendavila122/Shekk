CREATE POLICY "Members read own insurance card photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'insurance-cards' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Members upload own insurance card photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'insurance-cards' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Members replace own insurance card photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'insurance-cards' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'insurance-cards' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Members delete own insurance card photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'insurance-cards' AND (storage.foldername(name))[1] = auth.uid()::text);