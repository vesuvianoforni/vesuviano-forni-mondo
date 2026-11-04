ALTER TABLE public.telegram_notifications
  ADD COLUMN IF NOT EXISTS handled_by text,
  ADD COLUMN IF NOT EXISTS handled_at timestamptz,
  ADD COLUMN IF NOT EXISTS snoozed_until timestamptz,
  ADD COLUMN IF NOT EXISTS reminded_at timestamptz,
  ADD COLUMN IF NOT EXISTS tg_messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS body text;
CREATE INDEX IF NOT EXISTS telegram_notifications_lead_sent_idx ON public.telegram_notifications(lead_id, sent_at DESC);
ALTER TABLE public.telegram_pending
  ADD COLUMN IF NOT EXISTS decided_by text,
  ADD COLUMN IF NOT EXISTS decided_at timestamptz;

CREATE OR REPLACE FUNCTION public.telegram_cron_kick()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE n public.telegram_notifications;
BEGIN
  DELETE FROM public.telegram_notifications WHERE kind = 'tick' AND created_at < now() - interval '1 day';
  INSERT INTO public.telegram_notifications(kind) VALUES ('tick') RETURNING * INTO n;
  PERFORM net.http_post(url := 'https://lgueucxznbqgvhpjzurf.supabase.co/functions/v1/telegram-bruno',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := jsonb_build_object('notify_id', n.id, 'token', n.token), timeout_milliseconds := 10000);
END $$;
REVOKE ALL ON FUNCTION public.telegram_cron_kick() FROM PUBLIC, anon, authenticated;

SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'telegram-bruno-tick';
SELECT cron.schedule('telegram-bruno-tick', '0 7-17 * * 1-5', $$SELECT public.telegram_cron_kick();$$);