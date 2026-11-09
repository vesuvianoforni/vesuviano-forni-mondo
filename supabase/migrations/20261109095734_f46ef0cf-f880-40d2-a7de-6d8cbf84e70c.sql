ALTER TABLE public.transport_carriers ADD COLUMN is_active boolean NOT NULL DEFAULT true;
COMMENT ON COLUMN public.transport_carriers.is_active IS 'Vettore attivo e utilizzabile per le spedizioni';