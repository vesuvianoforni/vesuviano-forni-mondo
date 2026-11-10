ALTER TABLE public.crm_inbound_calls ALTER COLUMN forwarded_to DROP NOT NULL;
ALTER TABLE public.crm_inbound_calls ADD COLUMN source text NOT NULL DEFAULT 'telnyx_webhook';