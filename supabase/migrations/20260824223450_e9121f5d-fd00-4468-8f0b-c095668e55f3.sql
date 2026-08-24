REVOKE ALL ON FUNCTION public.programme_rsvp_capacity_guard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.programme_vote_guard() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.is_programme_staff(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_programme_owner(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cohort_programme_id(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.staff_can(uuid, uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cohort_staff_can(uuid, uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_cohort_staff(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.group_cohort_id(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.audience_allows(text, uuid, text, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.event_cohort_id(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.vote_cohort_id(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_programme_staff(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_programme_owner(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cohort_programme_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.staff_can(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cohort_staff_can(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_cohort_staff(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.group_cohort_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.audience_allows(text, uuid, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.event_cohort_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vote_cohort_id(uuid) TO authenticated;