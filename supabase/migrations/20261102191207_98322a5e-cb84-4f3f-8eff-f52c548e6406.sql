CREATE OR REPLACE FUNCTION public.cancel_mario_research_plan(p_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM 1 FROM public.outreach_research_plans WHERE id=p_id FOR UPDATE;
 UPDATE public.outreach_research_plans SET status='cancelled',finished_at=now() WHERE id=p_id AND status IN ('proposed','queued','running','failed');
 IF NOT FOUND THEN RETURN false; END IF;
 UPDATE public.outreach_research_jobs SET status='cancelled' WHERE plan_id=p_id AND status='queued';
 RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.cancel_mario_research_plan(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_mario_research_plan(uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.wake_mario_research_job() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE j public.outreach_research_jobs;
BEGIN
 IF TG_OP='UPDATE' AND NOT (NEW.status='done' AND OLD.status='running') THEN RETURN NEW; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.outreach_research_plans WHERE id=NEW.plan_id AND status IN ('queued','running') AND approved_at IS NOT NULL AND approved_by IS NOT NULL) THEN RETURN NEW; END IF;
 SELECT * INTO j FROM public.outreach_research_jobs WHERE plan_id=NEW.plan_id AND status='queued' ORDER BY ordinal LIMIT 1;
 IF j.id IS NULL OR EXISTS(SELECT 1 FROM public.outreach_research_jobs WHERE plan_id=j.plan_id AND ordinal<j.ordinal AND status<>'done') THEN RETURN NEW; END IF;
 IF TG_OP='INSERT' AND NEW.id<>j.id THEN RETURN NEW; END IF;
 PERFORM net.http_post(url:='https://lgueucxznbqgvhpjzurf.supabase.co/functions/v1/mario-research',headers:='{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndWV1Y3h6bmJxZ3ZocGp6dXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MDE5ODEsImV4cCI6MjA2NDM3Nzk4MX0.JH9wcGcoyPKQqWT1ExYLRJyg1Jz_8iXezfmeZ9oyZzE"}'::jsonb,body:=jsonb_build_object('job_id',j.id,'token',j.worker_token),timeout_milliseconds:=10000);
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.wake_mario_research_job() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.wake_mario_research_job() TO service_role;
CREATE TRIGGER research_jobs_wake AFTER INSERT OR UPDATE OF status ON public.outreach_research_jobs FOR EACH ROW EXECUTE FUNCTION public.wake_mario_research_job();
CREATE OR REPLACE FUNCTION public.finish_mario_research_job(p_id uuid,p_token uuid,p_result jsonb) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE j public.outreach_research_jobs;p public.outreach_research_plans;n integer;max_o integer;rec record;
BEGIN
 SELECT * INTO j FROM public.outreach_research_jobs WHERE id=p_id AND worker_token=p_token;
 IF j.id IS NULL THEN RETURN false; END IF;
 SELECT * INTO p FROM public.outreach_research_plans WHERE id=j.plan_id FOR UPDATE;
 IF p.status NOT IN ('queued','running') OR p.approved_at IS NULL OR p.approved_by IS NULL THEN RETURN false; END IF;
 UPDATE public.outreach_research_jobs SET status='done',result=p_result,lease_until=NULL WHERE id=p_id AND status='running' AND worker_token=p_token;
 IF NOT FOUND THEN RETURN false; END IF;
 IF j.kind='discover' THEN
  UPDATE public.outreach_research_plans SET discovered=discovered+coalesce((p_result->>'imported')::integer,0),skipped=skipped+coalesce((p_result->>'skipped')::integer,0) WHERE id=p.id;
  IF NOT EXISTS(SELECT 1 FROM public.outreach_research_jobs WHERE plan_id=p.id AND kind='discover' AND status<>'done') THEN
   SELECT coalesce(max(ordinal),-1)+1 INTO max_o FROM public.outreach_research_jobs WHERE plan_id=p.id;
   n:=0;
   FOR rec IN SELECT DISTINCT x.value #>> '{}' AS prospect FROM public.outreach_research_jobs r CROSS JOIN LATERAL jsonb_array_elements(coalesce(r.result->'prospect_ids','[]'::jsonb)) x WHERE r.plan_id=p.id AND r.kind='discover' ORDER BY prospect LIMIT least(coalesce((p.proposal->>'verify_limit')::integer,0),20) LOOP
    INSERT INTO public.outreach_research_jobs(plan_id,ordinal,kind,input) VALUES(p.id,max_o+n,'verify',jsonb_build_object('prospect_id',rec.prospect));n:=n+1;
   END LOOP;
  END IF;
 ELSE
  UPDATE public.outreach_research_plans SET verified=verified+CASE WHEN coalesce((p_result->>'qualified')::boolean,false) THEN 1 ELSE 0 END WHERE id=p.id;
 END IF;
 IF NOT EXISTS(SELECT 1 FROM public.outreach_research_jobs WHERE plan_id=p.id AND status IN ('queued','running')) THEN
  UPDATE public.outreach_research_plans SET status='completed',finished_at=now() WHERE id=p.id;
 END IF;
 RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.finish_mario_research_job(uuid,uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.finish_mario_research_job(uuid,uuid,jsonb) TO service_role;