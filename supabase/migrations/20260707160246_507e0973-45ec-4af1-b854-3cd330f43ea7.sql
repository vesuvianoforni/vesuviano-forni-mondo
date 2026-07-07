
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_address TEXT,
  client_vat TEXT,
  offer_number TEXT,
  total_amount NUMERIC(12,2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  payment_terms TEXT NOT NULL DEFAULT '50% acconto alla conferma dell''ordine, 50% a saldo a merce pronta per la spedizione, previo supporto fotografico dei prodotti finiti.',
  warranty_years INTEGER NOT NULL DEFAULT 1,
  clauses JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  signed_at TIMESTAMPTZ,
  pdf_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contracts TO authenticated;
GRANT ALL ON public.contracts TO service_role;

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ERP staff can view contracts" ON public.contracts
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'commerciale'));

CREATE POLICY "ERP staff can insert contracts" ON public.contracts
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'commerciale'));

CREATE POLICY "ERP staff can update contracts" ON public.contracts
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'commerciale'));

CREATE POLICY "Admins can delete contracts" ON public.contracts
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_contracts_client_name ON public.contracts (client_name);
CREATE INDEX idx_contracts_offer_number ON public.contracts (offer_number);
CREATE INDEX idx_contracts_status ON public.contracts (status);
