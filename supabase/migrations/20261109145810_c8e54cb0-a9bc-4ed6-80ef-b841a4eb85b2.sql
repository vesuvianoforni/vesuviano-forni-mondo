CREATE TABLE public.crm_direct_calls (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
 operator_id uuid NOT NULL,
 destination text NOT NULL,
 from_number text NOT NULL DEFAULT '+447457416033',
 status text NOT NULL DEFAULT 'preparing',
 credential_id text,
 provider_call_id text,
 answered_at timestamptz,
 ended_at timestamptz,
 message_id uuid REFERENCES public.crm_messages(id) ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (id, operator_id)
);
GRANT SELECT ON public.crm_direct_calls TO authenticated;
GRANT ALL ON public.crm_direct_calls TO service_role;
ALTER TABLE public.crm_direct_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales staff read direct calls" ON public.crm_direct_calls FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE INDEX crm_direct_calls_lead_idx ON public.crm_direct_calls(lead_id, created_at DESC);
CREATE UNIQUE INDEX crm_direct_calls_operator_live_idx ON public.crm_direct_calls(operator_id) WHERE status IN ('preparing','dialing','active');
CREATE FUNCTION public.touch_crm_direct_call() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER crm_direct_calls_updated BEFORE UPDATE ON public.crm_direct_calls FOR EACH ROW EXECUTE FUNCTION public.touch_crm_direct_call();