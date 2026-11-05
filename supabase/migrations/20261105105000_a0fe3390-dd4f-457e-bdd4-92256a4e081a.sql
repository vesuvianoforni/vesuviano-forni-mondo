CREATE TABLE public.bruno_actions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
 source text NOT NULL DEFAULT 'erp', requested_by uuid NOT NULL, requested_label text, request_text text NOT NULL DEFAULT '',
 tool_name text NOT NULL, args jsonb NOT NULL DEFAULT '{}'::jsonb, status text NOT NULL DEFAULT 'proposed', channel text,
 scheduled_at timestamptz, approved_by uuid, approved_at timestamptz, started_at timestamptz, finished_at timestamptz,
 expires_at timestamptz NOT NULL DEFAULT now()+interval '24 hours', result jsonb NOT NULL DEFAULT '{}'::jsonb, error_code text,
 message_id uuid REFERENCES public.crm_messages(id) ON DELETE SET NULL, voice_call_id uuid REFERENCES public.bruno_voice_calls(id) ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bruno_actions TO authenticated;
GRANT ALL ON public.bruno_actions TO service_role;
REVOKE ALL ON public.bruno_actions FROM anon;
REVOKE INSERT,UPDATE,DELETE ON public.bruno_actions FROM authenticated;
ALTER TABLE public.bruno_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY bruno_actions_staff_read ON public.bruno_actions FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE INDEX bruno_actions_page_idx ON public.bruno_actions(created_at DESC,id DESC);
CREATE INDEX bruno_actions_message_idx ON public.bruno_actions(message_id);
CREATE INDEX bruno_actions_voice_idx ON public.bruno_actions(voice_call_id);
CREATE TRIGGER bruno_actions_updated BEFORE UPDATE ON public.bruno_actions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.validate_bruno_action() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.status NOT IN ('proposed','approved','running','completed','failed','unknown','cancelled','expired','blocked') THEN RAISE EXCEPTION 'invalid action state'; END IF;
 IF NEW.source NOT IN ('erp','telegram','voice') OR jsonb_typeof(NEW.args)<>'object' OR octet_length(NEW.args::text)>100000 OR length(NEW.request_text)>8000 THEN RAISE EXCEPTION 'invalid action'; END IF;
 IF TG_OP='UPDATE' AND (NEW.tool_name IS DISTINCT FROM OLD.tool_name OR NEW.args IS DISTINCT FROM OLD.args OR NEW.requested_by IS DISTINCT FROM OLD.requested_by OR NEW.source IS DISTINCT FROM OLD.source) THEN RAISE EXCEPTION 'action scope immutable'; END IF;
 IF TG_OP='UPDATE' AND OLD.status IN ('running','completed','failed','unknown','cancelled','expired') AND NEW.status IN ('proposed','approved') THEN RAISE EXCEPTION 'action replay forbidden'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER bruno_actions_validate BEFORE INSERT OR UPDATE ON public.bruno_actions FOR EACH ROW EXECUTE FUNCTION public.validate_bruno_action();
CREATE OR REPLACE FUNCTION public.claim_bruno_action(p_id uuid,p_user uuid) RETURNS SETOF public.bruno_actions LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT(public.has_role(p_user,'admin') OR public.has_role(p_user,'commerciale')) THEN RAISE EXCEPTION 'forbidden'; END IF;
 RETURN QUERY UPDATE public.bruno_actions SET status='running',approved_by=p_user,approved_at=now(),started_at=now()
 WHERE id=p_id AND status='proposed' AND expires_at>now() RETURNING *;
