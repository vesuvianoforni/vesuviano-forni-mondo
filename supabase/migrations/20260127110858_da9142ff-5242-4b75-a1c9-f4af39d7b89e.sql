-- Crea tabella per i lead dal sito web
CREATE TABLE public.website_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  form_type TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  company TEXT,
  website TEXT,
  oven_type TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'new'
);

-- Abilita Row Level Security
ALTER TABLE public.website_leads ENABLE ROW LEVEL SECURITY;

-- Policy per admin: visualizzare tutti i lead
CREATE POLICY "Admins can view all website leads" 
ON public.website_leads 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy per admin: gestire tutti i lead
CREATE POLICY "Admins can manage website leads" 
ON public.website_leads 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policy per inserimenti anonimi (dai form del sito)
CREATE POLICY "Anyone can insert website leads" 
ON public.website_leads 
FOR INSERT 
WITH CHECK (true);

-- Crea indice per ricerca veloce
CREATE INDEX idx_website_leads_created_at ON public.website_leads(created_at DESC);
CREATE INDEX idx_website_leads_form_type ON public.website_leads(form_type);
CREATE INDEX idx_website_leads_email ON public.website_leads(email);