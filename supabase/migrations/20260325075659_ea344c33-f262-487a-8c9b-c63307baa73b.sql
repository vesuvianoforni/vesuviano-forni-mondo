-- Create storage bucket for technical datasheets
INSERT INTO storage.buckets (id, name, public) VALUES ('datasheets', 'datasheets', true);

-- Allow anyone to view datasheets
CREATE POLICY "Anyone can view datasheets" ON storage.objects FOR SELECT TO public USING (bucket_id = 'datasheets');

-- Allow authenticated admins to upload datasheets
CREATE POLICY "Admins can upload datasheets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'datasheets' AND (SELECT has_role(auth.uid(), 'admin')));

-- Allow authenticated admins to delete datasheets
CREATE POLICY "Admins can delete datasheets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'datasheets' AND (SELECT has_role(auth.uid(), 'admin')));