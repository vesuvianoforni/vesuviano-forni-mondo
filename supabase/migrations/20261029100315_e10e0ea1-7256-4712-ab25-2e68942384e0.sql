CREATE TABLE public.newsletter_ai_state (
  key text PRIMARY KEY,
  status integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.newsletter_ai_state TO service_role;
ALTER TABLE public.newsletter_ai_state ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER newsletter_ai_state_updated BEFORE UPDATE ON public.newsletter_ai_state FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();