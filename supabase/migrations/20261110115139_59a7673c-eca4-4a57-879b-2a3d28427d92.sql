ALTER TABLE public.crm_direct_calls ADD COLUMN recording_source text NOT NULL DEFAULT 'none';
CREATE TABLE public.crm_call_audio_parts(call_id uuid NOT NULL REFERENCES public.crm_direct_calls(id) ON DELETE CASCADE,ordinal integer NOT NULL,storage_path text NOT NULL UNIQUE,uploaded boolean NOT NULL DEFAULT false,transcript text,duration_seconds integer NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(call_id,ordinal));
GRANT SELECT ON public.crm_call_audio_parts TO authenticated;
GRANT ALL ON public.crm_call_audio_parts TO service_role;
ALTER TABLE public.crm_call_audio_parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales staff read call audio parts" ON public.crm_call_audio_parts FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE TRIGGER touch_crm_call_audio_parts BEFORE UPDATE ON public.crm_call_audio_parts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();