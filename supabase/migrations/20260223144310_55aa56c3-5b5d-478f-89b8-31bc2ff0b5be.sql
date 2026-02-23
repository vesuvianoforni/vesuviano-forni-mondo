
-- Create blog_posts table with multilingual fields
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Slugs per lingua (URL tradotti)
  slug_it TEXT NOT NULL,
  slug_en TEXT NOT NULL,
  slug_fr TEXT NOT NULL,
  slug_de TEXT NOT NULL,
  slug_es TEXT NOT NULL,
  
  -- Titoli per lingua
  title_it TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  title_de TEXT NOT NULL,
  title_es TEXT NOT NULL,
  
  -- Meta descriptions per lingua
  meta_description_it TEXT,
  meta_description_en TEXT,
  meta_description_fr TEXT,
  meta_description_de TEXT,
  meta_description_es TEXT,
  
  -- Contenuto per lingua (HTML)
  content_it TEXT NOT NULL DEFAULT '',
  content_en TEXT NOT NULL DEFAULT '',
  content_fr TEXT NOT NULL DEFAULT '',
  content_de TEXT NOT NULL DEFAULT '',
  content_es TEXT NOT NULL DEFAULT '',
  
  -- Campi comuni
  featured_image TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  author TEXT DEFAULT 'Vesuviano',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indici per slug lookup (uno per lingua)
CREATE UNIQUE INDEX idx_blog_posts_slug_it ON public.blog_posts (slug_it);
CREATE UNIQUE INDEX idx_blog_posts_slug_en ON public.blog_posts (slug_en);
CREATE UNIQUE INDEX idx_blog_posts_slug_fr ON public.blog_posts (slug_fr);
CREATE UNIQUE INDEX idx_blog_posts_slug_de ON public.blog_posts (slug_de);
CREATE UNIQUE INDEX idx_blog_posts_slug_es ON public.blog_posts (slug_es);

-- Indice per categoria e pubblicazione
CREATE INDEX idx_blog_posts_category ON public.blog_posts (category);
CREATE INDEX idx_blog_posts_published ON public.blog_posts (is_published, published_at DESC);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Tutti possono leggere i post pubblicati
CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts
FOR SELECT
USING (is_published = true);

-- Admin possono gestire tutti i post
CREATE POLICY "Admins can manage blog posts"
ON public.blog_posts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger per updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
