REVOKE ALL ON FUNCTION public.are_friends(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_blocked_pair(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.shares_cohort(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.in_conversation(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.owes_on_bill(uuid, uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.are_friends(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_blocked_pair(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.shares_cohort(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.in_conversation(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.owes_on_bill(uuid, uuid) TO authenticated, service_role;