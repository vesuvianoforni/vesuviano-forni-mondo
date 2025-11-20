-- Add new fields to configurator_ovens table
ALTER TABLE configurator_ovens 
ADD COLUMN IF NOT EXISTS can_be_built_on_site boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS passage_space_cm integer;

-- Add comment for clarity
COMMENT ON COLUMN configurator_ovens.can_be_built_on_site IS 'Indica se il forno può essere costruito sul posto';
COMMENT ON COLUMN configurator_ovens.passage_space_cm IS 'Spazio necessario per far passare il forno già costruito (in cm)';