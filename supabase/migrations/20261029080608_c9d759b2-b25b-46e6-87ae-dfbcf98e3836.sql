ALTER TABLE public.email_sync_runs ADD COLUMN worker_token uuid NOT NULL DEFAULT gen_random_uuid();
REVOKE SELECT ON public.email_sync_runs FROM authenticated;
GRANT SELECT (id,mailbox_id,kind,status,processed,linked,error_code,started_at,finished_at,created_at,updated_at) ON public.email_sync_runs TO authenticated;