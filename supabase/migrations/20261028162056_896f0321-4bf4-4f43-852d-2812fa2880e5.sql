ALTER TABLE public.crm_messages ADD COLUMN IF NOT EXISTS metadata jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS crm_messages_channel_external_uidx ON public.crm_messages(channel, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS leads_phone_digits_idx ON public.leads ((right(regexp_replace(coalesce(phone,''), '\D', '', 'g'), 9)));