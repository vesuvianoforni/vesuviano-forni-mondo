CREATE TABLE public.outreach_settings (
  key text PRIMARY KEY DEFAULT 'default',
  paused boolean NOT NULL DEFAULT true,
  daily_limit integer NOT NULL DEFAULT 100,
  markets text[] NOT NULL DEFAULT ARRAY['UK','FR','DE'],
  send_markets text[] NOT NULL DEFAULT ARRAY['UK','FR'],
  cities jsonb NOT NULL DEFAULT '{"UK":["London","Manchester","Birmingham","Leeds","Glasgow","Bristol"],"FR":["Paris","Lyon","Marseille","Toulouse","Nice","Bordeaux"],"DE":["Berlin","München","Hamburg","Köln","Frankfurt"]}'::jsonb,
  sender_email text,
  pause_reason text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.outreach_settings TO authenticated;
GRANT ALL ON public.outreach_settings TO service_role;
ALTER TABLE public.outreach_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage outreach settings" ON public.outreach_settings FOR ALL TO authenticated
 USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'commerciale')) WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'commerciale'));
INSERT INTO public.outreach_settings (key) VALUES ('default');

CREATE TABLE public.outreach_prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'pizzeria',
  name text NOT NULL,
  country text NOT NULL,
  city text,
  website text,
  domain text,
  email text,
  phone text,
  source text NOT NULL DEFAULT 'apify',
  source_url text,
  summary text,
  personalization text,
  status text NOT NULL DEFAULT 'new',
  step integer NOT NULL DEFAULT 0,
  next_send_at timestamptz,
  last_sent_at timestamptz,
  replied_at timestamptz,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX outreach_prospects_email_uq ON public.outreach_prospects (lower(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX outreach_prospects_domain_uq ON public.outreach_prospects (domain) WHERE domain IS NOT NULL;
CREATE INDEX outreach_prospects_due_idx ON public.outreach_prospects (status, next_send_at);
GRANT SELECT, UPDATE ON public.outreach_prospects TO authenticated;
GRANT ALL ON public.outreach_prospects TO service_role;
ALTER TABLE public.outreach_prospects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read prospects" ON public.outreach_prospects FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'commerciale'));
CREATE POLICY "staff update prospects" ON public.outreach_prospects FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'commerciale')) WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'commerciale'));
CREATE TRIGGER outreach_prospects_updated BEFORE UPDATE ON public.outreach_prospects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.outreach_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.outreach_prospects(id) ON DELETE CASCADE,
  step integer NOT NULL,
  direction text NOT NULL DEFAULT 'outbound',
  subject text,
  body text,
  status text NOT NULL DEFAULT 'queued',
  message_id text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);
CREATE UNIQUE INDEX outreach_messages_step_uq ON public.outreach_messages (prospect_id, step) WHERE direction = 'outbound';
GRANT SELECT ON public.outreach_messages TO authenticated;
GRANT ALL ON public.outreach_messages TO service_role;
ALTER TABLE public.outreach_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read outreach messages" ON public.outreach_messages FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'commerciale'));

CREATE TABLE public.outreach_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  status text NOT NULL DEFAULT 'running',
  lease_until timestamptz NOT NULL DEFAULT now() + interval '15 minutes',
  found integer NOT NULL DEFAULT 0,
  sent integer NOT NULL DEFAULT 0,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);
GRANT SELECT ON public.outreach_runs TO authenticated;
GRANT ALL ON public.outreach_runs TO service_role;
ALTER TABLE public.outreach_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read outreach runs" ON public.outreach_runs FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'commerciale'));

CREATE TABLE public.outreach_suppressions (
  value text PRIMARY KEY,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.outreach_suppressions TO authenticated;
GRANT ALL ON public.outreach_suppressions TO service_role;
ALTER TABLE public.outreach_suppressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage suppressions" ON public.outreach_suppressions FOR ALL TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'commerciale')) WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'commerciale'));