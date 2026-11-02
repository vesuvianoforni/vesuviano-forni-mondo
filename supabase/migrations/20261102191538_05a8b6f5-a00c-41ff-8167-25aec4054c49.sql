CREATE OR REPLACE FUNCTION public.approve_mario_research_plan(p_id uuid,p_user uuid,p_jobs jsonb) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.outreach_research_plans;s public.outreach_settings;t jsonb;total integer:=0;
BEGIN
 IF NOT (public.has_role(p_user,'admin') OR public.has_role(p_user,'commerciale')) THEN RAISE EXCEPTION 'forbidden'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('mario-research-approval'));
 SELECT * INTO p FROM public.outreach_research_plans WHERE id=p_id FOR UPDATE;
 IF p.id IS NULL OR p.status<>'proposed' THEN RETURN false; END IF;
 IF EXISTS(SELECT 1 FROM public.outreach_research_plans WHERE status IN ('queued','running')) THEN RAISE EXCEPTION 'another research plan is active'; END IF;
 SELECT * INTO s FROM public.outreach_settings WHERE key='default' FOR SHARE;
 IF s.markets::jsonb IS DISTINCT FROM p.analysis->'settings'->'markets' OR s.cities IS DISTINCT FROM p.analysis->'settings'->'cities' THEN RAISE EXCEPTION 'research settings changed'; END IF;
 IF p_jobs IS DISTINCT FROM p.proposal->'targets' OR jsonb_typeof(p_jobs)<>'array' OR jsonb_array_length(p_jobs) NOT BETWEEN 1 AND 12 THEN RAISE EXCEPTION 'invalid research scope'; END IF;
 FOR t IN SELECT value FROM jsonb_array_elements(p_jobs) LOOP
  IF NOT t->>'country'=ANY(s.markets) OR t->>'kind' NOT IN ('pizzeria','partner') OR t->>'provider' NOT IN ('firecrawl','apify') OR (t->>'limit')::integer NOT BETWEEN 1 AND 50 OR length(t->>'city') NOT BETWEEN 2 AND 80 THEN RAISE EXCEPTION 'invalid target'; END IF;
  IF t->>'provider'='firecrawl' AND (t->>'limit')::integer>10 THEN RAISE EXCEPTION 'invalid provider limit'; END IF;
  total:=total+(t->>'limit')::integer;
 END LOOP;
 IF total>100 OR (p.proposal->>'verify_limit')::integer NOT BETWEEN 0 AND 20 THEN RAISE EXCEPTION 'research limit exceeded'; END IF;
 UPDATE public.outreach_research_plans SET status='queued',approved_by=p_user,approved_at=now() WHERE id=p_id;
 INSERT INTO public.outreach_research_jobs(plan_id,ordinal,kind,input) SELECT p_id,(x.ordinality-1)::integer,'discover',x.value FROM jsonb_array_elements(p_jobs) WITH ORDINALITY x;
 RETURN true;
END; $$;
ALTER TABLE public.outreach_research_jobs ADD COLUMN callback_claimed boolean NOT NULL DEFAULT false;
CREATE OR REPLACE FUNCTION public.claim_mario_research_callback(p_id uuid,p_token uuid) RETURNS SETOF public.outreach_research_jobs LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p uuid;
BEGIN
 SELECT plan_id INTO p FROM public.outreach_research_jobs WHERE id=p_id AND worker_token=p_token;
 IF p IS NULL THEN RETURN; END IF;
 PERFORM 1 FROM public.outreach_research_plans WHERE id=p FOR UPDATE;
 IF NOT EXISTS(SELECT 1 FROM public.outreach_research_plans WHERE id=p AND status IN ('queued','running') AND approved_at IS NOT NULL) THEN RETURN; END IF;
 RETURN QUERY UPDATE public.outreach_research_jobs SET callback_claimed=true,lease_until=now()+interval '5 minutes' WHERE id=p_id AND worker_token=p_token AND status='running' AND NOT callback_claimed AND input->>'provider'='apify' AND result->>'run_id' IS NOT NULL RETURNING *;
END; $$;
REVOKE ALL ON FUNCTION public.claim_mario_research_callback(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_mario_research_callback(uuid,uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.fail_mario_research_job(p_id uuid,p_token uuid,p_error text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p uuid;
BEGIN
 SELECT plan_id INTO p FROM public.outreach_research_jobs WHERE id=p_id AND worker_token=p_token;
 IF p IS NULL THEN RETURN; END IF;
 PERFORM 1 FROM public.outreach_research_plans WHERE id=p FOR UPDATE;
 IF NOT EXISTS(SELECT 1 FROM public.outreach_research_plans WHERE id=p AND status IN ('queued','running')) THEN RETURN; END IF;
 UPDATE public.outreach_research_jobs SET status='failed',error=left(p_error,500) WHERE id=p_id AND status='running' AND worker_token=p_token;
 IF FOUND THEN UPDATE public.outreach_research_plans SET status='failed',error=left(p_error,500),finished_at=now() WHERE id=p; END IF;
END; $$;
REVOKE ALL ON FUNCTION public.fail_mario_research_job(uuid,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fail_mario_research_job(uuid,uuid,text) TO service_role;
CREATE OR REPLACE FUNCTION public.cancel_mario_research_plan(p_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM 1 FROM public.outreach_research_plans WHERE id=p_id FOR UPDATE;
 UPDATE public.outreach_research_plans SET status='cancelled',finished_at=now() WHERE id=p_id AND status IN ('proposed','queued','running','failed');
 IF NOT FOUND THEN RETURN false; END IF;
 UPDATE public.outreach_research_jobs SET status='cancelled' WHERE plan_id=p_id AND status IN ('queued','running');
 RETURN true;
END; $$;
CREATE OR REPLACE FUNCTION public.mario_existing_organization(p_domain text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.leads WHERE lower(split_part(email,'@',2))=lower(p_domain) AND lower(split_part(email,'@',2)) NOT IN ('gmail.com','yahoo.com','hotmail.com','outlook.com','icloud.com','orange.fr','live.com'));
$$;
REVOKE ALL ON FUNCTION public.mario_existing_organization(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.mario_existing_organization(text) TO service_role;
CREATE OR REPLACE FUNCTION public.mario_crm_organization_summary() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT coalesce(jsonb_agg(x),'[]'::jsonb) FROM (SELECT customer_type,country,count(*) AS total FROM public.leads GROUP BY customer_type,country) x;
$$;
REVOKE ALL ON FUNCTION public.mario_crm_organization_summary() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.mario_crm_organization_summary() TO service_role;