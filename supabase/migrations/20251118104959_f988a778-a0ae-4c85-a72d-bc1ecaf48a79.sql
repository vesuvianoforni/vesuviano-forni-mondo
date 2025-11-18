-- Add price list columns to configurator_ovens for 3 price lists (A, B, C)
ALTER TABLE configurator_ovens
ADD COLUMN base_price_b numeric,
ADD COLUMN base_price_c numeric,
ADD COLUMN gas_price_b numeric,
ADD COLUMN gas_price_c numeric,
ADD COLUMN electric_price_b numeric,
ADD COLUMN electric_price_c numeric,
ADD COLUMN installation_price_b numeric,
ADD COLUMN installation_price_c numeric;

-- Rename existing price columns to indicate they are listino A
ALTER TABLE configurator_ovens
RENAME COLUMN base_price TO base_price_a;
ALTER TABLE configurator_ovens
RENAME COLUMN gas_price TO gas_price_a;
ALTER TABLE configurator_ovens
RENAME COLUMN electric_price TO electric_price_a;
ALTER TABLE configurator_ovens
RENAME COLUMN installation_price TO installation_price_a;

-- Add price_list field to configurator_sessions to track which price list was selected
ALTER TABLE configurator_sessions
ADD COLUMN price_list text NOT NULL DEFAULT 'A',
ADD COLUMN customer_name text,
ADD COLUMN customer_email text,
ADD COLUMN customer_phone text;

-- Add constraint to ensure price_list is A, B, or C
ALTER TABLE configurator_sessions
ADD CONSTRAINT valid_price_list CHECK (price_list IN ('A', 'B', 'C'));