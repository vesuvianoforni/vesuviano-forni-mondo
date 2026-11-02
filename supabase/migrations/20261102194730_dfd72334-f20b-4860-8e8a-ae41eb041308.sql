ALTER TABLE public.outreach_research_plans ADD COLUMN examined integer NOT NULL DEFAULT 0, ADD COLUMN verification_attempts integer NOT NULL DEFAULT 0;
ALTER TABLE public.outreach_research_jobs ADD COLUMN not_before timestamptz NOT NULL DEFAULT now();
CREATE OR REPLACE FUNCTION public.approve_mario_research_plan(p_id uuid,p_user uuid,p_jobs jsonb) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.outreach_research_plans;s public.outreach_settings;t jsonb;total integer:=0;goal integer;modern boolean;
BEGIN
 IF NOT (public.has_role(p_user,'admin') OR public.has_role(p_user,'commerciale')) THEN RAISE EXCEPTION 'forbidden'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('mario-research-approval'));
 SELECT * INTO p FROM public.outreach_research_plans WHERE id=p_id FOR UPDATE;
 IF p.id IS NULL OR p.status<>'proposed' THEN RETURN false; END IF;
 IF EXISTS(SELECT 1 FROM public.outreach_research_plans WHERE status IN ('queued','running')) THEN RAISE EXCEPTION 'another research plan is active'; END IF;
 IF EXISTS(SELECT 1 FROM public.outreach_agent_config WHERE key='default' AND ai_status IS NOT NULL) THEN RAISE EXCEPTION 'Mario service paused'; END IF;
 SELECT * INTO s FROM public.outreach_settings WHERE key='default' FOR SHARE;
 IF to_jsonb(s.markets) IS DISTINCT FROM p.analysis->'settings'->'markets' OR s.cities IS DISTINCT FROM p.analysis->'settings'->'cities' THEN RAISE EXCEPTION 'research settings changed'; END IF;
 modern:=p.proposal ? 'organization_goal';goal:=CASE WHEN modern THEN (p.proposal->>'organization_goal')::integer ELSE 100 END;
 IF goal NOT BETWEEN 1 AND 500 OR p_jobs IS DISTINCT FROM p.proposal->'targets' OR jsonb_typeof(p_jobs)<>'array' OR jsonb_array_length(p_jobs) NOT BETWEEN 1 AND (CASE WHEN modern THEN 30 ELSE 12 END) THEN RAISE EXCEPTION 'invalid research scope'; END IF;
 FOR t IN SELECT value FROM jsonb_array_elements(p_jobs) LOOP
  IF NOT (t->>'country'=ANY(s.markets)) OR t->>'kind' NOT IN ('pizzeria','partner') OR t->>'provider' NOT IN ('firecrawl','apify') OR (t->>'limit')::integer NOT BETWEEN 1 AND (CASE WHEN modern THEN 100 ELSE 50 END) OR length(t->>'city') NOT BETWEEN 2 AND 80 THEN RAISE EXCEPTION 'invalid target'; END IF;
  IF modern AND (t->>'query' IS NULL OR length(t->>'query') NOT BETWEEN 3 AND 250) THEN RAISE EXCEPTION 'query required'; END IF;
  IF NOT modern AND t->>'provider'='firecrawl' AND (t->>'limit')::integer>10 THEN RAISE EXCEPTION 'invalid legacy provider limit'; END IF;
  total:=total+(t->>'limit')::integer;
 END LOOP;
 IF total>(CASE WHEN modern THEN 1500 ELSE 100 END) OR (p.proposal->>'verify_limit')::integer NOT BETWEEN 0 AND (CASE WHEN modern THEN 500 ELSE 20 END) THEN RAISE EXCEPTION 'research limit exceeded'; END IF;
 IF modern AND (total<goal OR (p.proposal->>'verify_limit')::integer<>goal) THEN RAISE EXCEPTION 'research must cover goal'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(p_jobs) x GROUP BY x->>'provider',x->>'kind',x->>'country',lower(x->>'city'),lower(coalesce(x->>'query','')) HAVING count(*)>1) THEN RAISE EXCEPTION 'duplicate research'; END IF;
 UPDATE public.outreach_research_plans SET status='queued',approved_by=p_user,approved_at=now() WHERE id=p_id;
 INSERT INTO public.outreach_research_jobs(plan_id,ordinal,kind,input) SELECT p_id,(x.ordinality-1)::integer,'discover',x.value FROM jsonb_array_elements(p_jobs) WITH ORDINALITY x;
 RETURN true;
END $$;
CREATE OR REPLACE FUNCTION public.claim_mario_research_job(p_id uuid,p_token uuid) RETURNS SETOF public.outreach_research_jobs LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p uuid;
BEGIN
 SELECT plan_id INTO p FROM public.outreach_research_jobs WHERE id=p_id AND worker_token=p_token;
 IF p IS NULL THEN RETURN; END IF;
 PERFORM 1 FROM public.outreach_research_plans WHERE id=p FOR UPDATE;
 IF EXISTS(SELECT 1 FROM public.outreach_agent_config WHERE key='default' AND ai_status IS NOT NULL) THEN RETURN; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.outreach_research_plans WHERE id=p AND status IN ('queued','running') AND approved_at IS NOT NULL AND approved_by IS NOT NULL) THEN RETURN; END IF;
 IF EXISTS(SELECT 1 FROM public.outreach_research_jobs WHERE plan_id=p AND ordinal<(SELECT ordinal FROM public.outreach_research_jobs WHERE id=p_id) AND status NOT IN ('done','cancelled')) THEN RETURN; END IF;
 RETURN QUERY UPDATE public.outreach_research_jobs SET status='running',lease_until=now()+interval '5 minutes' WHERE id=p_id AND worker_token=p_token AND status='queued' AND not_before<=now() RETURNING *;
 UPDATE public.outreach_research_plans SET status='running',started_at=coalesce(started_at,now()) WHERE id=p AND status='queued';
