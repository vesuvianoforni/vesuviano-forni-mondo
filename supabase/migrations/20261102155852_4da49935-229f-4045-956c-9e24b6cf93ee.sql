CREATE TABLE public.price_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX price_lists_one_active ON public.price_lists((true)) WHERE status='active';

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'altro',
  name text NOT NULL,
  description text,
  image_url text,
  oven_id uuid REFERENCES public.configurator_ovens(id) ON DELETE SET NULL,
  burner_id uuid REFERENCES public.burners(id) ON DELETE SET NULL,
  size_label text,
  coating text,
  component text,
  source_key text UNIQUE,
  cost numeric,
  cost_currency text NOT NULL DEFAULT 'EUR',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.product_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  price_list_id uuid NOT NULL REFERENCES public.price_lists(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  market text NOT NULL,
  amount numeric,
  currency text NOT NULL DEFAULT 'EUR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (price_list_id, product_id, market)
);

CREATE TABLE public.discount_tiers (
  code text PRIMARY KEY,
  label text NOT NULL,
  percentage numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS customer_type text NOT NULL DEFAULT 'cliente';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS discount_override numeric;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_lists, public.products, public.product_prices, public.discount_tiers TO authenticated;
GRANT ALL ON public.price_lists, public.products, public.product_prices, public.discount_tiers TO service_role;

ALTER TABLE public.price_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff gestisce listini" ON public.price_lists FOR ALL TO authenticated
 USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'commerciale'))
 WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'commerciale'));
CREATE POLICY "Staff gestisce prodotti" ON public.products FOR ALL TO authenticated
 USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'commerciale'))
 WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'commerciale'));
CREATE POLICY "Staff gestisce prezzi" ON public.product_prices FOR ALL TO authenticated
 USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'commerciale'))
 WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'commerciale'));
CREATE POLICY "Staff gestisce sconti" ON public.discount_tiers FOR ALL TO authenticated
 USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'commerciale'))
 WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'commerciale'));

CREATE TRIGGER price_lists_updated BEFORE UPDATE ON public.price_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER product_prices_updated BEFORE UPDATE ON public.product_prices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER discount_tiers_updated BEFORE UPDATE ON public.discount_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.validate_catalog_row() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF TG_TABLE_NAME='price_lists' THEN
  IF NEW.status NOT IN ('draft','active','archived') THEN RAISE EXCEPTION 'invalid status'; END IF;
 END IF;
 IF TG_TABLE_NAME='products' THEN
  IF NEW.category NOT IN ('forno','bruciatore','altro') THEN RAISE EXCEPTION 'invalid category'; END IF;
 END IF;
 IF TG_TABLE_NAME='product_prices' THEN
  IF NEW.market NOT IN ('UK','FR','DE') THEN RAISE EXCEPTION 'invalid market'; END IF;
  IF EXISTS (SELECT 1 FROM public.price_lists WHERE id=NEW.price_list_id AND status='archived') THEN RAISE EXCEPTION 'listino archiviato'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER price_lists_validate BEFORE INSERT OR UPDATE ON public.price_lists FOR EACH ROW EXECUTE FUNCTION validate_catalog_row();
CREATE TRIGGER products_validate BEFORE INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION validate_catalog_row();
CREATE TRIGGER product_prices_validate BEFORE INSERT OR UPDATE ON public.product_prices FOR EACH ROW EXECUTE FUNCTION validate_catalog_row();

-- Pubblica il listino attivo sui campi usati da configuratore, pro-forma e offerte (UK→A, FR→B, DE→C)
CREATE OR REPLACE FUNCTION public.apply_active_price_list() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE pl uuid; o record; s jsonb; c jsonb; si int; ci int; newsizes jsonb; newcoats jsonb; p record; prices jsonb; k text;
BEGIN
 IF auth.uid() IS NOT NULL AND NOT (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'commerciale')) THEN RAISE EXCEPTION 'forbidden'; END IF;
 SELECT id INTO pl FROM price_lists WHERE status='active';
 IF pl IS NULL THEN RETURN; END IF;
 FOR o IN SELECT id, sizes FROM configurator_ovens WHERE sizes IS NOT NULL AND jsonb_typeof(sizes)='array' LOOP
  newsizes := '[]'::jsonb;
  FOR si IN 0..jsonb_array_length(o.sizes)-1 LOOP
   s := o.sizes->si; newcoats := '[]'::jsonb;
   IF jsonb_typeof(s->'coatings')='array' THEN
    FOR ci IN 0..jsonb_array_length(s->'coatings')-1 LOOP
     c := s->'coatings'->ci; prices := coalesce(c->'prices','{}'::jsonb);
     FOR p IN SELECT pr.component, pp.market, pp.amount FROM products pr JOIN product_prices pp ON pp.product_id=pr.id AND pp.price_list_id=pl
       WHERE pr.oven_id=o.id AND pr.size_label=(s->>'diameter') AND pr.coating=(c->>'name') LOOP
      k := CASE p.market WHEN 'UK' THEN 'listA' WHEN 'FR' THEN 'listB' ELSE 'listC' END;
      prices := jsonb_set(prices, ARRAY[k], coalesce(prices->k,'{}'::jsonb) || jsonb_build_object(p.component, coalesce(p.amount,0)));
     END LOOP;
     newcoats := newcoats || jsonb_build_array(jsonb_set(c,'{prices}',prices));
    END LOOP;
    s := jsonb_set(s,'{coatings}',newcoats);
   END IF;
   newsizes := newsizes || jsonb_build_array(s);
  END LOOP;
  UPDATE configurator_ovens SET sizes=newsizes WHERE id=o.id AND sizes IS DISTINCT FROM newsizes;
 END LOOP;
 UPDATE burners b SET
  price=coalesce((SELECT pp.amount FROM products pr JOIN product_prices pp ON pp.product_id=pr.id AND pp.price_list_id=pl AND pp.market='UK' WHERE pr.burner_id=b.id LIMIT 1),b.price),
  price_b=coalesce((SELECT pp.amount FROM products pr JOIN product_prices pp ON pp.product_id=pr.id AND pp.price_list_id=pl AND pp.market='FR' WHERE pr.burner_id=b.id LIMIT 1),b.price_b),
  price_c=coalesce((SELECT pp.amount FROM products pr JOIN product_prices pp ON pp.product_id=pr.id AND pp.price_list_id=pl AND pp.market='DE' WHERE pr.burner_id=b.id LIMIT 1),b.price_c)
 WHERE EXISTS (SELECT 1 FROM products pr WHERE pr.burner_id=b.id);
