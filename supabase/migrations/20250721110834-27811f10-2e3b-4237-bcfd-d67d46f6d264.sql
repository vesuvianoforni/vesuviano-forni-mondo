-- Create storage bucket for 3D models
INSERT INTO storage.buckets (id, name, public) 
VALUES ('3d-models', '3d-models', true);

-- Create policies for 3D model uploads
CREATE POLICY "3D models are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = '3d-models');

CREATE POLICY "Anyone can upload 3D models" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = '3d-models');

CREATE POLICY "Anyone can update 3D models" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = '3d-models');

CREATE POLICY "Anyone can delete 3D models" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = '3d-models');