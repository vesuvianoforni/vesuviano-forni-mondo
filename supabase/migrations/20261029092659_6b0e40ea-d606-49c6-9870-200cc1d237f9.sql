CREATE TABLE public.newsletter_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Nuova campagna',
  prompt text,
  language text NOT NULL DEFAULT 'it',
  subject text NOT NULL DEFAULT '',
  preheader text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  image_url text,
  cta_label text,
  cta_url text,
  audience jsonb NOT NULL DEFAULT '{"stages":["nuovo","pre_qualificato","qualificato","trattativa"],"countries":[]}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  recipients_count integer NOT NULL DEFAULT 0,
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  last_error text,
  created_by uuid,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_campaigns TO authenticated;
GRANT ALL ON public.newsletter_campaigns TO service_role;
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales manage campaigns" ON public.newsletter_campaigns FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE TRIGGER newsletter_campaigns_updated BEFORE UPDATE ON public.newsletter_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.newsletter_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  resend_id text,
  error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, email)
);
GRANT SELECT ON public.newsletter_recipients TO authenticated;
GRANT ALL ON public.newsletter_recipients TO service_role;
ALTER TABLE public.newsletter_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales read recipients" ON public.newsletter_recipients FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));

CREATE TABLE public.newsletter_unsubscribes (
  email text PRIMARY KEY,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.newsletter_unsubscribes TO authenticated;
GRANT ALL ON public.newsletter_unsubscribes TO service_role;
ALTER TABLE public.newsletter_unsubscribes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales read unsubscribes" ON public.newsletter_unsubscribes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));