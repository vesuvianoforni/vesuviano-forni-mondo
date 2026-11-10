CREATE OR REPLACE FUNCTION public.telegram_call_has_no_answer(p_metadata jsonb)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
 SELECT
  lower(replace(coalesce(p_metadata->>'call_status', p_metadata->>'status', ''), '-', '_')) IN ('no_answer','missed','busy','failed','canceled','cancelled','unreachable','no_conversation')
  OR lower(replace(coalesce(p_metadata->>'error_code', ''), '-', '_')) IN ('no_answer','busy','unreachable','no_conversation')
  OR CASE WHEN coalesce(p_metadata->>'duration_seconds', '') ~ '^-?[0-9]+([.][0-9]+)?$'
          THEN (p_metadata->>'duration_seconds')::numeric <= 0 ELSE false END;
$$;
REVOKE ALL ON FUNCTION public.telegram_call_has_no_answer(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.telegram_call_has_no_answer(jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.telegram_filter_unanswered_calls()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NEW.kind = 'direct_call' AND EXISTS (
  SELECT 1 FROM public.crm_direct_calls c WHERE c.id = NEW.direct_call_id AND c.answered_at IS NULL
 ) THEN RETURN NULL; END IF;
 IF NEW.kind = 'message' AND EXISTS (
  SELECT 1 FROM public.crm_messages m WHERE m.id = NEW.message_id AND m.channel = 'call'
   AND public.telegram_call_has_no_answer(m.metadata)
 ) THEN RETURN NULL; END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.telegram_filter_unanswered_calls() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.telegram_filter_unanswered_calls() TO service_role;
CREATE TRIGGER telegram_notifications_filter_unanswered_calls
 BEFORE INSERT ON public.telegram_notifications
 FOR EACH ROW EXECUTE FUNCTION public.telegram_filter_unanswered_calls();

-- Only notification queue entries are removed; all source CRM records remain untouched.
DELETE FROM public.telegram_notifications n
WHERE n.sent_at IS NULL AND (
 (n.kind = 'direct_call' AND EXISTS (SELECT 1 FROM public.crm_direct_calls c WHERE c.id = n.direct_call_id AND c.answered_at IS NULL))
 OR (n.kind = 'message' AND EXISTS (SELECT 1 FROM public.crm_messages m WHERE m.id = n.message_id AND m.channel = 'call' AND public.telegram_call_has_no_answer(m.metadata)))
);
UPDATE public.telegram_notifications n
SET handled_at = now(), handled_by = 'Esclusa: chiamata senza risposta', snoozed_until = NULL
WHERE n.sent_at IS NOT NULL AND n.handled_at IS NULL AND (
 (n.kind = 'direct_call' AND EXISTS (SELECT 1 FROM public.crm_direct_calls c WHERE c.id = n.direct_call_id AND c.answered_at IS NULL))
 OR (n.kind = 'message' AND EXISTS (SELECT 1 FROM public.crm_messages m WHERE m.id = n.message_id AND m.channel = 'call' AND public.telegram_call_has_no_answer(m.metadata)))
);