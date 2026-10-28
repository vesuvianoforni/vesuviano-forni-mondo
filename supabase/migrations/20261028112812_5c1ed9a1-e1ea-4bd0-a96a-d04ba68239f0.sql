ALTER FUNCTION public.stage_zapper_csv_once(text) SECURITY INVOKER;
GRANT INSERT ON public.crm_csv_import_staging TO anon;
CREATE POLICY "Only exact uploaded CSV may be staged" ON public.crm_csv_import_staging FOR INSERT TO anon WITH CHECK (id='e74e8812a356ba913d75cee9a02020358bfad57d8ee7016a183cd64b179ab497');
CREATE OR REPLACE FUNCTION public.stage_zapper_csv_once(p_payload text) RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF encode(extensions.digest(convert_to(p_payload, 'UTF8'), 'sha256'), 'hex') <> 'e74e8812a356ba913d75cee9a02020358bfad57d8ee7016a183cd64b179ab497' THEN RAISE EXCEPTION 'File non autorizzato'; END IF;
  INSERT INTO public.crm_csv_import_staging (id,payload) VALUES ('e74e8812a356ba913d75cee9a02020358bfad57d8ee7016a183cd64b179ab497', p_payload::jsonb);
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.stage_zapper_csv_once(text) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.stage_zapper_csv_once(text) TO anon;