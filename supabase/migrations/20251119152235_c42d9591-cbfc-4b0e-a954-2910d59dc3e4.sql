-- Modifica la tabella configurator_ovens per supportare rivestimenti multipli e alimentazioni multiple

-- Aggiungi campo per rivestimenti (array di oggetti con tipo e immagine)
ALTER TABLE configurator_ovens 
ADD COLUMN IF NOT EXISTS coatings jsonb DEFAULT '[]'::jsonb;

-- Modifica fuel_type per supportare array di alimentazioni
ALTER TABLE configurator_ovens 
ALTER COLUMN fuel_type TYPE text[] USING ARRAY[fuel_type];

-- Aggiungi commenti per documentare la struttura
COMMENT ON COLUMN configurator_ovens.coatings IS 'Array di rivestimenti: [{"type": "mosaico", "name": "Mosaico Blu", "image_url": "..."}]';
COMMENT ON COLUMN configurator_ovens.fuel_type IS 'Array di tipi di alimentazione: ["legna", "gas", "elettrico"]';