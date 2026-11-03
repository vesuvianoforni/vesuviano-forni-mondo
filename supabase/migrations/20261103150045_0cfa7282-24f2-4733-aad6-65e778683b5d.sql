CREATE TABLE public.telegram_pending (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id bigint NOT NULL,
  actions jsonb NOT NULL,
  summary text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.telegram_pending TO service_role;
ALTER TABLE public.telegram_pending ENABLE ROW LEVEL SECURITY;