END $$;
CREATE OR REPLACE FUNCTION public.finish_mario_research_job(p_id uuid,p_token uuid,p_result jsonb) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE j public.outreach_research_jobs;p public.outreach_research_plans;n integer;max_o integer;rec record;goal integer;next_id uuid;
BEGIN
 SELECT * INTO j FROM public.outreach_research_jobs WHERE id=p_id AND worker_token=p_token;
 IF j.id IS NULL THEN RETURN false; END IF;
 SELECT * INTO p FROM public.outreach_research_plans WHERE id=j.plan_id FOR UPDATE;
 IF p.status NOT IN ('queued','running') OR p.approved_at IS NULL OR p.approved_by IS NULL OR j.status<>'running' THEN RETURN false; END IF;
 goal:=coalesce((p.proposal->>'organization_goal')::integer,100);
 IF j.kind='discover' THEN
  UPDATE public.outreach_research_plans SET discovered=discovered+coalesce((p_result->>'imported')::integer,0),skipped=skipped+coalesce((p_result->>'skipped')::integer,0),examined=examined+coalesce((p_result->>'examined')::integer,coalesce((p_result->>'imported')::integer,0)+coalesce((p_result->>'skipped')::integer,0)) WHERE id=p.id RETURNING * INTO p;
  IF p.discovered>=goal THEN UPDATE public.outreach_research_jobs SET status='cancelled' WHERE plan_id=p.id AND kind='discover' AND status='queued'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.outreach_research_jobs WHERE plan_id=p.id AND kind='discover' AND id<>p_id AND status NOT IN ('done','cancelled')) THEN
   SELECT coalesce(max(ordinal),-1)+1 INTO max_o FROM public.outreach_research_jobs WHERE plan_id=p.id;
   n:=0;
   FOR rec IN SELECT DISTINCT x.value #>> '{}' AS prospect FROM public.outreach_research_jobs r CROSS JOIN LATERAL jsonb_array_elements(coalesce(CASE WHEN r.id=p_id THEN p_result ELSE r.result END->'prospect_ids','[]'::jsonb)) x WHERE r.plan_id=p.id AND r.kind='discover' ORDER BY prospect LIMIT least(coalesce((p.proposal->>'verify_limit')::integer,0),CASE WHEN p.proposal ? 'organization_goal' THEN 500 ELSE 20 END) LOOP
    INSERT INTO public.outreach_research_jobs(plan_id,ordinal,kind,input,not_before) VALUES(p.id,max_o+n,'verify',jsonb_build_object('prospect_id',rec.prospect),now()+interval '10 seconds');n:=n+1;
   END LOOP;
  END IF;
 ELSE
  UPDATE public.outreach_research_plans SET verification_attempts=verification_attempts+1,verified=verified+CASE WHEN coalesce((p_result->>'qualified')::boolean,false) THEN 1 ELSE 0 END WHERE id=p.id;
 END IF;
 SELECT id INTO next_id FROM public.outreach_research_jobs WHERE plan_id=p.id AND status='queued' ORDER BY ordinal LIMIT 1;
 IF next_id IS NOT NULL THEN UPDATE public.outreach_research_jobs SET not_before=greatest(not_before,now()+interval '10 seconds') WHERE id=next_id; END IF;
 UPDATE public.outreach_research_jobs SET status='done',result=p_result,lease_until=NULL WHERE id=p_id AND status='running' AND worker_token=p_token;
 IF NOT EXISTS(SELECT 1 FROM public.outreach_research_jobs WHERE plan_id=p.id AND status IN ('queued','running')) THEN UPDATE public.outreach_research_plans SET status='completed',finished_at=now() WHERE id=p.id; END IF;
 RETURN true;
END $$;
CREATE OR REPLACE FUNCTION public.wake_mario_research_job() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE j public.outreach_research_jobs;
BEGIN
 IF TG_OP='UPDATE' AND NOT (NEW.status='done' AND OLD.status='running') THEN RETURN NEW; END IF;
 IF EXISTS(SELECT 1 FROM public.outreach_agent_config WHERE key='default' AND ai_status IS NOT NULL) THEN RETURN NEW; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.outreach_research_plans WHERE id=NEW.plan_id AND status IN ('queued','running') AND approved_at IS NOT NULL AND approved_by IS NOT NULL) THEN RETURN NEW; END IF;
 SELECT * INTO j FROM public.outreach_research_jobs WHERE plan_id=NEW.plan_id AND status='queued' ORDER BY ordinal LIMIT 1;
 IF j.id IS NULL OR EXISTS(SELECT 1 FROM public.outreach_research_jobs WHERE plan_id=j.plan_id AND ordinal<j.ordinal AND status NOT IN ('done','cancelled')) THEN RETURN NEW; END IF;
 IF TG_OP='INSERT' AND NEW.id<>j.id THEN RETURN NEW; END IF;
 PERFORM net.http_post(url:='https://lgueucxznbqgvhpjzurf.supabase.co/functions/v1/mario-research',headers:='{"Content-Type":"application/json"}'::jsonb,body:=jsonb_build_object('job_id',j.id,'token',j.worker_token),timeout_milliseconds:=10000);
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.approve_mario_research_plan(uuid,uuid,jsonb),public.claim_mario_research_job(uuid,uuid),public.finish_mario_research_job(uuid,uuid,jsonb),public.wake_mario_research_job() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.approve_mario_research_plan(uuid,uuid,jsonb),public.claim_mario_research_job(uuid,uuid),public.finish_mario_research_job(uuid,uuid,jsonb) TO service_role;