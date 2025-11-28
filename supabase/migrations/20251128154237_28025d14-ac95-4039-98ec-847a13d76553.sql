-- Add fields for company info and delivery address to configurator_quotes
ALTER TABLE configurator_quotes 
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS vat_number text,
ADD COLUMN IF NOT EXISTS billing_address text,
ADD COLUMN IF NOT EXISTS delivery_address text,
ADD COLUMN IF NOT EXISTS final_notes text,
ADD COLUMN IF NOT EXISTS payment_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_session_id text;