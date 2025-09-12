-- Aggiorna l'immagine del forno a gas mosaico premium con la nuova immagine del forno bianco moderno
UPDATE ovens 
SET image_url = '/lovable-uploads/forno-bianco-moderno.png',
    updated_at = now()
WHERE name = 'Forno a Gas Mosaico Premium';