-- Create storage bucket for oven images
INSERT INTO storage.buckets (id, name, public) VALUES ('oven-gallery', 'oven-gallery', true);

-- Create table for oven classifications
CREATE TABLE public.ovens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('mosaico', 'gas', 'legna')),
  subcategory TEXT,
  image_url TEXT NOT NULL,
  description TEXT,
  specifications JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ovens ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (gallery is public)
CREATE POLICY "Ovens are viewable by everyone" 
ON public.ovens 
FOR SELECT 
USING (true);

-- Create policies for authenticated users to manage ovens
CREATE POLICY "Authenticated users can insert ovens" 
ON public.ovens 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update ovens" 
ON public.ovens 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete ovens" 
ON public.ovens 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create storage policies for oven gallery
CREATE POLICY "Oven images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'oven-gallery');

CREATE POLICY "Authenticated users can upload oven images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'oven-gallery' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update oven images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'oven-gallery' AND auth.role() = 'authenticated');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ovens_updated_at
BEFORE UPDATE ON public.ovens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_ovens_category ON public.ovens(category);
CREATE INDEX idx_ovens_created_at ON public.ovens(created_at);