REVOKE ALL ON public.bruno_voice_calls FROM anon,authenticated;
REVOKE ALL ON public.bruno_voice_settings FROM anon,authenticated;
GRANT SELECT ON public.bruno_voice_calls TO authenticated;
GRANT SELECT ON public.bruno_voice_settings TO authenticated;
GRANT ALL ON public.bruno_voice_calls TO service_role;
GRANT ALL ON public.bruno_voice_settings TO service_role;