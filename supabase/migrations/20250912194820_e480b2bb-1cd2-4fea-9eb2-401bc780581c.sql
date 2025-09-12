-- Remove existing fuel_type constraint
ALTER TABLE public.ovens DROP CONSTRAINT IF EXISTS ovens_fuel_type_check;

-- Update all ovens to have correct fuel_type
UPDATE public.ovens 
SET fuel_type = 'gas/legna'
WHERE coating_type != 'metallico' OR coating_type IS NULL;

UPDATE public.ovens 
SET fuel_type = 'gas/legna/elettrico'  
WHERE coating_type = 'metallico' OR name LIKE '%Metallo%';

-- Update category from "gas" to "misto" since all are mixed fuel
UPDATE public.ovens 
SET category = 'misto'
WHERE category = 'gas';