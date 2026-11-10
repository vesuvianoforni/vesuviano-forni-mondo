DROP FUNCTION public.telegram_ai_call_summary_enqueue();
CREATE OR REPLACE FUNCTION public.telegram_notify_enqueue() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n public.telegram_notifications;
BEGIN
 IF NEW.created_at<now()-interval '2 hours' THEN RETURN NEW; END IF;
 IF TG_TABLE_NAME='crm_messages' THEN
  IF TG_OP='UPDATE' THEN
   IF NEW.channel<>'call' OR coalesce(NEW.metadata->>'source','')<>'bruno_telnyx' OR coalesce(NEW.metadata->>'summary_status','')<>'ready' OR coalesce(OLD.metadata->>'summary_status','')='ready' THEN RETURN NEW; END IF;
  END IF;
  IF NEW.channel NOT IN ('whatsapp_api','wasender','email','call') THEN RETURN NEW; END IF;
  IF NEW.channel='call' THEN
   IF NEW.metadata->>'source'='bruno_telnyx' AND NEW.metadata->>'summary_status'='pending' THEN RETURN NEW; END IF;
   IF NEW.direction<>'inbound' AND coalesce(NEW.metadata->>'source','')<>'bruno_telnyx' THEN RETURN NEW; END IF;
  ELSIF NEW.direction<>'inbound' THEN RETURN NEW; END IF;
  INSERT INTO public.telegram_notifications(kind,lead_id,message_id) SELECT 'message',NEW.lead_id,NEW.id WHERE NOT EXISTS(SELECT 1 FROM public.telegram_notifications WHERE message_id=NEW.id AND kind='message') RETURNING * INTO n;
 ELSE INSERT INTO public.telegram_notifications(kind,lead_id) VALUES('lead',NEW.id) RETURNING * INTO n;
 END IF;
 IF n.id IS NOT NULL THEN BEGIN PERFORM net.http_post(url:='https://lgueucxznbqgvhpjzurf.supabase.co/functions/v1/telegram-bruno',headers:='{"Content-Type":"application/json"}'::jsonb,body:=jsonb_build_object('notify_id',n.id,'token',n.token),timeout_milliseconds:=10000); EXCEPTION WHEN OTHERS THEN NULL; END; END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.telegram_notify_enqueue() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.telegram_direct_call_enqueue() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.telegram_notify_enqueue(),public.telegram_direct_call_enqueue() TO service_role;