CREATE TABLE public.product_costs (
  product_id uuid PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  cost numeric,
  currency text NOT NULL DEFAULT 'EUR',
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_costs TO authenticated;
GRANT ALL ON public.product_costs TO service_role;
ALTER TABLE public.product_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Solo admin costi prodotti" ON public.product_costs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER product_costs_updated BEFORE UPDATE ON public.product_costs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.order_cost_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'produzione',
  description text,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_cost_entries TO authenticated;
GRANT ALL ON public.order_cost_entries TO service_role;
ALTER TABLE public.order_cost_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Solo admin costi ordine" ON public.order_cost_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER order_cost_entries_updated BEFORE UPDATE ON public.order_cost_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX order_cost_entries_order_idx ON public.order_cost_entries(order_id);

CREATE TABLE public.operating_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date date NOT NULL DEFAULT current_date,
  category text NOT NULL DEFAULT 'altro',
  description text,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.operating_expenses TO authenticated;
GRANT ALL ON public.operating_expenses TO service_role;
ALTER TABLE public.operating_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Solo admin spese esercizio" ON public.operating_expenses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER operating_expenses_updated BEFORE UPDATE ON public.operating_expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX operating_expenses_date_idx ON public.operating_expenses(expense_date);

INSERT INTO public.product_costs(product_id, cost, currency)
SELECT id, cost, cost_currency FROM public.products WHERE cost IS NOT NULL;
UPDATE public.products SET cost = NULL WHERE cost IS NOT NULL;

CREATE OR REPLACE FUNCTION public.products_strip_cost()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN NEW.cost := NULL; RETURN NEW; END $$;
CREATE TRIGGER products_strip_cost BEFORE INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.products_strip_cost();