END $$;
REVOKE ALL ON FUNCTION public.claim_bruno_action(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_bruno_action(uuid,uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.project_bruno_action_result() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF TG_TABLE_NAME='crm_messages' THEN
  UPDATE public.bruno_actions SET status=CASE WHEN NEW.status IN ('sent','delivered','read','logged') THEN 'completed' WHEN NEW.status='failed' THEN 'failed' ELSE 'running' END,finished_at=CASE WHEN NEW.status IN ('sent','delivered','read','logged','failed') THEN coalesce(finished_at,now()) ELSE finished_at END,error_code=CASE WHEN NEW.status='failed' THEN 'message_failed' ELSE NULL END WHERE message_id=NEW.id AND status NOT IN ('cancelled','expired');
 ELSE
  UPDATE public.bruno_actions SET status=CASE NEW.status WHEN 'completed' THEN 'completed' WHEN 'failed' THEN 'failed' WHEN 'cancelled' THEN 'cancelled' WHEN 'unknown' THEN 'unknown' WHEN 'proposed' THEN 'completed' ELSE 'running' END,finished_at=CASE WHEN NEW.status IN ('completed','failed','cancelled') THEN coalesce(NEW.ended_at,now()) ELSE finished_at END WHERE voice_call_id=NEW.id AND tool_name='approve_call' AND status NOT IN ('cancelled','expired');
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.project_bruno_action_result() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER bruno_actions_message_result AFTER UPDATE ON public.crm_messages FOR EACH ROW EXECUTE FUNCTION public.project_bruno_action_result();
CREATE TRIGGER bruno_actions_voice_result AFTER UPDATE ON public.bruno_voice_calls FOR EACH ROW EXECUTE FUNCTION public.project_bruno_action_result();
CREATE OR REPLACE FUNCTION public.bruno_workspace_summary(p_days integer DEFAULT 7) RETURNS jsonb LANGUAGE plpgsql STABLE SET search_path=public AS $$
DECLARE day_start timestamptz:=(date_trunc('day',now() AT TIME ZONE 'Europe/Rome') AT TIME ZONE 'Europe/Rome'); since_at timestamptz; data jsonb;
BEGIN
 IF NOT(public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale')) THEN RAISE EXCEPTION 'forbidden'; END IF;
 IF p_days NOT IN (1,7,30) THEN RAISE EXCEPTION 'invalid period'; END IF;
 since_at:=day_start-make_interval(days=>p_days-1);
 SELECT jsonb_build_object('pending',(SELECT count(*) FROM public.bruno_actions WHERE status='proposed' AND expires_at>now()),'today',(SELECT count(*) FROM public.leads WHERE pipeline='Vesuviano' AND NOT coalesce(archived,false) AND status NOT IN ('vinto','perso') AND next_activity_date>=day_start AND next_activity_date<day_start+interval '1 day')+(SELECT count(*) FROM public.bruno_actions WHERE status IN ('approved','running','proposed') AND scheduled_at>=day_start AND scheduled_at<day_start+interval '1 day'),
 'completed',(SELECT count(*) FROM public.bruno_actions WHERE status='completed' AND finished_at>=since_at),
 'messages',(SELECT count(DISTINCT a.message_id) FROM public.bruno_actions a JOIN public.crm_messages m ON m.id=a.message_id WHERE a.status='completed' AND a.finished_at>=since_at AND m.channel IN ('email','wasender','whatsapp_api') AND m.direction='outbound' AND coalesce(m.metadata->>'source','')<>'zapper' AND m.status IN ('sent','delivered','read')),
 'calls',(SELECT count(*) FROM public.bruno_voice_calls WHERE status='completed' AND ended_at>=since_at),
 'issues',(SELECT count(*) FROM public.bruno_actions WHERE status IN ('failed','unknown','blocked') AND created_at>=since_at),
 'pipeline',(SELECT coalesce(jsonb_object_agg(status,total),'{}'::jsonb) FROM (SELECT status,count(*) total FROM public.leads WHERE pipeline='Vesuviano' AND NOT coalesce(archived,false) GROUP BY status) x), 'since',since_at) INTO data;
 RETURN data;
END $$;
GRANT EXECUTE ON FUNCTION public.bruno_workspace_summary(integer) TO authenticated;
REVOKE ALL ON FUNCTION public.bruno_workspace_summary(integer) FROM PUBLIC,anon;