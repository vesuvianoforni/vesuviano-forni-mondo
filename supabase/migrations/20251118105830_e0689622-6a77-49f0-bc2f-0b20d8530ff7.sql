-- Add additional_images column to store multiple images for each oven
ALTER TABLE configurator_ovens
ADD COLUMN additional_images text[] DEFAULT ARRAY[]::text[];

COMMENT ON COLUMN configurator_ovens.additional_images IS 'Array of additional image URLs for the oven gallery';