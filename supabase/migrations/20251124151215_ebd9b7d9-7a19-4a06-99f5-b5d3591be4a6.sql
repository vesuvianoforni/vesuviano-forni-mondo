-- Allow authenticated users to upload to oven-gallery bucket
CREATE POLICY "Allow authenticated users to upload oven images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'oven-gallery');

-- Allow authenticated users to update their uploads
CREATE POLICY "Allow authenticated users to update oven images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'oven-gallery');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Allow authenticated users to delete oven images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'oven-gallery');