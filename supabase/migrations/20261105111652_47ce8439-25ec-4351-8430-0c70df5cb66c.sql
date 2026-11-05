ALTER TABLE public.bruno_voice_calls DROP COLUMN consent_basis;
ALTER TABLE public.bruno_voice_calls ADD COLUMN call_type text NOT NULL DEFAULT 'qualifica' CHECK (call_type IN ('qualifica','trattativa'));
ALTER TABLE public.bruno_voice_calls ADD COLUMN instructions text;

CREATE OR REPLACE FUNCTION public.validate_bruno_voice_call() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.language <> 'en' OR NEW.from_number <> '+447457416033' THEN RAISE EXCEPTION 'Voice configuration not allowed'; END IF;
 IF NEW.status NOT IN ('proposed','cancelled','starting','dialing','active','completed','failed','unknown') THEN RAISE EXCEPTION 'Invalid call status'; END IF;
 IF NEW.status IN ('starting','dialing','active','completed','unknown') AND (NEW.approved_at IS NULL OR NEW.approved_by IS NULL) THEN RAISE EXCEPTION 'Call approval required'; END IF;
 IF TG_OP='UPDATE' AND (NEW.lead_id IS DISTINCT FROM OLD.lead_id OR NEW.requested_by IS DISTINCT FROM OLD.requested_by OR NEW.destination IS DISTINCT FROM OLD.destination OR NEW.from_number IS DISTINCT FROM OLD.from_number OR NEW.objective IS DISTINCT FROM OLD.objective OR NEW.call_type IS DISTINCT FROM OLD.call_type OR NEW.instructions IS DISTINCT FROM OLD.instructions OR NEW.customer_timezone IS DISTINCT FROM OLD.customer_timezone) THEN RAISE EXCEPTION 'Call scope is immutable'; END IF;
 IF TG_OP='UPDATE' AND OLD.status IN ('starting','dialing','active','completed','failed','unknown') AND NEW.status='proposed' THEN RAISE EXCEPTION 'Do not repeat submitted calls'; END IF;
 RETURN NEW;
END $$;