
-- Burners table (managed in backoffice)
CREATE TABLE public.burners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  specifications JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.burners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active burners" ON public.burners
  FOR SELECT TO public USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admins can manage burners" ON public.burners
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Proformas table
CREATE TABLE public.proformas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  customer_name TEXT,
  company_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  billing_address TEXT,
  vat_number TEXT,
  notes TEXT,
  total_price NUMERIC NOT NULL DEFAULT 0,
  deposit_percentage NUMERIC NOT NULL DEFAULT 5,
  deposit_amount NUMERIC NOT NULL DEFAULT 0,
  delivery_days INTEGER,
  payment_option TEXT NOT NULL DEFAULT 'deposit_5',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  payment_completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'draft',
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.proformas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view proformas by token" ON public.proformas
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage proformas" ON public.proformas
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can update proforma payment" ON public.proformas
  FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Proforma items table
CREATE TABLE public.proforma_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proforma_id UUID NOT NULL REFERENCES public.proformas(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'oven',
  oven_id UUID REFERENCES public.configurator_ovens(id),
  burner_id UUID REFERENCES public.burners(id),
  custom_name TEXT,
  custom_description TEXT,
  model_name TEXT,
  fuel_type TEXT,
  diameter INTEGER,
  coating TEXT,
  image_url TEXT,
  ai_render_url TEXT,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  line_total NUMERIC NOT NULL DEFAULT 0,
  specifications JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.proforma_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view proforma items" ON public.proforma_items
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage proforma items" ON public.proforma_items
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can update proforma items" ON public.proforma_items
  FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_burners_updated_at BEFORE UPDATE ON public.burners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proformas_updated_at BEFORE UPDATE ON public.proformas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
