ALTER TABLE public.product_assets ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE public.product_assets ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.product_assets ADD COLUMN IF NOT EXISTS description text;
CREATE INDEX IF NOT EXISTS product_assets_tags_idx ON public.product_assets USING gin(tags);