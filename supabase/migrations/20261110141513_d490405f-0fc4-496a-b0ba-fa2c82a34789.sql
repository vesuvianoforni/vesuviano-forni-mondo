REVOKE ALL ON public.crm_inbound_calls FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.crm_inbound_calls FROM authenticated;
CREATE OR REPLACE FUNCTION public.apply_crm_inbound_event(p_id uuid, p_status text, p_forward_status text DEFAULT NULL, p_forward_call_id text DEFAULT NULL, p_duration integer DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
 IF p_status NOT IN ('received','ringing','answered','completed','missed','busy','failed','unknown') THEN RAISE EXCEPTION 'Invalid inbound status'; END IF;
 IF p_duration IS NOT NULL AND (p_duration < 0 OR p_duration > 86400) THEN RAISE EXCEPTION 'Invalid call duration'; END IF;
 UPDATE public.crm_inbound_calls SET
 status = CASE
  WHEN p_forward_status IS NOT NULL AND status = 'unknown' THEN p_status
  WHEN status IN ('completed','missed','busy','failed') THEN status
  WHEN status='unknown' AND p_status IN ('received','ringing','answered') THEN status
  WHEN status = 'answered' AND p_status IN ('received','ringing') THEN status
  ELSE p_status END,
 forward_status = CASE WHEN forward_status IN ('completed','no-answer','busy','failed','canceled') THEN forward_status ELSE COALESCE(p_forward_status,forward_status) END,
 forward_call_id = COALESCE(forward_call_id,p_forward_call_id),
 answered_at = CASE WHEN p_status='answered' OR (p_status='completed' AND p_duration>0) THEN COALESCE(answered_at, CASE WHEN p_status='completed' THEN now()-make_interval(secs=>p_duration) ELSE now() END) ELSE answered_at END,
 ended_at = CASE WHEN p_status IN ('completed','missed','busy','failed','unknown') THEN COALESCE(ended_at,now()) ELSE ended_at END,
 duration_seconds = CASE WHEN p_forward_status IS NOT NULL THEN COALESCE(p_duration,duration_seconds) ELSE duration_seconds END
 WHERE id=p_id AND (p_forward_call_id IS NULL OR forward_call_id IS NULL OR forward_call_id=p_forward_call_id);
END $$;
REVOKE ALL ON FUNCTION public.apply_crm_inbound_event(uuid,text,text,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.apply_crm_inbound_event(uuid,text,text,text,integer) TO service_role;