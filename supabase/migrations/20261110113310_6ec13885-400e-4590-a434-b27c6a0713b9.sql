ALTER TABLE public.crm_direct_calls ADD COLUMN telnyx_control_id text, ADD COLUMN telnyx_session_id text, ADD COLUMN provider_verified_at timestamptz, ADD COLUMN recording_status text NOT NULL DEFAULT 'legacy', ADD COLUMN recording_error text, ADD COLUMN summary text;
CREATE UNIQUE INDEX crm_direct_telnyx_control_unique ON public.crm_direct_calls(telnyx_control_id) WHERE telnyx_control_id IS NOT NULL;
CREATE TABLE public.crm_call_results (
 call_id uuid PRIMARY KEY REFERENCES public.crm_direct_calls(id) ON DELETE CASCADE,
 recording_id text NOT NULL UNIQUE, recording_path text, transcript text, summary text,
 status text NOT NULL DEFAULT 'queued', error text, attempts integer NOT NULL DEFAULT 0,
 worker_token uuid NOT NULL DEFAULT gen_random_uuid(), lease_token uuid, lease_until timestamptz,
 next_attempt_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT(call_id,recording_id,recording_path,transcript,summary,status,error,attempts,next_attempt_at,created_at,updated_at) ON public.crm_call_results TO authenticated;
GRANT ALL ON public.crm_call_results TO service_role;
ALTER TABLE public.crm_call_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales staff read direct call results" ON public.crm_call_results FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE TRIGGER touch_crm_call_results BEFORE UPDATE ON public.crm_call_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TABLE public.crm_call_ai_state (key text PRIMARY KEY DEFAULT 'calls', paused boolean NOT NULL DEFAULT false, reason text, provider_denied boolean NOT NULL DEFAULT false, lease_token uuid, lease_until timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT(key,paused,reason,provider_denied,created_at,updated_at) ON public.crm_call_ai_state TO authenticated;
GRANT ALL ON public.crm_call_ai_state TO service_role;
ALTER TABLE public.crm_call_ai_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales staff read call analysis state" ON public.crm_call_ai_state FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
INSERT INTO public.crm_call_ai_state(key) VALUES('calls');
CREATE TRIGGER touch_crm_call_ai_state BEFORE UPDATE ON public.crm_call_ai_state FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE FUNCTION public.claim_crm_call_result(p_call uuid,p_token uuid,p_lease uuid) RETURNS SETOF public.crm_call_results LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 UPDATE public.crm_call_ai_state SET lease_token=p_lease,lease_until=now()+interval '20 minutes' WHERE key='calls' AND NOT paused AND (lease_until IS NULL OR lease_until<now());
 IF NOT FOUND THEN RETURN; END IF;
 RETURN QUERY UPDATE public.crm_call_results SET lease_token=p_lease,lease_until=now()+interval '20 minutes',status='running',attempts=attempts+1 WHERE call_id=p_call AND worker_token=p_token AND status IN ('queued','running') AND attempts<4 AND next_attempt_at<=now() AND (lease_until IS NULL OR lease_until<now()) RETURNING *;
 IF NOT FOUND THEN UPDATE public.crm_call_ai_state SET lease_token=NULL,lease_until=NULL WHERE key='calls' AND lease_token=p_lease; END IF;
END; $$;
REVOKE ALL ON FUNCTION public.claim_crm_call_result(uuid,uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_crm_call_result(uuid,uuid,uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.telegram_direct_call_enqueue() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n public.telegram_notifications;
BEGIN
 IF NEW.status NOT IN ('ended','failed','unknown') THEN RETURN NEW; END IF;
 IF NEW.recording_status NOT IN ('legacy','ready','unavailable','failed') THEN RETURN NEW; END IF;
 IF OLD.status IN ('ended','failed','unknown') AND NEW.recording_status IS NOT DISTINCT FROM OLD.recording_status THEN RETURN NEW; END IF;
 INSERT INTO public.telegram_notifications(kind,lead_id,direct_call_id) VALUES('direct_call',NEW.lead_id,NEW.id) ON CONFLICT DO NOTHING RETURNING * INTO n;
 IF n.id IS NOT NULL THEN
  BEGIN PERFORM net.http_post(url:='https://lgueucxznbqgvhpjzurf.supabase.co/functions/v1/telegram-bruno',headers:='{"Content-Type":"application/json"}'::jsonb,body:=jsonb_build_object('notify_id',n.id,'token',n.token),timeout_milliseconds:=10000); EXCEPTION WHEN OTHERS THEN NULL; END;
 END IF; RETURN NEW;
END; $$;
CREATE OR REPLACE FUNCTION public.telegram_notify_enqueue() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n public.telegram_notifications;
BEGIN
 IF NEW.created_at<now()-interval '2 hours' THEN RETURN NEW; END IF;
 IF TG_TABLE_NAME='crm_messages' THEN
  IF NEW.channel NOT IN ('whatsapp_api','wasender','email','call') THEN RETURN NEW; END IF;
  IF NEW.channel='call' THEN
   IF NEW.metadata->>'source'='bruno_telnyx' AND NEW.metadata->>'summary_status'='pending' THEN RETURN NEW; END IF;
   IF NEW.direction<>'inbound' AND coalesce(NEW.metadata->>'source','')<>'bruno_telnyx' THEN RETURN NEW; END IF;
  ELSIF NEW.direction<>'inbound' THEN RETURN NEW; END IF;
  INSERT INTO public.telegram_notifications(kind,lead_id,message_id) VALUES('message',NEW.lead_id,NEW.id) ON CONFLICT DO NOTHING RETURNING * INTO n;
 ELSE INSERT INTO public.telegram_notifications(kind,lead_id) VALUES('lead',NEW.id) RETURNING * INTO n;
 END IF;
 IF n.id IS NOT NULL THEN BEGIN PERFORM net.http_post(url:='https://lgueucxznbqgvhpjzurf.supabase.co/functions/v1/telegram-bruno',headers:='{"Content-Type":"application/json"}'::jsonb,body:=jsonb_build_object('notify_id',n.id,'token',n.token),timeout_milliseconds:=10000); EXCEPTION WHEN OTHERS THEN NULL; END; END IF;
 RETURN NEW;
END; $$;
CREATE FUNCTION public.telegram_ai_call_summary_enqueue() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.channel='call' AND NEW.metadata->>'source'='bruno_telnyx' AND NEW.metadata->>'summary_status'='ready' AND coalesce(OLD.metadata->>'summary_status','')<>'ready' THEN PERFORM public.telegram_notify_enqueue(); END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER telegram_ai_call_summary AFTER UPDATE ON public.crm_messages FOR EACH ROW WHEN (NEW.channel='call') EXECUTE FUNCTION public.telegram_notify_enqueue();