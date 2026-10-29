ALTER TABLE public.marketing_agent_runs ADD COLUMN IF NOT EXISTS lease_until timestamptz;
CREATE TABLE public.marketing_occasions (
 code text PRIMARY KEY, title text NOT NULL, month integer NOT NULL, day integer NOT NULL, enabled boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.marketing_occasions TO authenticated;
GRANT ALL ON public.marketing_occasions TO service_role;
ALTER TABLE public.marketing_occasions ENABLE ROW LEVEL SECURITY;
CREATE POLICY marketing_occasions_staff_read ON public.marketing_occasions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE TRIGGER marketing_occasions_updated BEFORE UPDATE ON public.marketing_occasions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.queue_roberta_run() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE r public.marketing_agent_runs; k text; d date := (now() AT TIME ZONE 'Europe/Rome')::date; occasion_code text;
BEGIN
 IF EXISTS (SELECT 1 FROM public.newsletter_ai_state WHERE key='newsletter') THEN RETURN; END IF;
 SELECT code INTO occasion_code FROM public.marketing_occasions WHERE enabled AND month=extract(month FROM d) AND day=extract(day FROM d) ORDER BY code LIMIT 1;
 IF occasion_code IS NOT NULL THEN k := 'occasion-' || extract(year FROM d)::text || '-' || occasion_code;
 ELSIF extract(day FROM d) IN (1,16) THEN k := to_char(d,'YYYY-MM') || CASE WHEN extract(day FROM d)=1 THEN '-A' ELSE '-B' END;
 ELSE RETURN; END IF;
 IF EXISTS (SELECT 1 FROM public.marketing_agent_runs WHERE status='running' AND lease_until>now()) THEN RETURN; END IF;
 INSERT INTO public.marketing_agent_runs(period_key) VALUES(k) ON CONFLICT(period_key) DO NOTHING RETURNING * INTO r;
 IF r.id IS NULL THEN RETURN; END IF;
 PERFORM net.http_post(url := 'https://lgueucxznbqgvhpjzurf.supabase.co/functions/v1/newsletter',
 headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndWV1Y3h6bmJxZ3ZocGp6dXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MDE5ODEsImV4cCI6MjA2NDM3Nzk4MX0.JH9wcGcoyPKQqWT1ExYLRJyg1Jz_8iXezfmeZ9oyZzE"}'::jsonb,
 body := jsonb_build_object('action','roberta_run','run_id',r.id,'token',r.worker_token));
END $$;
REVOKE ALL ON FUNCTION public.queue_roberta_run() FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.claim_roberta_run(_id uuid, _token uuid) RETURNS SETOF public.marketing_agent_runs LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('roberta-draft'));
 IF EXISTS (SELECT 1 FROM public.newsletter_ai_state WHERE key='newsletter') THEN RETURN; END IF;
 IF EXISTS (SELECT 1 FROM public.marketing_agent_runs WHERE status='running' AND lease_until>now()) THEN RETURN; END IF;
 RETURN QUERY UPDATE public.marketing_agent_runs SET status='running', started_at=now(), lease_until=now()+interval '20 minutes'
 WHERE id=_id AND worker_token=_token AND status='queued' RETURNING *;
END $$;
REVOKE ALL ON FUNCTION public.claim_roberta_run(uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_roberta_run(uuid,uuid) TO service_role;