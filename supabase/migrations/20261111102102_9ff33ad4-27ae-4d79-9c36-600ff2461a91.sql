CREATE OR REPLACE FUNCTION public.telegram_filter_unanswered_calls()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NEW.kind = 'direct_call' AND EXISTS (
  SELECT 1 FROM public.crm_direct_calls c WHERE c.id = NEW.direct_call_id
   AND (c.answered_at IS NULL
        OR c.ended_at IS NULL
        OR c.ended_at - c.answered_at < interval '20 seconds'
        OR c.summary ILIKE '%segreteria%'
        OR c.summary ILIKE '%voicemail%')
 ) THEN RETURN NULL; END IF;
 IF NEW.kind = 'message' AND EXISTS (
  SELECT 1 FROM public.crm_messages m WHERE m.id = NEW.message_id AND m.channel = 'call'
   AND public.telegram_call_has_no_answer(m.metadata)
 ) THEN RETURN NULL; END IF;
 RETURN NEW;
END; $$;