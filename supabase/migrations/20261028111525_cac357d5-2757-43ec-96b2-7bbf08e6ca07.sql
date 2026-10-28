ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS country text, ADD COLUMN IF NOT EXISTS city text, ADD COLUMN IF NOT EXISTS priority text, ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;
CREATE TABLE public.crm_csv_import_staging (id text PRIMARY KEY, payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.crm_csv_import_staging TO service_role;
ALTER TABLE public.crm_csv_import_staging ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages temporary CSV import" ON public.crm_csv_import_staging FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE OR REPLACE FUNCTION public.sync_pipeline_stage() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.pipeline_stage IS DISTINCT FROM OLD.pipeline_stage THEN RETURN NEW; END IF;
  IF OLD.pipeline_stage IN ('vinto', 'perso') THEN RETURN NEW; END IF;
  IF NEW.feedback_status = 'not_interested' THEN NEW.pipeline_stage := 'perso';
  ELSIF NEW.status = 'payment_initiated' AND NEW.pipeline_stage IN ('nuovo', 'pre_qualificato', 'qualificato') THEN NEW.pipeline_stage := 'trattativa';
  ELSIF (NEW.is_used OR NEW.feedback_status = 'interested' OR NEW.status = 'interested') AND NEW.pipeline_stage IN ('nuovo', 'pre_qualificato') THEN NEW.pipeline_stage := 'qualificato';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_pipeline_stage() FROM PUBLIC, anon, authenticated;