END $$;
REVOKE ALL ON FUNCTION public.apply_active_price_list() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.apply_active_price_list() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.activate_price_list(_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT (has_role(auth.uid(),'admin')) THEN RAISE EXCEPTION 'Solo un amministratore può attivare un listino'; END IF;
 UPDATE price_lists SET status='archived' WHERE status='active' AND id<>_id;
 UPDATE price_lists SET status='active' WHERE id=_id;
 PERFORM apply_active_price_list();
END $$;
REVOKE ALL ON FUNCTION public.activate_price_list(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.activate_price_list(uuid) TO authenticated, service_role;

-- Dati iniziali
INSERT INTO public.price_lists(year,status,notes) VALUES (2027,'active','Creato dai listini A/B/C (A→UK, B→FR, C→DE)');

INSERT INTO public.products(category,name,image_url,oven_id,size_label,coating,component,source_key,sort_order)
SELECT 'forno', o.model_name || ' ' || (s->>'diameter') || ' · ' || (c->>'name') || ' · ' ||
  CASE comp WHEN 'base' THEN 'Legna' WHEN 'gas' THEN 'Gas' WHEN 'electric' THEN 'Elettrico' ELSE 'Costruito sul posto' END,
  o.image_url, o.id, s->>'diameter', c->>'name', comp,
  'oven:'||o.id||':'||(s->>'diameter')||':'||(c->>'name')||':'||comp, 0
FROM configurator_ovens o
CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(o.sizes)='array' THEN o.sizes ELSE '[]' END) s
CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(s->'coatings')='array' THEN s->'coatings' ELSE '[]' END) c
CROSS JOIN LATERAL unnest(ARRAY['base','gas','electric','onSite']) comp
WHERE coalesce((c->'prices'->'listA'->>comp)::numeric,0)+coalesce((c->'prices'->'listB'->>comp)::numeric,0)+coalesce((c->'prices'->'listC'->>comp)::numeric,0)+coalesce((c->'prices'->'listReseller'->>comp)::numeric,0) > 0
ON CONFLICT (source_key) DO NOTHING;

INSERT INTO public.products(category,name,description,image_url,burner_id,source_key,is_active)
SELECT 'bruciatore', b.name, b.description, b.image_url, b.id, 'burner:'||b.id, b.is_active FROM burners b
ON CONFLICT (source_key) DO NOTHING;

INSERT INTO public.product_prices(price_list_id,product_id,market,amount,currency)
SELECT pl.id, pr.id, m.market, nullif((c->'prices'->m.k->>pr.component)::numeric,0), 'EUR'
FROM price_lists pl, products pr
JOIN configurator_ovens o ON o.id=pr.oven_id
CROSS JOIN LATERAL jsonb_array_elements(o.sizes) s
CROSS JOIN LATERAL jsonb_array_elements(s->'coatings') c
CROSS JOIN (VALUES ('UK','listA'),('FR','listB'),('DE','listC')) m(market,k)
WHERE pl.year=2027 AND pr.category='forno' AND s->>'diameter'=pr.size_label AND c->>'name'=pr.coating
ON CONFLICT DO NOTHING;

INSERT INTO public.product_prices(price_list_id,product_id,market,amount,currency)
SELECT pl.id, pr.id, m.market, nullif(CASE m.market WHEN 'UK' THEN b.price WHEN 'FR' THEN b.price_b ELSE b.price_c END,0), 'EUR'
FROM price_lists pl, products pr JOIN burners b ON b.id=pr.burner_id
CROSS JOIN (VALUES ('UK'),('FR'),('DE')) m(market)
WHERE pl.year=2027
ON CONFLICT DO NOTHING;

INSERT INTO public.discount_tiers(code,label,percentage,sort_order)
SELECT 'cliente','Cliente finale',0,1
UNION ALL SELECT 'partner','Partner',0,2
UNION ALL SELECT 'rivenditore','Rivenditore', coalesce((
  SELECT round(avg(1 - (c->'prices'->'listReseller'->>comp)::numeric / (c->'prices'->'listA'->>comp)::numeric)*100)
  FROM configurator_ovens o
  CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(o.sizes)='array' THEN o.sizes ELSE '[]' END) s
  CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(s->'coatings')='array' THEN s->'coatings' ELSE '[]' END) c
  CROSS JOIN LATERAL unnest(ARRAY['base','gas','electric','onSite']) comp
  WHERE coalesce((c->'prices'->'listA'->>comp)::numeric,0)>0 AND coalesce((c->'prices'->'listReseller'->>comp)::numeric,0)>0
    AND (c->'prices'->'listReseller'->>comp)::numeric < (c->'prices'->'listA'->>comp)::numeric),0),3;