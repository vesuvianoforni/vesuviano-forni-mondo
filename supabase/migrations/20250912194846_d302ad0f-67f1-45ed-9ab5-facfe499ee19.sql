-- Remove all existing constraints
ALTER TABLE public.ovens DROP CONSTRAINT IF EXISTS ovens_fuel_type_check;
ALTER TABLE public.ovens DROP CONSTRAINT IF EXISTS ovens_category_check;

-- Update fuel types: all ovens can be gas/legna, metal ones also elettrico
UPDATE public.ovens 
SET fuel_type = CASE 
  WHEN coating_type = 'metallico' OR name LIKE '%Metallo%' THEN 'gas/legna/elettrico'
  ELSE 'gas/legna'
END;

-- Keep existing categories (mosaico, legna) and change "gas" to "misto"
UPDATE public.ovens 
SET category = 'misto'
WHERE category = 'gas';