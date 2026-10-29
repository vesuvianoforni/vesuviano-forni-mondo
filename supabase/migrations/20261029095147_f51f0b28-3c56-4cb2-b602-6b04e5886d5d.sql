ALTER TABLE public.newsletter_campaigns ADD COLUMN IF NOT EXISTS author text NOT NULL DEFAULT 'human', ADD COLUMN IF NOT EXISTS period_key text;
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_campaigns_roberta_period ON public.newsletter_campaigns(period_key) WHERE author='roberta';

CREATE TABLE public.marketing_agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_key text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'queued',
  worker_token uuid NOT NULL DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.newsletter_campaigns(id) ON DELETE SET NULL,
  error text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.marketing_agent_runs TO authenticated;
GRANT ALL ON public.marketing_agent_runs TO service_role;
ALTER TABLE public.marketing_agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read roberta runs" ON public.marketing_agent_runs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));

CREATE OR REPLACE FUNCTION public.queue_roberta_run()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE r public.marketing_agent_runs; k text;
BEGIN
  k := to_char(now(),'YYYY-MM') || CASE WHEN extract(day FROM now()) < 16 THEN '-A' ELSE '-B' END;
  INSERT INTO public.marketing_agent_runs(period_key) VALUES (k) ON CONFLICT (period_key) DO NOTHING RETURNING * INTO r;
  IF r.id IS NULL THEN RETURN; END IF;
  PERFORM net.http_post(
    url := 'https://lgueucxznbqgvhpjzurf.supabase.co/functions/v1/newsletter',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndWV1Y3h6bmJxZ3ZocGp6dXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MDE5ODEsImV4cCI6MjA2NDM3Nzk4MX0.JH9wcGcoyPKQqWT1ExYLRJyg1Jz_8iXezfmeZ9oyZzE"}'::jsonb,
    body := jsonb_build_object('action','roberta_run','run_id',r.id,'token',r.worker_token));
END $$;
REVOKE ALL ON FUNCTION public.queue_roberta_run() FROM PUBLIC, anon, authenticated;