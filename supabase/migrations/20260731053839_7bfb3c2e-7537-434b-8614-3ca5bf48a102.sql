-- 1. Lock down SECURITY DEFINER functions -------------------------------------

-- Nobody unauthenticated should be able to call any of these.
REVOKE ALL ON FUNCTION public.shares_cohort(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.ensure_account(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ledger_post(uuid, text, bigint, text, text, text, text, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.hold_settle(uuid, uuid, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.hold_release(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.hold_create(uuid, bigint, text, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.funding_settle(uuid, text, bigint, numeric, numeric, bigint, bigint, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.transfer_post(uuid, uuid, bigint, text, text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_first_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.in_conversation(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.are_friends(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_blocked_pair(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.owes_on_bill(uuid, uuid) FROM PUBLIC, anon;

-- Helpers that row-level access rules evaluate as the signed-in member.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_cohort(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.in_conversation(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.are_friends(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_blocked_pair(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owes_on_bill(uuid, uuid) TO authenticated;

-- Backend/service access stays intact.
GRANT EXECUTE ON FUNCTION public.shares_cohort(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.ensure_account(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.ledger_post(uuid, text, bigint, text, text, text, text, text, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.hold_settle(uuid, uuid, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.hold_release(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.hold_create(uuid, bigint, text, text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.funding_settle(uuid, text, bigint, numeric, numeric, bigint, bigint, text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.transfer_post(uuid, uuid, bigint, text, text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_first_admin(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.in_conversation(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.are_friends(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_blocked_pair(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.owes_on_bill(uuid, uuid) TO service_role;

-- 2. Owner-scoped storage rules for the private KYC bucket --------------------

DROP POLICY IF EXISTS "KYC owners read their own documents" ON storage.objects;
DROP POLICY IF EXISTS "KYC owners upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "KYC owners update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "KYC owners delete their own documents" ON storage.objects;

CREATE POLICY "KYC owners read their own documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "KYC owners upload their own documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "KYC owners update their own documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "KYC owners delete their own documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);