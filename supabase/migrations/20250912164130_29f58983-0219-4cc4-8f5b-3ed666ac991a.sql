-- Aggiungi campi per i tag dei forni
ALTER TABLE ovens 
ADD COLUMN fuel_type TEXT CHECK (fuel_type IN ('gas', 'legna', 'elettrico')),
ADD COLUMN coating_type TEXT CHECK (coating_type IN ('mosaico', 'verniciato', 'metallico'));

-- Aggiorna i forni esistenti con i tag appropriati
UPDATE ovens SET 
  fuel_type = 'elettrico',
  coating_type = 'verniciato'
WHERE name = 'Forno Elettrico Bianco Moderno';

UPDATE ovens SET 
  fuel_type = 'gas',
  coating_type = 'mosaico'
WHERE category = 'mosaico';

UPDATE ovens SET 
  fuel_type = 'gas',
  coating_type = 'metallico'
WHERE name LIKE '%Metallo%';

UPDATE ovens SET 
  fuel_type = 'gas',
  coating_type = 'verniciato'
WHERE name LIKE '%Terra del Gusto%';

UPDATE ovens SET 
  fuel_type = 'legna',
  coating_type = 'mosaico'
WHERE category = 'legna' AND (name LIKE '%VesuvioBuono%' OR name LIKE '%Vesuvio%');

UPDATE ovens SET 
  fuel_type = 'legna',
  coating_type = 'verniciato'
WHERE category = 'legna' AND name LIKE '%Bianco Tradizionale%';