CREATE TABLE public.crm_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  channel text NOT NULL,
  direction text NOT NULL DEFAULT 'outbound',
  sender text NOT NULL DEFAULT 'operator',
  subject text,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  ai_generated boolean NOT NULL DEFAULT false,
  external_id text,
  error text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX crm_messages_lead_idx ON public.crm_messages(lead_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_messages TO authenticated;
GRANT ALL ON public.crm_messages TO service_role;
ALTER TABLE public.crm_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales staff manage crm messages" ON public.crm_messages FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));

CREATE OR REPLACE FUNCTION public.validate_crm_message() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.channel NOT IN ('whatsapp_api','wasender','email','note','call') THEN RAISE EXCEPTION 'invalid channel'; END IF;
  IF NEW.direction NOT IN ('inbound','outbound','internal') THEN RAISE EXCEPTION 'invalid direction'; END IF;
  IF NEW.status NOT IN ('draft','queued','sent','delivered','read','failed','logged') THEN RAISE EXCEPTION 'invalid status'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_validate_crm_message BEFORE INSERT OR UPDATE ON public.crm_messages FOR EACH ROW EXECUTE FUNCTION public.validate_crm_message();

ALTER TABLE public.leads ADD COLUMN bruno_mode text NOT NULL DEFAULT 'draft';
ALTER TABLE public.leads ADD COLUMN bruno_paused_until timestamptz;