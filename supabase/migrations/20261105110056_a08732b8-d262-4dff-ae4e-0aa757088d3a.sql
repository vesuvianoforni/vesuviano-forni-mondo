CREATE OR REPLACE FUNCTION public.cancel_bruno_action(p_id uuid,p_user uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.bruno_actions; cancelled_id uuid;
BEGIN
 IF NOT(public.has_role(p_user,'admin') OR public.has_role(p_user,'commerciale')) THEN RAISE EXCEPTION 'forbidden'; END IF;
 SELECT * INTO a FROM public.bruno_actions WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR a.status<>'proposed' THEN RETURN false; END IF;
 IF a.tool_name='approve_call' AND a.voice_call_id IS NOT NULL THEN
  UPDATE public.bruno_voice_calls SET status='cancelled' WHERE id=a.voice_call_id AND status='proposed' RETURNING id INTO cancelled_id;
  IF cancelled_id IS NULL THEN RETURN false; END IF;
 END IF;
 UPDATE public.bruno_actions SET status='cancelled',finished_at=now() WHERE id=p_id AND status='proposed';
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.cancel_bruno_action(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_bruno_action(uuid,uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.project_bruno_action_result() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF;
 IF TG_TABLE_NAME='crm_messages' THEN
  UPDATE public.bruno_actions SET status=CASE WHEN NEW.status IN ('sent','delivered','read','logged') THEN 'completed' WHEN NEW.status='failed' THEN 'failed' WHEN status IN ('completed','failed','unknown') THEN status ELSE 'running' END,finished_at=CASE WHEN NEW.status IN ('sent','delivered','read','logged','failed') THEN coalesce(finished_at,now()) ELSE finished_at END,error_code=CASE WHEN NEW.status='failed' THEN 'message_failed' ELSE error_code END WHERE message_id=NEW.id AND status NOT IN ('cancelled','expired','proposed');
 ELSIF NEW.status<>'proposed' THEN
  UPDATE public.bruno_actions SET status=CASE NEW.status WHEN 'completed' THEN 'completed' WHEN 'failed' THEN 'failed' WHEN 'cancelled' THEN 'cancelled' WHEN 'unknown' THEN 'unknown' ELSE 'running' END,approved_by=coalesce(NEW.approved_by,approved_by),approved_at=coalesce(NEW.approved_at,approved_at),started_at=coalesce(NEW.started_at,started_at),finished_at=CASE WHEN NEW.status IN ('completed','failed','cancelled') THEN coalesce(NEW.ended_at,now()) ELSE finished_at END WHERE voice_call_id=NEW.id AND tool_name='approve_call' AND status NOT IN ('cancelled','expired');
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.project_bruno_action_result() FROM PUBLIC,anon,authenticated;