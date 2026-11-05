CREATE TABLE public.product_asset_links (
  asset_id uuid NOT NULL REFERENCES public.product_assets(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (asset_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_asset_links TO authenticated;
GRANT ALL ON public.product_asset_links TO service_role;
ALTER TABLE public.product_asset_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales manage material product links" ON public.product_asset_links FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'commerciale'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'commerciale'));
CREATE INDEX product_asset_links_product_idx ON public.product_asset_links(product_id, asset_id);
CREATE TRIGGER product_asset_links_updated BEFORE UPDATE ON public.product_asset_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.product_asset_links(asset_id, product_id)
SELECT id, product_id FROM public.product_assets WHERE product_id IS NOT NULL;

ALTER TABLE public.product_assets DROP CONSTRAINT product_assets_product_id_fkey;
ALTER TABLE public.product_assets ADD CONSTRAINT product_assets_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;

CREATE FUNCTION public.sync_material_primary_product() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.product_id IS DISTINCT FROM NEW.product_id AND OLD.product_id IS NOT NULL THEN
    DELETE FROM public.product_asset_links WHERE asset_id = NEW.id AND product_id = OLD.product_id;
  END IF;
  IF NEW.product_id IS NOT NULL THEN
    INSERT INTO public.product_asset_links(asset_id, product_id) VALUES (NEW.id, NEW.product_id) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_material_primary_product() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER sync_material_primary_product AFTER INSERT OR UPDATE OF product_id ON public.product_assets FOR EACH ROW EXECUTE FUNCTION public.sync_material_primary_product();

CREATE FUNCTION public.save_product_material(_id uuid, _fields jsonb, _product_ids uuid[]) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE
  saved_id uuid;
  product_ids uuid[];
  material_tags text[];
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' AND NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'commerciale')) THEN
    RAISE EXCEPTION 'Accesso non consentito' USING ERRCODE = '42501';
  END IF;
  IF nullif(trim(_fields->>'title'), '') IS NULL THEN RAISE EXCEPTION 'Titolo obbligatorio'; END IF;
  IF _fields->>'kind' IS NULL OR _fields->>'kind' NOT IN ('foto','video','scheda','catalogo','certificazione','documento') THEN RAISE EXCEPTION 'Tipo non valido'; END IF;
  IF nullif(_fields->>'language', '') IS NOT NULL AND _fields->>'language' NOT IN ('it','en','fr','de','es') THEN RAISE EXCEPTION 'Lingua non valida'; END IF;
  SELECT coalesce(array_agg(id ORDER BY ordinal), '{}'::uuid[]) INTO product_ids FROM (
    SELECT id, min(ordinal) AS ordinal FROM unnest(coalesce(_product_ids, '{}'::uuid[])) WITH ORDINALITY AS items(id, ordinal)
    WHERE id IS NOT NULL GROUP BY id
  ) ids;
  IF (SELECT count(*) FROM public.products WHERE id = ANY(product_ids)) <> cardinality(product_ids) THEN RAISE EXCEPTION 'Prodotto non disponibile'; END IF;
  SELECT coalesce(array_agg(value), '{}'::text[]) INTO material_tags FROM jsonb_array_elements_text(coalesce(_fields->'tags', '[]'::jsonb));
  IF _id IS NULL THEN
    IF nullif(trim(_fields->>'url'), '') IS NULL THEN RAISE EXCEPTION 'File obbligatorio'; END IF;
    INSERT INTO public.product_assets(product_id, title, kind, language, tags, url, storage_path)
    VALUES (product_ids[1], trim(_fields->>'title'), _fields->>'kind', nullif(_fields->>'language', ''), material_tags, _fields->>'url', _fields->>'storage_path')
    RETURNING id INTO saved_id;
  ELSE
    PERFORM id FROM public.product_assets WHERE id = _id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Materiale non trovato'; END IF;
    UPDATE public.product_assets SET product_id = product_ids[1], title = trim(_fields->>'title'), kind = _fields->>'kind', language = nullif(_fields->>'language', ''), tags = material_tags WHERE id = _id RETURNING id INTO saved_id;
  END IF;
  DELETE FROM public.product_asset_links WHERE asset_id = saved_id AND NOT (product_id = ANY(product_ids));
  INSERT INTO public.product_asset_links(asset_id, product_id) SELECT saved_id, id FROM unnest(product_ids) AS id ON CONFLICT DO NOTHING;
  RETURN saved_id;
END;
$$;
REVOKE ALL ON FUNCTION public.save_product_material(uuid, jsonb, uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_product_material(uuid, jsonb, uuid[]) TO authenticated, service_role;