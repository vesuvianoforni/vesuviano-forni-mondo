-- Ripristina l'immagine originale del forno a gas mosaico premium
UPDATE ovens 
SET image_url = '/lovable-uploads/vesuviobuono-verde-mosaico.jpg',
    updated_at = now()
WHERE name = 'Forno a Gas Mosaico Premium';

-- Aggiungi il nuovo forno elettrico bianco usando la categoria 'gas' temporaneamente
INSERT INTO ovens (name, category, subcategory, description, image_url, specifications)
VALUES (
  'Forno Elettrico Bianco Moderno',
  'gas',
  'Elettrico',
  'Forno elettrico dal design contemporaneo con struttura in legno chiaro e camera di cottura in acciaio. Tecnologia avanzata per cotture perfette, costanti e rispettose dell''ambiente.',
  '/lovable-uploads/forno-bianco-moderno.png',
  '{
    "temperatura_costante": "Controllo digitale preciso",
    "controllo_digitale": "Display touch avanzato",
    "eco_sostenibile": "Zero emissioni dirette",
    "funzionamento_silenzioso": "Tecnologia silent",
    "capacita": "4-6 pizze",
    "temperatura_max": "400°C",
    "materiale": "Legno naturale e acciaio inox",
    "dimensioni_camera": "Ø 90cm"
  }'
);