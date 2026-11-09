REVOKE ALL ON public.crm_direct_calls FROM anon, authenticated;
GRANT SELECT ON public.crm_direct_calls TO authenticated;
GRANT ALL ON public.crm_direct_calls TO service_role;