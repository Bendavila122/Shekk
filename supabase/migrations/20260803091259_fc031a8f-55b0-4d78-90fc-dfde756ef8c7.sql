REVOKE ALL ON FUNCTION public.in_cohort(uuid, uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.my_cohort_id(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.programme_code_preview(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.in_cohort(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.my_cohort_id(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.programme_code_preview(text) TO authenticated, service_role;