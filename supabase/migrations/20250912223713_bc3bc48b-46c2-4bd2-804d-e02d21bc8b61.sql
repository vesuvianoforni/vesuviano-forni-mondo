-- Pulizia duplicati nel database forni
-- Manteniamo solo la versione migliore di ogni gruppo di duplicati

-- 1. Per vesuviobuono-verde-mosaico.jpg (3 duplicati) - manteniamo VesuvioBuono Mosaico Verde
DELETE FROM ovens WHERE id IN ('b35d361b-e79e-4200-8e05-f72b2a7543a3', '5271abfb-64e1-460d-8372-cc7d2cc1f552');

-- 2. Per vesuviobuono-osteria-pizza.jpg (2 duplicati) - manteniamo Vesuvio Buono Osteria Pizza (originale)
DELETE FROM ovens WHERE id = '6430e0dc-b28c-435f-b11b-f9ae2d6c8b41';

-- 3. Per forno-arancione-terra-del-gusto.png (2 duplicati) - manteniamo Forno Arancione Terra del Gusto (verniciato)
DELETE FROM ovens WHERE id = 'c82b5dab-4026-4ad3-9400-2ef0e23bf156';

-- 4. Per vesuviobuono-marrone-completo.jpg (2 duplicati) - manteniamo Vesuvio Buono Marrone Completo (originale)
DELETE FROM ovens WHERE id = '10b068e3-0bad-4a1c-88f5-de7f224ec05c';

-- Aggiorniamo alcuni record per migliorare la consistenza dei dati
UPDATE ovens SET 
  coating_type = 'mosaico' 
WHERE coating_type IS NULL AND category = 'legna' AND image_url LIKE '%vesuvio%';

-- Aggiorniamo i coating_type mancanti per categorie mosaico
UPDATE ovens SET 
  coating_type = 'mosaico' 
WHERE coating_type IS NULL AND category = 'mosaico';

-- Aggiorniamo coating_type per forni metallo
UPDATE ovens SET 
  coating_type = 'metallico' 
WHERE coating_type IS NULL AND image_url LIKE '%metallo%';