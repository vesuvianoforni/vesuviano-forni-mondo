-- Update all ovens to have correct fuel_type
-- All ovens can be gas/legna, only metal ones can also be elettrico

UPDATE public.ovens 
SET fuel_type = 'gas/legna'
WHERE coating_type != 'metallico' OR coating_type IS NULL;

UPDATE public.ovens 
SET fuel_type = 'gas/legna/elettrico'
WHERE coating_type = 'metallico' OR name LIKE '%Metallo%';

-- Also update any existing "gas" category to be "misto" since all are gas/legna
UPDATE public.ovens 
SET category = 'misto'
WHERE category = 'gas';