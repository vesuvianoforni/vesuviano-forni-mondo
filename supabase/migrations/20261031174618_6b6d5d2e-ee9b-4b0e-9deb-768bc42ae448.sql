CREATE TABLE public.commercial_offers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 number text NOT NULL UNIQUE,
 lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
 customer_name text NOT NULL,
 title text NOT NULL,
 status text NOT NULL DEFAULT 'offerta_pronta',
 document jsonb NOT NULL,
 amount numeric(14,2) NOT NULL DEFAULT 0,
 currency text NOT NULL DEFAULT 'EUR',
 public_code uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
 public_enabled boolean NOT NULL DEFAULT false,
 archived boolean NOT NULL DEFAULT false,
 created_by uuid,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.commercial_offers TO authenticated;
GRANT ALL ON public.commercial_offers TO service_role;
ALTER TABLE public.commercial_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales read commercial offers" ON public.commercial_offers FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE TRIGGER commercial_offers_updated BEFORE UPDATE ON public.commercial_offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX commercial_offers_created_idx ON public.commercial_offers(created_at DESC,id);
CREATE INDEX commercial_offers_lead_idx ON public.commercial_offers(lead_id);

CREATE TABLE public.commercial_offer_settings (
 key text PRIMARY KEY DEFAULT 'vesuviano',
 settings jsonb NOT NULL,
 updated_by uuid,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.commercial_offer_settings TO authenticated;
GRANT ALL ON public.commercial_offer_settings TO service_role;
ALTER TABLE public.commercial_offer_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales read commercial offer settings" ON public.commercial_offer_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE TRIGGER commercial_offer_settings_updated BEFORE UPDATE ON public.commercial_offer_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();