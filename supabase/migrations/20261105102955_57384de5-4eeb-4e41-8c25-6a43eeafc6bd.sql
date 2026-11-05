-- lovable-cron-fallback-reviewed: Event-driven enqueue and signed provider results; five-minute retry is armed only with pending jobs and removed after drain, bounded to 24 attempts per call.
ALTER TABLE public.bruno_voice_calls ADD COLUMN conversation_id text, ADD COLUMN recording_path text, ADD COLUMN recording_status text NOT NULL DEFAULT 'pending', ADD COLUMN transcript jsonb NOT NULL DEFAULT '[]'::jsonb, ADD COLUMN transcript_status text NOT NULL DEFAULT 'pending', ADD COLUMN summary_status text NOT NULL DEFAULT 'pending', ADD COLUMN duration_seconds integer;
CREATE UNIQUE INDEX bruno_voice_conversation_uidx ON public.bruno_voice_calls(conversation_id) WHERE conversation_id IS NOT NULL;
CREATE INDEX bruno_voice_calls_cursor_idx ON public.bruno_voice_calls(created_at DESC,id DESC);

CREATE TABLE public.bruno_voice_result_jobs (
 call_id uuid PRIMARY KEY REFERENCES public.bruno_voice_calls(id) ON DELETE CASCADE,
 token uuid NOT NULL DEFAULT gen_random_uuid(), status text NOT NULL DEFAULT 'queued', attempts integer NOT NULL DEFAULT 0,
 recording_url text, next_attempt_at timestamptz NOT NULL DEFAULT now(), lease_until timestamptz, error_code text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.bruno_voice_result_jobs TO service_role;
ALTER TABLE public.bruno_voice_result_jobs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER bruno_voice_result_jobs_updated BEFORE UPDATE ON public.bruno_voice_result_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY bruno_recordings_staff_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id='bruno-call-recordings' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale')));

CREATE OR REPLACE FUNCTION public.project_bruno_voice_call() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE message_body text;
BEGIN
 IF NEW.started_at IS NULL OR NEW.approved_at IS NULL OR NEW.status NOT IN ('completed','failed','unknown','cancelled') THEN RETURN NEW; END IF;
 message_body := coalesce(nullif(NEW.summary,''),'Telefonata di Bruno · '||CASE NEW.status WHEN 'completed' THEN 'conclusa' WHEN 'failed' THEN 'non riuscita' WHEN 'cancelled' THEN 'annullata' ELSE 'esito da verificare' END);
 INSERT INTO public.crm_messages(lead_id,channel,direction,sender,subject,body,status,ai_generated,external_id,created_by,created_at,metadata)
 VALUES(NEW.lead_id,'call','outbound','Bruno AI','Chiamata Bruno · Inglese',message_body,'logged',true,'bruno-telnyx:'||NEW.id::text,NEW.approved_by,NEW.started_at,
 jsonb_build_object('source','bruno_telnyx','voice_call_id',NEW.id,'duration_seconds',NEW.duration_seconds,'call_status',NEW.status,'recording_status',NEW.recording_status,'transcript_status',NEW.transcript_status,'summary_status',NEW.summary_status))
 ON CONFLICT(channel,external_id) WHERE external_id IS NOT NULL DO UPDATE SET body=EXCLUDED.body,metadata=EXCLUDED.metadata
 WHERE crm_messages.metadata->>'source'='bruno_telnyx';
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.project_bruno_voice_call() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER bruno_voice_crm_projection AFTER INSERT OR UPDATE ON public.bruno_voice_calls FOR EACH ROW EXECUTE FUNCTION public.project_bruno_voice_call();

CREATE OR REPLACE FUNCTION public.claim_bruno_voice_result(p_call uuid,p_token uuid) RETURNS SETOF public.bruno_voice_result_jobs LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 RETURN QUERY UPDATE public.bruno_voice_result_jobs SET status='running',attempts=attempts+1,lease_until=now()+interval '3 minutes'
 WHERE call_id=p_call AND token=p_token AND status IN ('queued','running') AND next_attempt_at<=now() AND (lease_until IS NULL OR lease_until<now()) AND attempts<24 RETURNING *;
END $$;
REVOKE ALL ON FUNCTION public.claim_bruno_voice_result(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_bruno_voice_result(uuid,uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.wake_bruno_voice_result() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.status IN ('queued','running') AND NEW.attempts<24 THEN
  PERFORM pg_advisory_xact_lock(hashtext('bruno-voice-result-schedule'));
  IF NOT EXISTS(SELECT 1 FROM cron.job WHERE jobname='bruno-voice-results') THEN
   PERFORM cron.schedule('bruno-voice-results','*/5 * * * *','SELECT public.kick_bruno_voice_results();');
  END IF;
 END IF;
 IF NEW.status='queued' AND NEW.next_attempt_at<=now() THEN
  PERFORM net.http_post(url:='https://lgueucxznbqgvhpjzurf.supabase.co/functions/v1/bruno-voice',headers:='{"Content-Type":"application/json"}'::jsonb,body:=jsonb_build_object('action','result_job','call_id',NEW.call_id,'token',NEW.token),timeout_milliseconds:=10000);
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.wake_bruno_voice_result() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER bruno_voice_result_wake AFTER INSERT OR UPDATE ON public.bruno_voice_result_jobs FOR EACH ROW EXECUTE FUNCTION public.wake_bruno_voice_result();
CREATE OR REPLACE FUNCTION public.kick_bruno_voice_results() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE j public.bruno_voice_result_jobs;
BEGIN
 FOR j IN SELECT * FROM public.bruno_voice_result_jobs WHERE status IN ('queued','running') AND next_attempt_at<=now() AND (lease_until IS NULL OR lease_until<now()) AND attempts<24 ORDER BY next_attempt_at LIMIT 20 LOOP
  PERFORM net.http_post(url:='https://lgueucxznbqgvhpjzurf.supabase.co/functions/v1/bruno-voice',headers:='{"Content-Type":"application/json"}'::jsonb,body:=jsonb_build_object('action','result_job','call_id',j.call_id,'token',j.token),timeout_milliseconds:=10000);
 END LOOP;
 PERFORM pg_advisory_xact_lock(hashtext('bruno-voice-result-schedule'));
 IF NOT EXISTS(SELECT 1 FROM public.bruno_voice_result_jobs WHERE status IN ('queued','running') AND attempts<24) THEN
  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname='bruno-voice-results';
 END IF;
END $$;
REVOKE ALL ON FUNCTION public.kick_bruno_voice_results() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.kick_bruno_voice_results() TO service_role;