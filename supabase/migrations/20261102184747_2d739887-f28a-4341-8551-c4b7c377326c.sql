REVOKE SELECT ON public.outreach_settings FROM authenticated;
GRANT SELECT (key,paused,daily_limit,markets,send_markets,cities,sender_email,pause_reason,updated_at,min_interval_seconds,window_start,window_end,timezone,weekdays,provider_approval_reference,provider_verified_at,preflight,next_delivery_at) ON public.outreach_settings TO authenticated;
CREATE OR REPLACE FUNCTION public.validate_mario_snapshot() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 IF TG_TABLE_NAME='outreach_messages' THEN
  IF OLD.status IN ('approved','sent') AND (NEW.subject IS DISTINCT FROM OLD.subject OR NEW.body IS DISTINCT FROM OLD.body OR NEW.html IS DISTINCT FROM OLD.html OR NEW.prospect_id IS DISTINCT FROM OLD.prospect_id OR NEW.step IS DISTINCT FROM OLD.step OR NEW.approved_at IS DISTINCT FROM OLD.approved_at OR NEW.approved_by IS DISTINCT FROM OLD.approved_by) THEN RAISE EXCEPTION 'Approved content is immutable'; END IF;
 ELSE
  IF NEW.smtp_status NOT IN ('pending','sending','accepted','rejected','unknown') OR NEW.copy_status NOT IN ('pending','found','appended','failed','unknown') THEN RAISE EXCEPTION 'Invalid outreach email state'; END IF;
  IF OLD.smtp_status IN ('sending','accepted','rejected','unknown') AND NEW.smtp_status='pending' THEN RAISE EXCEPTION 'Outreach resend forbidden'; END IF;
  IF NEW.recipient IS DISTINCT FROM OLD.recipient OR NEW.subject IS DISTINCT FROM OLD.subject OR NEW.rendered_text IS DISTINCT FROM OLD.rendered_text OR NEW.rendered_html IS DISTINCT FROM OLD.rendered_html OR NEW.message_id IS DISTINCT FROM OLD.message_id OR NEW.prospect_id IS DISTINCT FROM OLD.prospect_id OR NEW.outreach_message_id IS DISTINCT FROM OLD.outreach_message_id OR (OLD.mime IS NOT NULL AND NEW.mime IS DISTINCT FROM OLD.mime) THEN RAISE EXCEPTION 'Outreach snapshot is immutable'; END IF;
 END IF;
 RETURN NEW; END; $$;
CREATE TRIGGER outreach_message_snapshot BEFORE UPDATE ON public.outreach_messages FOR EACH ROW EXECUTE FUNCTION public.validate_mario_snapshot();
CREATE TRIGGER outreach_outbox_snapshot BEFORE UPDATE ON public.outreach_outbox FOR EACH ROW EXECUTE FUNCTION public.validate_mario_snapshot();