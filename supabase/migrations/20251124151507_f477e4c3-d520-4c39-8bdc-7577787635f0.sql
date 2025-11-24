-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Allow authenticated users to upload oven images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update oven images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete oven images" ON storage.objects;

-- Allow anon users (default role) to upload to oven-gallery bucket
-- This is needed for admin uploads when not using Supabase Auth
CREATE POLICY "Allow uploads to oven-gallery"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'oven-gallery');

-- Allow updates to oven-gallery
CREATE POLICY "Allow updates to oven-gallery"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'oven-gallery');

-- Allow deletes from oven-gallery
CREATE POLICY "Allow deletes from oven-gallery"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'oven-gallery');