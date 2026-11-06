ALTER TABLE public.bruno_voice_calls ADD COLUMN IF NOT EXISTS direction text NOT NULL DEFAULT 'outbound';
ALTER TABLE public.bruno_voice_calls ALTER COLUMN requested_by DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS bruno_voice_calls_inbound_provider_uidx ON public.bruno_voice_calls(provider_call_id) WHERE direction = 'inbound' AND provider_call_id IS NOT NULL;
ALTER TABLE public.bruno_voice_settings ADD COLUMN IF NOT EXISTS inbound_assistant_id text, ADD COLUMN IF NOT EXISTS transfer_number text NOT NULL DEFAULT '+3908119237684', ADD COLUMN IF NOT EXISTS inbound_configured_at timestamptz;

CREATE OR REPLACE FUNCTION public.validate_bruno_voice_call()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
BEGIN
 IF NEW.direction NOT IN ('outbound','inbound') THEN RAISE EXCEPTION 'Invalid call direction'; END IF;
 IF NEW.from_number <> '+447457416033' THEN RAISE EXCEPTION 'Voice configuration not allowed'; END IF;
 IF (NEW.direction = 'outbound' AND NEW.language <> 'en') OR NEW.language NOT IN ('en','it','fr','de','es') THEN RAISE EXCEPTION 'Voice configuration not allowed'; END IF;
 IF NEW.status NOT IN ('proposed','cancelled','starting','dialing','active','completed','failed','unknown') THEN RAISE EXCEPTION 'Invalid call status'; END IF;
 IF NEW.direction = 'outbound' AND NEW.requested_by IS NULL THEN RAISE EXCEPTION 'Requester required'; END IF;
 IF NEW.direction = 'inbound' AND (NEW.status = 'proposed' OR NEW.plan_id IS NOT NULL OR NEW.provider_call_id IS NULL) THEN RAISE EXCEPTION 'Invalid inbound call'; END IF;
 IF NEW.status IN ('starting','dialing','active','completed','unknown') AND (NEW.approved_at IS NULL OR (NEW.direction = 'outbound' AND NEW.approved_by IS NULL)) THEN RAISE EXCEPTION 'Call approval required'; END IF;
 IF TG_OP='UPDATE' AND (NEW.direction IS DISTINCT FROM OLD.direction OR NEW.lead_id IS DISTINCT FROM OLD.lead_id OR NEW.requested_by IS DISTINCT FROM OLD.requested_by OR NEW.destination IS DISTINCT FROM OLD.destination OR NEW.from_number IS DISTINCT FROM OLD.from_number OR NEW.objective IS DISTINCT FROM OLD.objective OR NEW.call_type IS DISTINCT FROM OLD.call_type OR NEW.instructions IS DISTINCT FROM OLD.instructions OR NEW.customer_timezone IS DISTINCT FROM OLD.customer_timezone OR NEW.language IS DISTINCT FROM OLD.language) THEN RAISE EXCEPTION 'Call scope is immutable'; END IF;
 IF TG_OP='UPDATE' AND OLD.status IN ('starting','dialing','active','completed','failed','unknown') AND NEW.status='proposed' THEN RAISE EXCEPTION 'Do not repeat submitted calls'; END IF;
 RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.project_bruno_voice_call()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE message_body text;
BEGIN
 IF NEW.started_at IS NULL OR NEW.approved_at IS NULL OR NEW.status NOT IN ('completed','failed','unknown','cancelled') THEN RETURN NEW; END IF;
 IF NEW.direction = 'inbound' THEN
  -- Project inbound calls once the summary is settled so the team alert carries the outcome.
  IF NEW.summary_status = 'pending' AND NEW.status = 'completed' THEN RETURN NEW; END IF;
  message_body := coalesce(nullif(NEW.summary,''),'Chiamata in entrata da '||NEW.destination||' · '||CASE WHEN NEW.error_code='no_conversation' OR NEW.status<>'completed' THEN 'nessuna conversazione' ELSE 'riepilogo non disponibile' END);
  INSERT INTO public.crm_messages(lead_id,channel,direction,sender,subject,body,status,ai_generated,external_id,created_by,created_at,metadata)
  VALUES(NEW.lead_id,'call','inbound','Bruno AI','Chiamata in entrata · Bruno',message_body,'logged',true,'bruno-telnyx:'||NEW.id::text,NULL,NEW.started_at,
  jsonb_build_object('source','bruno_telnyx','voice_call_id',NEW.id,'call_direction','inbound','duration_seconds',NEW.duration_seconds,'call_status',NEW.status,'recording_status',NEW.recording_status,'transcript_status',NEW.transcript_status,'summary_status',NEW.summary_status))
  ON CONFLICT(channel,external_id) WHERE external_id IS NOT NULL DO UPDATE SET body=EXCLUDED.body,metadata=EXCLUDED.metadata
  WHERE crm_messages.metadata->>'source'='bruno_telnyx';
  RETURN NEW;
 END IF;
 message_body := coalesce(nullif(NEW.summary,''),'Telefonata di Bruno · '||CASE NEW.status WHEN 'completed' THEN 'conclusa' WHEN 'failed' THEN 'non riuscita' WHEN 'cancelled' THEN 'annullata' ELSE 'esito da verificare' END);
 INSERT INTO public.crm_messages(lead_id,channel,direction,sender,subject,body,status,ai_generated,external_id,created_by,created_at,metadata)
 VALUES(NEW.lead_id,'call','outbound','Bruno AI','Chiamata Bruno · Inglese',message_body,'logged',true,'bruno-telnyx:'||NEW.id::text,NEW.approved_by,NEW.started_at,
 jsonb_build_object('source','bruno_telnyx','voice_call_id',NEW.id,'duration_seconds',NEW.duration_seconds,'call_status',NEW.status,'recording_status',NEW.recording_status,'transcript_status',NEW.transcript_status,'summary_status',NEW.summary_status))
 ON CONFLICT(channel,external_id) WHERE external_id IS NOT NULL DO UPDATE SET body=EXCLUDED.body,metadata=EXCLUDED.metadata
 WHERE crm_messages.metadata->>'source'='bruno_telnyx';
 RETURN NEW;
END $function$;

-- Callback requested during an inbound call: schedule it through the existing next-activity fields.
CREATE OR REPLACE FUNCTION public.save_bruno_voice_callback(p_call uuid, p_when timestamptz, p_notes text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE c public.bruno_voice_calls;
BEGIN
 SELECT * INTO c FROM public.bruno_voice_calls WHERE id=p_call;
 IF c.id IS NULL OR c.direction<>'inbound' OR c.approved_at IS NULL OR c.started_at IS NULL OR c.started_at<now()-interval '15 minutes' OR c.status NOT IN ('active','completed') THEN RAISE EXCEPTION 'Recent inbound call required'; END IF;
 IF p_notes IS NULL OR length(p_notes) NOT BETWEEN 1 AND 1000 OR p_when IS NULL OR p_when < now() - interval '1 hour' OR p_when > now() + interval '60 days' THEN RAISE EXCEPTION 'Invalid callback'; END IF;
 UPDATE public.leads SET next_activity_type='call', next_activity_date=p_when, next_activity_notes=left('Richiamata chiesta al telefono con Bruno: '||p_notes,1000) WHERE id=c.lead_id;
END $function$;
REVOKE ALL ON FUNCTION public.save_bruno_voice_callback(uuid,timestamptz,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_bruno_voice_callback(uuid,timestamptz,text) TO service_role;