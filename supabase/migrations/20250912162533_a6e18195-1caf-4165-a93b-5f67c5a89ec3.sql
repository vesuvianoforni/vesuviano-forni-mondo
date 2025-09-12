-- Aggiorna il forno elettrico per usare l'immagine del forno metallo bianco
UPDATE ovens 
SET image_url = '/lovable-uploads/forno-metallo-bianco-nuovo.png'
WHERE category = 'gas' AND name LIKE '%Elettrico%' OR name LIKE '%Gas Mosaico%';

-- In caso non ci sia un forno elettrico specifico, aggiorniamo il più recente forno a gas
UPDATE ovens 
SET image_url = '/lovable-uploads/forno-metallo-bianco-nuovo.png'
WHERE name = 'Forno a Gas Mosaico Premium';