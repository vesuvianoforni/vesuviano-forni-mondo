REVOKE ALL ON public.product_asset_links FROM anon;
DO $test$
DECLARE
  ids uuid[];
  asset uuid;
  n integer;
  failed boolean := false;
BEGIN
  PERFORM set_config('request.jwt.claim.role', 'service_role', true);
  PERFORM set_config('request.jwt.claims', '{"role":"service_role"}', true);
  SELECT array_agg(id) INTO ids FROM (SELECT id FROM public.products ORDER BY id LIMIT 2) p;
  IF cardinality(ids) <> 2 THEN RAISE EXCEPTION 'Test requires two products'; END IF;
  BEGIN
    asset := public.save_product_material(NULL, '{"title":"Verifica temporanea collegamenti multipli","kind":"scheda","language":"fr","url":"https://vesuvianoforni.com/test-material.pdf","tags":[]}'::jsonb, ids || ids[1]);
    SELECT count(*) INTO n FROM public.product_asset_links WHERE asset_id = asset;
    IF n <> 2 THEN RAISE EXCEPTION 'Expected two unique product links, got %', n; END IF;
    PERFORM public.save_product_material(asset, '{"title":"Verifica temporanea collegamenti multipli","kind":"scheda","language":"fr","tags":[]}'::jsonb, ARRAY[ids[2]]);
    IF NOT EXISTS (SELECT 1 FROM public.product_assets WHERE id=asset AND product_id=ids[2]) THEN RAISE EXCEPTION 'Primary link not updated'; END IF;
    SELECT count(*) INTO n FROM public.product_asset_links WHERE asset_id = asset;
    IF n <> 1 THEN RAISE EXCEPTION 'Removing one product lost or retained wrong links'; END IF;
    BEGIN
      PERFORM public.save_product_material(asset, '{"title":"Invalid update","kind":"scheda","tags":[]}'::jsonb, ARRAY[gen_random_uuid()]);
    EXCEPTION WHEN OTHERS THEN failed := true;
    END;
    IF NOT failed OR NOT EXISTS (SELECT 1 FROM public.product_assets WHERE id=asset AND title='Verifica temporanea collegamenti multipli') THEN RAISE EXCEPTION 'Invalid update was not atomic'; END IF;
    PERFORM public.save_product_material(asset, '{"title":"Verifica temporanea collegamenti multipli","kind":"scheda","language":"fr","tags":[]}'::jsonb, '{}'::uuid[]);
    IF EXISTS (SELECT 1 FROM public.product_asset_links WHERE asset_id=asset) OR NOT EXISTS (SELECT 1 FROM public.product_assets WHERE id=asset AND product_id IS NULL) THEN RAISE EXCEPTION 'General material did not retain file without links'; END IF;
    PERFORM set_config('request.jwt.claim.role', 'anon', true);
    PERFORM set_config('request.jwt.claims', '{"role":"anon"}', true);
    failed := false;
    BEGIN
      PERFORM public.save_product_material(asset, '{"title":"Unauthorized","kind":"scheda","tags":[]}'::jsonb, ids);
    EXCEPTION WHEN insufficient_privilege THEN failed := true;
    END;
    IF NOT failed THEN RAISE EXCEPTION 'Anonymous save was not rejected'; END IF;
    RAISE EXCEPTION USING ERRCODE = 'PZ001', MESSAGE = 'Verification succeeded; roll back temporary material';
  EXCEPTION WHEN SQLSTATE 'PZ001' THEN NULL;
  END;
END;
$test$;