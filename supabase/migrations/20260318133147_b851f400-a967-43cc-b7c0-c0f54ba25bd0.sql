
-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proforma_id UUID REFERENCES public.proformas(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL DEFAULT ('ORD-' || to_char(now(), 'YYYYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 4)),
  customer_name TEXT,
  company_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  billing_address TEXT,
  delivery_address TEXT,
  vat_number TEXT,
  status TEXT NOT NULL DEFAULT 'nuovo',
  carrier TEXT,
  tracking_number TEXT,
  estimated_delivery DATE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  invoice_number TEXT,
  invoice_date DATE,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  deposit_paid NUMERIC NOT NULL DEFAULT 0,
  balance_due NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'in_attesa',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  oven_id UUID REFERENCES public.configurator_ovens(id),
  burner_id UUID REFERENCES public.burners(id),
  item_type TEXT NOT NULL DEFAULT 'oven',
  model_name TEXT,
  description TEXT,
  fuel_type TEXT,
  diameter INTEGER,
  coating TEXT,
  image_url TEXT,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  line_total NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage orders" ON public.orders
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view orders" ON public.orders
  FOR SELECT TO authenticated
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage order items" ON public.order_items
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (true);

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
