CREATE OR REPLACE FUNCTION public.stage_zapper_csv_once(p_payload text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF encode(extensions.digest(convert_to(p_payload, 'UTF8'), 'sha256'), 'hex') <> 'e74e8812a356ba913d75cee9a02020358bfad57d8ee7016a183cd64b179ab497' THEN
    RAISE EXCEPTION 'File non autorizzato';
  END IF;
  INSERT INTO public.crm_csv_import_staging (id, payload) VALUES ('e74e8812a356ba913d75cee9a02020358bfad57d8ee7016a183cd64b179ab497', p_payload::jsonb) ON CONFLICT (id) DO NOTHING;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.stage_zapper_csv_once(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.stage_zapper_csv_once(text) TO anon;