ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS variable_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS offer_date DATE,
  ADD COLUMN IF NOT EXISTS destination TEXT,
  ADD COLUMN IF NOT EXISTS place_signed TEXT;