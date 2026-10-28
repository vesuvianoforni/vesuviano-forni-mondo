CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  value NUMERIC,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'nuovo',
  pipeline TEXT NOT NULL DEFAULT 'Vesuviano',
  notes TEXT,
  assigned_to UUID,
  next_activity_type TEXT,
  next_activity_date TIMESTAMP WITH TIME ZONE,
  next_activity_notes TEXT,
  next_activity_assigned_to UUID,
  website_lead_id UUID UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin e commerciali possono vedere i lead" ON public.leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'commerciale'));
CREATE POLICY "Admin e commerciali possono creare lead" ON public.leads FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'commerciale'));
CREATE POLICY "Admin e commerciali possono modificare i lead" ON public.leads FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'commerciale')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'commerciale'));
CREATE POLICY "Admin e commerciali possono eliminare i lead" ON public.leads FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'commerciale'));

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.leads (company_name, contact_name, email, phone, source, status, pipeline, notes, website_lead_id, created_at)
SELECT
  wl.company,
  TRIM(CONCAT(COALESCE(wl.first_name, ''), ' ', COALESCE(wl.last_name, ''))),
  wl.email,
  wl.phone,
  COALESCE(wl.form_type, 'website'),
  'nuovo',
  'Vesuviano',
  wl.notes,
  wl.id,
  wl.created_at
FROM public.website_leads wl
ON CONFLICT (website_lead_id) DO NOTHING;