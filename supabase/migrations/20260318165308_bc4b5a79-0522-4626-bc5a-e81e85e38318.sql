-- Add proforma_number with auto-increment sequence
CREATE SEQUENCE IF NOT EXISTS proforma_number_seq START WITH 1;

ALTER TABLE public.proformas 
  ADD COLUMN IF NOT EXISTS proforma_number text DEFAULT ('PF-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('proforma_number_seq')::text, 4, '0')),
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'it',
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'EUR';