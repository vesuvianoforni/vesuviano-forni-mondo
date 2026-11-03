CREATE OR REPLACE FUNCTION public.mario_hourly_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 -- IONOS provider limit: at most 50 submissions per rolling hour.
 IF NEW.smtp_status='sending' AND OLD.smtp_status='pending' AND
    (SELECT count(*) FROM public.outreach_outbox WHERE attempted_at>now()-interval '1 hour') >= 50 THEN
   RAISE EXCEPTION 'Limite IONOS: massimo 50 email all''ora';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER outreach_outbox_hourly_guard BEFORE UPDATE ON public.outreach_outbox FOR EACH ROW EXECUTE FUNCTION public.mario_hourly_guard();