CREATE TABLE public.transport_carriers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 country text NOT NULL,
 name text NOT NULL,
 company text,
 phone text,
 email text,
 notes text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transport_carriers TO authenticated;
GRANT ALL ON public.transport_carriers TO service_role;
ALTER TABLE public.transport_carriers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ERP staff manage carriers" ON public.transport_carriers FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale') OR public.has_role(auth.uid(),'produzione'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale') OR public.has_role(auth.uid(),'produzione'));
CREATE TRIGGER trg_transport_carriers_updated BEFORE UPDATE ON public.transport_carriers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.transport_carriers (country, name, company, phone, notes) VALUES ('Francia','Mauro Fezzano','Logistic AA Eboli','+39 366 897 1692','Vettore Francia Export — diretto con Logistic AA Eboli');