CREATE TABLE public.crm_inbound_calls (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 provider_call_id text NOT NULL UNIQUE,
 forward_call_id text,
 caller_number text NOT NULL,
 received_number text NOT NULL,
 forwarded_to text NOT NULL,
 lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
 status text NOT NULL DEFAULT 'received',
 forward_status text,
 answered_at timestamptz,
 ended_at timestamptz,
 duration_seconds integer,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.crm_inbound_calls TO authenticated;
GRANT ALL ON public.crm_inbound_calls TO service_role;
ALTER TABLE public.crm_inbound_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales staff read inbound calls" ON public.crm_inbound_calls FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'commerciale'));
CREATE INDEX crm_inbound_calls_history ON public.crm_inbound_calls (created_at DESC, id DESC);
CREATE TRIGGER touch_crm_inbound_calls BEFORE UPDATE ON public.crm_inbound_calls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.apply_crm_inbound_event(p_id uuid, p_status text, p_forward_status text DEFAULT NULL, p_forward_call_id text DEFAULT NULL, p_duration integer DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
 IF p_status NOT IN ('received','ringing','answered','completed','missed','busy','failed','unknown') THEN RAISE EXCEPTION 'Invalid inbound status'; END IF;
 IF p_duration IS NOT NULL AND (p_duration < 0 OR p_duration > 86400) THEN RAISE EXCEPTION 'Invalid call duration'; END IF;
 UPDATE public.crm_inbound_calls SET
 status = CASE
  WHEN p_forward_status IS NOT NULL AND status = 'unknown' THEN p_status
  WHEN status IN ('completed','missed','busy','failed') THEN status
  WHEN p_status = 'unknown' AND forward_status IS NOT NULL THEN status
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