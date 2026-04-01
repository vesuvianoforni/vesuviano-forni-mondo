
-- Drop existing restrictive policies on datasheets bucket
DROP POLICY IF EXISTS "Admins can upload datasheets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update datasheets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete datasheets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view datasheets" ON storage.objects;

-- Allow admin, commerciale, produzione to upload datasheets
CREATE POLICY "ERP users can upload datasheets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'datasheets' AND (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'commerciale') OR
    public.has_role(auth.uid(), 'produzione')
  )
);

-- Allow admin, commerciale, produzione to update datasheets
CREATE POLICY "ERP users can update datasheets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'datasheets' AND (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'commerciale') OR
    public.has_role(auth.uid(), 'produzione')
  )
);

-- Allow admin, commerciale, produzione to delete datasheets
CREATE POLICY "ERP users can delete datasheets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'datasheets' AND (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'commerciale') OR
    public.has_role(auth.uid(), 'produzione')
  )
);

-- Anyone can view/download datasheets (public bucket)
CREATE POLICY "Anyone can view datasheets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'datasheets');
