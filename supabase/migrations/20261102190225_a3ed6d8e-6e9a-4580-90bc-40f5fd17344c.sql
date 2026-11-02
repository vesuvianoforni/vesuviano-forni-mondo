CREATE TABLE public.outreach_research_plans (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), thread_id uuid NOT NULL, request text NOT NULL, proposal jsonb NOT NULL, analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
 status text NOT NULL DEFAULT 'proposed', created_by uuid NOT NULL, approved_by uuid, approved_at timestamptz, started_at timestamptz, finished_at timestamptz,
 discovered integer NOT NULL DEFAULT 0, skipped integer NOT NULL DEFAULT 0, verified integer NOT NULL DEFAULT 0, error text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.outreach_research_plans TO authenticated;
GRANT ALL ON public.outreach_research_plans TO service_role;
ALTER TABLE public.outreach_research_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read research plans" ON public.outreach_research_plans FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE INDEX research_plans_thread ON public.outreach_research_plans(thread_id,created_at DESC);
CREATE TRIGGER research_plans_updated BEFORE UPDATE ON public.outreach_research_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TABLE public.outreach_research_jobs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), plan_id uuid NOT NULL REFERENCES public.outreach_research_plans(id) ON DELETE CASCADE, ordinal integer NOT NULL,
 kind text NOT NULL, input jsonb NOT NULL, status text NOT NULL DEFAULT 'queued', result jsonb, error text,
 worker_token uuid NOT NULL DEFAULT gen_random_uuid(), lease_until timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(plan_id,ordinal)
);
GRANT ALL ON public.outreach_research_jobs TO service_role;
ALTER TABLE public.outreach_research_jobs ENABLE ROW LEVEL SECURITY;
CREATE INDEX research_jobs_pending ON public.outreach_research_jobs(plan_id,ordinal) WHERE status IN ('queued','running');
CREATE TRIGGER research_jobs_updated BEFORE UPDATE ON public.outreach_research_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.validate_mario_research_plan() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.status NOT IN ('proposed','queued','running','completed','cancelled','failed','superseded') THEN RAISE EXCEPTION 'invalid research status'; END IF;
 IF NEW.status IN ('queued','running','completed') AND (NEW.approved_by IS NULL OR NEW.approved_at IS NULL) THEN RAISE EXCEPTION 'research approval required'; END IF;
 IF OLD.status<>'proposed' AND (NEW.proposal IS DISTINCT FROM OLD.proposal OR NEW.analysis IS DISTINCT FROM OLD.analysis OR NEW.request IS DISTINCT FROM OLD.request) THEN RAISE EXCEPTION 'approved research scope is immutable'; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER validate_research_plan BEFORE UPDATE ON public.outreach_research_plans FOR EACH ROW EXECUTE FUNCTION public.validate_mario_research_plan();
CREATE OR REPLACE FUNCTION public.claim_mario_research_job(p_id uuid,p_token uuid) RETURNS SETOF public.outreach_research_jobs LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p uuid;
BEGIN
 SELECT plan_id INTO p FROM public.outreach_research_jobs WHERE id=p_id AND worker_token=p_token;
 IF p IS NULL THEN RETURN; END IF;
 PERFORM 1 FROM public.outreach_research_plans WHERE id=p FOR UPDATE;
 IF NOT EXISTS(SELECT 1 FROM public.outreach_research_plans WHERE id=p AND status IN ('queued','running') AND approved_at IS NOT NULL AND approved_by IS NOT NULL) THEN RETURN; END IF;
 IF EXISTS(SELECT 1 FROM public.outreach_research_jobs WHERE plan_id=p AND ordinal<(SELECT ordinal FROM public.outreach_research_jobs WHERE id=p_id) AND status<>'done') THEN RETURN; END IF;
 RETURN QUERY UPDATE public.outreach_research_jobs SET status='running',lease_until=now()+interval '5 minutes' WHERE id=p_id AND worker_token=p_token AND status='queued' RETURNING *;
 UPDATE public.outreach_research_plans SET status='running',started_at=coalesce(started_at,now()) WHERE id=p AND status='queued';
END; $$;
REVOKE ALL ON FUNCTION public.claim_mario_research_job(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_mario_research_job(uuid,uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.approve_mario_research_plan(p_id uuid,p_user uuid,p_jobs jsonb) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT (public.has_role(p_user,'admin') OR public.has_role(p_user,'commerciale')) THEN RAISE EXCEPTION 'forbidden'; END IF;
 IF jsonb_typeof(p_jobs)<>'array' OR jsonb_array_length(p_jobs)<1 OR jsonb_array_length(p_jobs)>12 THEN RAISE EXCEPTION 'invalid research scope'; END IF;
 PERFORM 1 FROM public.outreach_research_plans WHERE id=p_id FOR UPDATE;
 IF NOT EXISTS(SELECT 1 FROM public.outreach_research_plans WHERE id=p_id AND status='proposed') THEN RETURN false; END IF;
 UPDATE public.outreach_research_plans SET status='queued',approved_by=p_user,approved_at=now() WHERE id=p_id;
 INSERT INTO public.outreach_research_jobs(plan_id,ordinal,kind,input)
 SELECT p_id,(x.ordinality-1)::integer,'discover',x.value FROM jsonb_array_elements(p_jobs) WITH ORDINALITY x;
 RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.approve_mario_research_plan(uuid,uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.approve_mario_research_plan(uuid,uuid,jsonb) TO service_role;
ALTER PUBLICATION supabase_realtime ADD TABLE public.outreach_research_plans;