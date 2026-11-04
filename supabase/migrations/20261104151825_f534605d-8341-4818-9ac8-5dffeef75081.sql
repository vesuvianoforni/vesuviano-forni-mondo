CREATE TABLE public.ready_to_ship_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proforma_id uuid,
  website_lead_id uuid,
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  language text NOT NULL DEFAULT 'it',
  model_name text NOT NULL,
  due_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  external_id text,
  error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ready_to_ship_followups TO authenticated;
GRANT ALL ON public.ready_to_ship_followups TO service_role;
ALTER TABLE public.ready_to_ship_followups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read ready to ship followups" ON public.ready_to_ship_followups
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE INDEX ready_to_ship_followups_due ON public.ready_to_ship_followups (due_at) WHERE status = 'pending';
CREATE TRIGGER update_ready_to_ship_followups_updated_at BEFORE UPDATE ON public.ready_to_ship_followups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();