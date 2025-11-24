-- Add SELECT policy for oven-gallery bucket (was missing)
CREATE POLICY "Allow everyone to view oven images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'oven-gallery');