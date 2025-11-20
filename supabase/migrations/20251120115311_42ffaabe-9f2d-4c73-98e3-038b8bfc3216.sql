-- Remove can_be_built_on_site and passage_space_cm from oven level
-- These will now be stored in the sizes JSON for each dimension

ALTER TABLE configurator_ovens 
  DROP COLUMN IF EXISTS can_be_built_on_site,
  DROP COLUMN IF EXISTS passage_space_cm;