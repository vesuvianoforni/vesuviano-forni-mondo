CREATE TABLE public.commercial_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  file_path text NOT NULL,
  public_url text NOT NULL,
  size_bytes bigint,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commercial_videos TO authenticated;
GRANT ALL ON public.commercial_videos TO service_role;
ALTER TABLE public.commercial_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage commercial videos" ON public.commercial_videos FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE POLICY "Staff upload commercial videos" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id='videos' AND (storage.foldername(name))[1]='commercial' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale')));
CREATE POLICY "Staff delete commercial videos" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id='videos' AND (storage.foldername(name))[1]='commercial' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale')));