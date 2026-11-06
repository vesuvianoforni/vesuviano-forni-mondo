-- lovable-cron-fallback-reviewed: bounded queue; the 1-minute tick is scheduled only while an approved call plan runs and unschedules itself once no plan is running.
CREATE TABLE public.bruno_call_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  call_type text NOT NULL DEFAULT 'qualifica' CHECK (call_type IN ('qualifica','trattativa')),
  objective text NOT NULL,
  instructions text,
  gap_minutes integer NOT NULL DEFAULT 3 CHECK (gap_minutes BETWEEN 1 AND 120),
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','running','paused','completed','cancelled')),
  tick_token uuid NOT NULL DEFAULT gen_random_uuid(),
  lease_until timestamptz,
  requested_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.bruno_call_plans TO service_role;
ALTER TABLE public.bruno_call_plans ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER bruno_call_plans_updated BEFORE UPDATE ON public.bruno_call_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.bruno_voice_calls ADD COLUMN plan_id uuid REFERENCES public.bruno_call_plans(id) ON DELETE SET NULL, ADD COLUMN plan_position integer;
CREATE INDEX bruno_voice_calls_plan_idx ON public.bruno_voice_calls(plan_id, plan_position);

CREATE OR REPLACE FUNCTION public.kick_bruno_call_plans() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE p public.bruno_call_plans;
BEGIN
 FOR p IN SELECT * FROM public.bruno_call_plans WHERE status='running' AND (lease_until IS NULL OR lease_until<now()) LIMIT 20 LOOP
  PERFORM net.http_post(url:='https://lgueucxznbqgvhpjzurf.supabase.co/functions/v1/bruno-voice',headers:='{"Content-Type":"application/json"}'::jsonb,body:=jsonb_build_object('action','plan_tick','plan_id',p.id,'token',p.tick_token),timeout_milliseconds:=10000);
 END LOOP;
 PERFORM pg_advisory_xact_lock(hashtext('bruno-call-plan-schedule'));
 IF NOT EXISTS(SELECT 1 FROM public.bruno_call_plans WHERE status='running') THEN
  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname='bruno-call-plans';
 END IF;
END $$;

-- Arm the tick when a plan starts or resumes.
CREATE OR REPLACE FUNCTION public.wake_bruno_call_plan() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
 IF NEW.status='running' AND (TG_OP='INSERT' OR OLD.status IS DISTINCT FROM 'running') THEN
  PERFORM pg_advisory_xact_lock(hashtext('bruno-call-plan-schedule'));
  IF NOT EXISTS(SELECT 1 FROM cron.job WHERE jobname='bruno-call-plans') THEN
   PERFORM cron.schedule('bruno-call-plans','* * * * *','SELECT public.kick_bruno_call_plans()');
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER bruno_call_plans_wake AFTER INSERT OR UPDATE OF status ON public.bruno_call_plans FOR EACH ROW EXECUTE FUNCTION public.wake_bruno_call_plan();

CREATE OR REPLACE FUNCTION public.claim_bruno_call_plan(p_id uuid, p_token uuid) RETURNS SETOF public.bruno_call_plans LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
 UPDATE public.bruno_call_plans SET lease_until=now()+interval '50 seconds' WHERE id=p_id AND tick_token=p_token AND status='running' AND (lease_until IS NULL OR lease_until<now()) RETURNING *;
$$;
REVOKE ALL ON FUNCTION public.kick_bruno_call_plans() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.wake_bruno_call_plan() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_bruno_call_plan(uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_bruno_call_plan(uuid,uuid) TO service_role;