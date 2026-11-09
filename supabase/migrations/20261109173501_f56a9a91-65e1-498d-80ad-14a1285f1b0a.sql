ALTER TABLE public.telegram_notifications ADD COLUMN direct_call_id uuid REFERENCES public.crm_direct_calls(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX telegram_direct_call_once ON public.telegram_notifications(direct_call_id) WHERE direct_call_id IS NOT NULL;
CREATE OR REPLACE FUNCTION public.telegram_direct_call_enqueue() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n public.telegram_notifications;
BEGIN
 IF NEW.status NOT IN ('ended','failed','unknown') OR OLD.status IN ('ended','failed','unknown') THEN RETURN NEW; END IF;
 INSERT INTO public.telegram_notifications(kind,lead_id,direct_call_id) VALUES ('direct_call',NEW.lead_id,NEW.id) ON CONFLICT DO NOTHING RETURNING * INTO n;
 IF n.id IS NOT NULL THEN
  BEGIN
   PERFORM net.http_post(url:='https://lgueucxznbqgvhpjzurf.supabase.co/functions/v1/telegram-bruno',headers:='{"Content-Type":"application/json"}'::jsonb,body:=jsonb_build_object('notify_id',n.id,'token',n.token),timeout_milliseconds:=10000);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.telegram_direct_call_enqueue() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER crm_direct_call_telegram AFTER UPDATE ON public.crm_direct_calls FOR EACH ROW EXECUTE FUNCTION public.telegram_direct_call_enqueue();
CREATE OR REPLACE FUNCTION public.reconcile_bruno_uk_status(p_external_id text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE m public.crm_messages; s jsonb; md jsonb; state text; current_rank integer; incoming_rank integer; stamp timestamptz;
BEGIN
 SELECT * INTO m FROM public.crm_messages WHERE external_id=p_external_id AND channel='whatsapp_api' AND direction='outbound' AND metadata->>'whatsapp_line'='uk' FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 md:=coalesce(m.metadata,'{}'::jsonb); state:=m.status;
 FOR s IN
  SELECT status.value FROM public.whatsapp_webhook_events e
  CROSS JOIN LATERAL jsonb_array_elements(coalesce(e.payload->'entry','[]'::jsonb)) ent(value)
  CROSS JOIN LATERAL jsonb_array_elements(coalesce(ent.value->'changes','[]'::jsonb)) ch(value)
  CROSS JOIN LATERAL jsonb_array_elements(coalesce(ch.value->'value'->'statuses','[]'::jsonb)) status(value)
  WHERE status.value->>'id'=p_external_id AND ch.value->'value'->'metadata'->>'phone_number_id'='1487643001088299'
  AND status.value->>'status' IN ('sent','delivered','read','failed')
  ORDER BY CASE WHEN status.value->>'timestamp' ~ '^[0-9]{1,12}$' THEN (status.value->>'timestamp')::bigint ELSE 0 END
 LOOP
  stamp:=CASE WHEN s->>'timestamp' ~ '^[0-9]{1,12}$' THEN to_timestamp((s->>'timestamp')::bigint) ELSE NULL END;
  IF stamp IS NOT NULL AND NOT(md ? ((s->>'status')||'_at')) THEN md:=md||jsonb_build_object((s->>'status')||'_at',stamp); END IF;
  IF s ? 'errors' THEN md:=md||jsonb_build_object('delivery_errors',s->'errors'); END IF;
  current_rank:=CASE state WHEN 'read' THEN 4 WHEN 'delivered' THEN 3 WHEN 'failed' THEN 2 WHEN 'sent' THEN 1 ELSE 0 END;
  incoming_rank:=CASE s->>'status' WHEN 'read' THEN 4 WHEN 'delivered' THEN 3 WHEN 'failed' THEN 2 WHEN 'sent' THEN 1 ELSE 0 END;
  IF incoming_rank>current_rank THEN state:=s->>'status'; END IF;
 END LOOP;
 UPDATE public.crm_messages SET status=state,metadata=md,error=CASE WHEN state='failed' THEN coalesce(md->'delivery_errors'->0->>'message',md->'delivery_errors'->0->>'title','Consegna WhatsApp non riuscita') ELSE error END WHERE id=m.id;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.reconcile_bruno_uk_status(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_bruno_uk_status(text) TO service_role;