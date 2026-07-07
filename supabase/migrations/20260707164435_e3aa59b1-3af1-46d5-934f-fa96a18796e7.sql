-- Preset values for contract select fields
CREATE TABLE public.contract_field_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_key TEXT NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (field_key, value)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_field_presets TO authenticated;
GRANT ALL ON public.contract_field_presets TO service_role;

ALTER TABLE public.contract_field_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ERP staff can view presets" ON public.contract_field_presets
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'commerciale') OR public.has_role(auth.uid(), 'produzione'));

CREATE POLICY "ERP staff can insert presets" ON public.contract_field_presets
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'commerciale'));

CREATE POLICY "ERP staff can update presets" ON public.contract_field_presets
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'commerciale'));

CREATE POLICY "Admins can delete presets" ON public.contract_field_presets
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_contract_field_presets_updated_at
  BEFORE UPDATE ON public.contract_field_presets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add language column and dynamic timing columns to contracts
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'it',
  ADD COLUMN IF NOT EXISTS production_days INT,
  ADD COLUMN IF NOT EXISTS shipping_days INT,
  ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;

-- Seed default presets
INSERT INTO public.contract_field_presets (field_key, value, label, sort_order) VALUES
  ('payment_terms', '50% acconto alla firma, 50% al collaudo/spedizione', '50/50 acconto-saldo', 1),
  ('payment_terms', '30% acconto, 40% pre-spedizione, 30% al collaudo', '30/40/30', 2),
  ('payment_terms', '100% anticipato con sconto 3%', '100% anticipato -3%', 3),
  ('payment_method', 'Bonifico bancario SEPA', 'Bonifico SEPA', 1),
  ('payment_method', 'Bonifico internazionale SWIFT', 'SWIFT', 2),
  ('payment_method', 'Carta di credito (Stripe) +3.5%', 'Stripe +3,5%', 3),
  ('payment_method', 'Wise UK', 'Wise UK', 4),
  ('shipping_terms', 'EXW - Franco fabbrica (Pettorano sul Gizio)', 'EXW', 1),
  ('shipping_terms', 'FCA - Franco vettore', 'FCA', 2),
  ('shipping_terms', 'DAP - Reso al luogo di destinazione', 'DAP', 3),
  ('shipping_terms', 'CIF - Costo assicurazione nolo', 'CIF', 4),
  ('installation', 'A cura del Cliente', 'Cliente', 1),
  ('installation', 'A cura del Venditore (costo separato)', 'Venditore', 2),
  ('installation', 'Supervisione tecnica remota inclusa', 'Supervisione remota', 3),
  ('warranty', '24 mesi standard su difetti di fabbricazione', '24 mesi', 1),
  ('warranty', '12 mesi (uso professionale intensivo)', '12 mesi', 2),
  ('warranty', '36 mesi con estensione garanzia', '36 mesi', 3),
  ('production_days', '30', '30 giorni', 1),
  ('production_days', '45', '45 giorni', 2),
  ('production_days', '60', '60 giorni', 3),
  ('production_days', '90', '90 giorni', 4),
  ('shipping_days', '5', '5 giorni (Italia)', 1),
  ('shipping_days', '10', '10 giorni (UE)', 2),
  ('shipping_days', '20', '20 giorni (Extra UE)', 3),
  ('shipping_days', '35', '35 giorni (Overseas)', 4);
