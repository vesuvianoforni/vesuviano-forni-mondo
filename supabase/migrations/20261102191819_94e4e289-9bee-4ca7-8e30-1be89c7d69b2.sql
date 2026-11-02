CREATE OR REPLACE FUNCTION public.approve_mario_research_plan(p_id uuid,p_user uuid,p_jobs jsonb) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.outreach_research_plans;s public.outreach_settings;t jsonb;total integer:=0;
BEGIN
 IF NOT (public.has_role(p_user,'admin') OR public.has_role(p_user,'commerciale')) THEN RAISE EXCEPTION 'forbidden'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('mario-research-approval'));
 SELECT * INTO p FROM public.outreach_research_plans WHERE id=p_id FOR UPDATE;
 IF p.id IS NULL OR p.status<>'proposed' THEN RETURN false; END IF;
 IF EXISTS(SELECT 1 FROM public.outreach_research_plans WHERE status IN ('queued','running')) THEN RAISE EXCEPTION 'another research plan is active'; END IF;
 SELECT * INTO s FROM public.outreach_settings WHERE key='default' FOR SHARE;
 IF to_jsonb(s.markets) IS DISTINCT FROM p.analysis->'settings'->'markets' OR s.cities IS DISTINCT FROM p.analysis->'settings'->'cities' THEN RAISE EXCEPTION 'research settings changed'; END IF;
 IF p_jobs IS DISTINCT FROM p.proposal->'targets' OR jsonb_typeof(p_jobs)<>'array' OR jsonb_array_length(p_jobs) NOT BETWEEN 1 AND 12 THEN RAISE EXCEPTION 'invalid research scope'; END IF;
 FOR t IN SELECT value FROM jsonb_array_elements(p_jobs) LOOP
  IF NOT (t->>'country'=ANY(s.markets)) OR t->>'kind' NOT IN ('pizzeria','partner') OR t->>'provider' NOT IN ('firecrawl','apify') OR (t->>'limit')::integer NOT BETWEEN 1 AND 50 OR length(t->>'city') NOT BETWEEN 2 AND 80 THEN RAISE EXCEPTION 'invalid target'; END IF;
  IF t->>'provider'='firecrawl' AND (t->>'limit')::integer>10 THEN RAISE EXCEPTION 'invalid provider limit'; END IF;
  total:=total+(t->>'limit')::integer;
 END LOOP;
 IF total>100 OR (p.proposal->>'verify_limit')::integer NOT BETWEEN 0 AND 20 THEN RAISE EXCEPTION 'research limit exceeded'; END IF;
 UPDATE public.outreach_research_plans SET status='queued',approved_by=p_user,approved_at=now() WHERE id=p_id;
 INSERT INTO public.outreach_research_jobs(plan_id,ordinal,kind,input) SELECT p_id,(x.ordinality-1)::integer,'discover',x.value FROM jsonb_array_elements(p_jobs) WITH ORDINALITY x;
 RETURN true;
END; $$;
DO $$
DECLARE p uuid:=gen_random_uuid();j uuid:=gen_random_uuid();token uuid:=gen_random_uuid();n integer;rejected boolean:=false;
BEGIN
 BEGIN
  INSERT INTO public.outreach_research_plans(id,thread_id,request,proposal,analysis,created_by) VALUES(p,gen_random_uuid(),'Test non operativo','{"targets":[],"verify_limit":0}'::jsonb,'{}',gen_random_uuid());
  INSERT INTO public.outreach_research_jobs(id,plan_id,ordinal,kind,input,worker_token) VALUES(j,p,0,'discover','{}',token);
  SELECT count(*) INTO n FROM public.claim_mario_research_job(j,token);
  IF n<>0 THEN RAISE EXCEPTION 'unapproved plan claimed'; END IF;
  BEGIN
   UPDATE public.outreach_research_plans SET status='queued' WHERE id=p;
  EXCEPTION WHEN OTHERS THEN rejected:=true; END;
  IF NOT rejected THEN RAISE EXCEPTION 'missing approval accepted'; END IF;
  rejected:=false;
  BEGIN
   PERFORM public.approve_mario_research_plan(p,gen_random_uuid(),'[]');
  EXCEPTION WHEN OTHERS THEN rejected:=true; END;
  IF NOT rejected THEN RAISE EXCEPTION 'nonstaff approval accepted'; END IF;
  RAISE EXCEPTION USING ERRCODE='ZX001',MESSAGE='rollback successful research gate tests';
 EXCEPTION WHEN SQLSTATE 'ZX001' THEN NULL; END;
END; $$;