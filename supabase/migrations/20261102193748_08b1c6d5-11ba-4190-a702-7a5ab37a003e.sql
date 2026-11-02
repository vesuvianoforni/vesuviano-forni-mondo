REVOKE ALL ON public.outreach_chat_threads FROM anon,authenticated;
GRANT SELECT,INSERT ON public.outreach_chat_threads TO authenticated;
GRANT UPDATE (archived_at) ON public.outreach_chat_threads TO authenticated;
GRANT ALL ON public.outreach_chat_threads TO service_role;