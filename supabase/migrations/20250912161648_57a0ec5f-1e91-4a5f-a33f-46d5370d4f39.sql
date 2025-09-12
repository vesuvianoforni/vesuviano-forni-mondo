-- Aggiorna i forni in metallo con le nuove immagini
UPDATE ovens 
SET image_url = '/lovable-uploads/forno-metallo-bianco-nuovo.png'
WHERE name = 'Forno Metallo Bianco';

UPDATE ovens 
SET image_url = '/lovable-uploads/forno-metallo-nero-nuovo.png'
WHERE name = 'Forno Metallo Nero';