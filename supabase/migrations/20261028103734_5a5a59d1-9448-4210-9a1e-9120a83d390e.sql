ALTER TABLE public.configurator_sessions
ADD COLUMN IF NOT EXISTS pipeline_stage text NOT NULL DEFAULT 'nuovo';

-- Backfill: classifica le sessioni esistenti (ordine importante: prima gli stati finali)
UPDATE public.configurator_sessions s
SET pipeline_stage = 'vinto'
FROM public.configurator_quotes q
WHERE s.quote_id = q.id AND q.payment_completed IS TRUE;

UPDATE public.configurator_sessions
SET pipeline_stage = 'perso'
WHERE pipeline_stage = 'nuovo' AND feedback_status = 'not_interested';

UPDATE public.configurator_sessions
SET pipeline_stage = 'trattativa'
WHERE pipeline_stage = 'nuovo' AND (status = 'payment_initiated' OR quote_id IS NOT NULL);

UPDATE public.configurator_sessions
SET pipeline_stage = 'qualificato'
WHERE pipeline_stage = 'nuovo' AND (is_used OR feedback_status = 'interested' OR status = 'interested');

-- Trigger: avanzamento automatico della fase sugli eventi del configuratore.
-- Se la fase viene cambiata esplicitamente (dal commerciale nel CRM), la scelta manuale vince.
CREATE OR REPLACE FUNCTION public.sync_pipeline_stage()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Cambio manuale esplicito: rispettalo sempre
  IF NEW.pipeline_stage IS DISTINCT FROM OLD.pipeline_stage THEN
    RETURN NEW;
  END IF;

  -- Non uscire mai automaticamente dagli stati finali
  IF OLD.pipeline_stage IN ('vinto', 'perso') THEN
    RETURN NEW;
  END IF;

  IF NEW.feedback_status = 'not_interested' THEN
    NEW.pipeline_stage := 'perso';
  ELSIF NEW.status = 'payment_initiated' AND NEW.pipeline_stage IN ('nuovo', 'qualificato') THEN
    NEW.pipeline_stage := 'trattativa';
  ELSIF (NEW.is_used OR NEW.feedback_status = 'interested' OR NEW.status = 'interested') AND NEW.pipeline_stage = 'nuovo' THEN
    NEW.pipeline_stage := 'qualificato';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_pipeline_stage ON public.configurator_sessions;
CREATE TRIGGER trg_pipeline_stage
BEFORE UPDATE ON public.configurator_sessions
FOR EACH ROW EXECUTE FUNCTION public.sync_pipeline_stage();

-- Trigger: pagamento completato sul preventivo -> sessione vinta
CREATE OR REPLACE FUNCTION public.sync_pipeline_stage_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.payment_completed IS TRUE AND OLD.payment_completed IS DISTINCT FROM TRUE THEN
    UPDATE public.configurator_sessions
    SET pipeline_stage = 'vinto'
    WHERE quote_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_pipeline_stage_payment ON public.configurator_quotes;
CREATE TRIGGER trg_pipeline_stage_payment
AFTER UPDATE ON public.configurator_quotes
FOR EACH ROW EXECUTE FUNCTION public.sync_pipeline_stage_on_payment();