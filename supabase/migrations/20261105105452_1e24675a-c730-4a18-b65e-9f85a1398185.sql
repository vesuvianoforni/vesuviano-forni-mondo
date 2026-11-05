CREATE UNIQUE INDEX bruno_action_call_start_uidx ON public.bruno_actions(voice_call_id) WHERE tool_name='approve_call' AND voice_call_id IS NOT NULL;
CREATE OR REPLACE FUNCTION public.project_bruno_action_result() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF TG_TABLE_NAME='crm_messages' THEN
  UPDATE public.bruno_actions SET status=CASE WHEN NEW.status IN ('sent','delivered','read','logged') THEN 'completed' WHEN NEW.status='failed' THEN 'failed' ELSE 'running' END,finished_at=CASE WHEN NEW.status IN ('sent','delivered','read','logged','failed') THEN coalesce(finished_at,now()) ELSE finished_at END,error_code=CASE WHEN NEW.status='failed' THEN 'message_failed' ELSE NULL END WHERE message_id=NEW.id AND status NOT IN ('cancelled','expired');
 ELSE
  UPDATE public.bruno_actions SET status=CASE NEW.status WHEN 'completed' THEN 'completed' WHEN 'failed' THEN 'failed' WHEN 'cancelled' THEN 'cancelled' WHEN 'unknown' THEN 'unknown' WHEN 'proposed' THEN 'proposed' ELSE 'running' END,approved_by=coalesce(NEW.approved_by,approved_by),approved_at=coalesce(NEW.approved_at,approved_at),started_at=coalesce(NEW.started_at,started_at),finished_at=CASE WHEN NEW.status IN ('completed','failed','cancelled') THEN coalesce(NEW.ended_at,now()) ELSE finished_at END WHERE voice_call_id=NEW.id AND tool_name='approve_call' AND status NOT IN ('cancelled','expired');
 END IF;
 RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION public.queue_bruno_voice_action() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.status='proposed' THEN
  INSERT INTO public.bruno_actions(lead_id,source,requested_by,request_text,tool_name,args,channel,voice_call_id,expires_at)
  VALUES(NEW.lead_id,'voice',NEW.requested_by,NEW.objective,'approve_call',jsonb_build_object('call_id',NEW.id),'call',NEW.id,NEW.expires_at) ON CONFLICT DO NOTHING;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.queue_bruno_voice_action() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER bruno_voice_queue_action AFTER INSERT ON public.bruno_voice_calls FOR EACH ROW EXECUTE FUNCTION public.queue_bruno_voice_action();
REVOKE ALL ON FUNCTION public.project_bruno_action_result() FROM PUBLIC,anon,authenticated;