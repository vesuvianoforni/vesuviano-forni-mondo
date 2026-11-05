CREATE TABLE public.bruno_voice_settings (
 key text PRIMARY KEY DEFAULT 'default', from_number text NOT NULL DEFAULT '+447457416033', language text NOT NULL DEFAULT 'en', assistant_id text, application_id text, public_key text, configured_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bruno_voice_settings TO authenticated;
GRANT ALL ON public.bruno_voice_settings TO service_role;
ALTER TABLE public.bruno_voice_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY bruno_voice_settings_read ON public.bruno_voice_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE TRIGGER bruno_voice_settings_updated BEFORE UPDATE ON public.bruno_voice_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.bruno_voice_settings(key) VALUES ('default');
CREATE TABLE public.bruno_voice_calls (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), lead_id uuid NOT NULL REFERENCES public.leads(id), requested_by uuid NOT NULL, approved_by uuid, destination text NOT NULL, from_number text NOT NULL DEFAULT '+447457416033', language text NOT NULL DEFAULT 'en', objective text NOT NULL, consent_basis text NOT NULL, customer_timezone text NOT NULL, status text NOT NULL DEFAULT 'proposed', provider_call_id text UNIQUE, approved_at timestamptz, expires_at timestamptz NOT NULL DEFAULT (now()+interval '24 hours'), started_at timestamptz, ended_at timestamptz, summary text, qualification jsonb NOT NULL DEFAULT '{}'::jsonb, error_code text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bruno_voice_calls TO authenticated;
GRANT ALL ON public.bruno_voice_calls TO service_role;
ALTER TABLE public.bruno_voice_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY bruno_voice_calls_read ON public.bruno_voice_calls FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE INDEX bruno_voice_calls_lead_created ON public.bruno_voice_calls(lead_id,created_at DESC);
CREATE TRIGGER bruno_voice_calls_updated BEFORE UPDATE ON public.bruno_voice_calls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.validate_bruno_voice_call() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.language <> 'en' OR NEW.from_number <> '+447457416033' THEN RAISE EXCEPTION 'Voice configuration not allowed'; END IF;
 IF NEW.status NOT IN ('proposed','cancelled','starting','dialing','active','completed','failed','unknown') THEN RAISE EXCEPTION 'Invalid call status'; END IF;
 IF NEW.status IN ('starting','dialing','active','completed','unknown') AND (NEW.approved_at IS NULL OR NEW.approved_by IS NULL) THEN RAISE EXCEPTION 'Call approval required'; END IF;
 IF TG_OP='UPDATE' AND (NEW.lead_id IS DISTINCT FROM OLD.lead_id OR NEW.requested_by IS DISTINCT FROM OLD.requested_by OR NEW.destination IS DISTINCT FROM OLD.destination OR NEW.from_number IS DISTINCT FROM OLD.from_number OR NEW.objective IS DISTINCT FROM OLD.objective OR NEW.consent_basis IS DISTINCT FROM OLD.consent_basis OR NEW.customer_timezone IS DISTINCT FROM OLD.customer_timezone) THEN RAISE EXCEPTION 'Call scope is immutable'; END IF;
 IF TG_OP='UPDATE' AND OLD.status IN ('starting','dialing','active','completed','failed','unknown') AND NEW.status='proposed' THEN RAISE EXCEPTION 'Do not repeat submitted calls'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER bruno_voice_call_validate BEFORE INSERT OR UPDATE ON public.bruno_voice_calls FOR EACH ROW EXECUTE FUNCTION public.validate_bruno_voice_call();