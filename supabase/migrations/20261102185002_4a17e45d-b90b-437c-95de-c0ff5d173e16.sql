CREATE OR REPLACE FUNCTION public.mario_reply_match(p_sender text) RETURNS TABLE(id uuid,email text) LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT p.id,p.email FROM public.outreach_prospects p WHERE lower(p.email)=lower(p_sender) LIMIT 2; $$;
REVOKE ALL ON FUNCTION public.mario_reply_match(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.mario_reply_match(text) TO service_role;
CREATE OR REPLACE FUNCTION public.project_mario_acceptance(p_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE o public.outreach_outbox;m public.outreach_messages; BEGIN
 SELECT * INTO o FROM public.outreach_outbox WHERE id=p_id AND smtp_status='accepted' AND accepted_at IS NOT NULL FOR UPDATE;
 IF o.id IS NULL THEN RETURN; END IF;
 SELECT * INTO m FROM public.outreach_messages WHERE id=o.outreach_message_id FOR UPDATE;
 UPDATE public.outreach_messages SET status='sent',sent_at=o.accepted_at,message_id=o.message_id WHERE id=m.id;
 UPDATE public.outreach_prospects SET status=CASE WHEN m.step=2 THEN 'done' ELSE 'sequence' END,step=GREATEST(step,m.step+1),last_sent_at=GREATEST(last_sent_at,o.accepted_at) WHERE id=o.prospect_id AND replied_at IS NULL AND status NOT IN ('unsubscribed','bounced','suppressed','manual');
 IF m.step=0 THEN UPDATE public.outreach_messages SET scheduled_at=o.accepted_at+CASE step WHEN 1 THEN interval '3 days' ELSE interval '7 days' END WHERE prospect_id=o.prospect_id AND direction='outbound' AND step IN (1,2) AND scheduled_at IS NULL; END IF;
 END; $$;
REVOKE ALL ON FUNCTION public.project_mario_acceptance(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.project_mario_acceptance(uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.mario_due_outbox() RETURNS SETOF public.outreach_outbox LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
 SELECT o.* FROM public.outreach_outbox o JOIN public.outreach_messages m ON m.id=o.outreach_message_id JOIN public.outreach_prospects p ON p.id=o.prospect_id
 WHERE o.smtp_status='pending' AND o.attempted_at IS NULL AND m.status='approved' AND m.scheduled_at<=now() AND p.replied_at IS NULL AND p.status NOT IN ('replied','unsubscribed','bounced','suppressed','manual','done') AND p.qualified AND p.recipient_eligibility='eligible' AND p.email=o.recipient AND p.country IN ('UK','FR') AND NOT EXISTS(SELECT 1 FROM public.outreach_suppressions WHERE lower(value) IN (lower(p.email),lower(p.domain))) AND NOT EXISTS(SELECT 1 FROM public.outreach_outbox bad WHERE bad.prospect_id=p.id AND bad.smtp_status IN ('sending','unknown','rejected')) AND (m.step=0 OR EXISTS(SELECT 1 FROM public.outreach_messages prev WHERE prev.prospect_id=p.id AND prev.step=m.step-1 AND prev.status='sent'))
 ORDER BY m.scheduled_at,o.created_at LIMIT 20;
$$;
REVOKE ALL ON FUNCTION public.mario_due_outbox() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.mario_due_outbox() TO service_role;