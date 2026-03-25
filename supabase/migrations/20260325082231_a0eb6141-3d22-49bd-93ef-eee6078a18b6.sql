CREATE TABLE public.ready_to_ship_ovens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oven_id uuid REFERENCES public.configurator_ovens(id) ON DELETE SET NULL,
  model_name text NOT NULL,
  diameter integer NOT NULL,
  coating text,
  fuel_type text,
  description text,
  list_price numeric NOT NULL DEFAULT 0,
  sale_price numeric,
  images text[] DEFAULT ARRAY[]::text[],
  is_sold boolean NOT NULL DEFAULT false,
  sold_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ready_to_ship_ovens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ready to ship ovens" ON public.ready_to_ship_ovens
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage ready to ship ovens" ON public.ready_to_ship_ovens
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Commerciale can manage ready to ship ovens" ON public.ready_to_ship_ovens
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'commerciale')) WITH CHECK (has_role(auth.uid(), 'commerciale'));