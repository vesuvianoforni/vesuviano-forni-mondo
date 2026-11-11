DO $repair$
DECLARE r record; duplicate public.leads; original public.leads; linked integer;
BEGIN
 FOR r IN SELECT * FROM (VALUES
  ('73e67fb8-bf8d-4d9f-be0d-c62e4bb2cc13'::uuid,'1ddffbb7-62da-4c09-aae6-e18e82ea00e2'::uuid,'07999488655','+447999488655','Regno Unito'),
  ('ca573f94-d497-4264-8ae8-75e35417c5c9'::uuid,'af497771-4b6d-411b-9991-27d447d348d9'::uuid,'0872646302','+353872646302','Irlanda')
 ) AS x(duplicate_id,original_id,local_phone,e164,country) LOOP
  SELECT * INTO duplicate FROM public.leads WHERE id=r.duplicate_id FOR UPDATE;
  SELECT * INTO original FROM public.leads WHERE id=r.original_id FOR UPDATE;
  IF duplicate.id IS NULL OR original.id IS NULL THEN RAISE EXCEPTION 'Schede della riparazione non trovate'; END IF;
  IF duplicate.phone<>r.e164 OR original.phone NOT IN (r.local_phone,r.e164) THEN RAISE EXCEPTION 'Numeri cambiati: riparazione interrotta'; END IF;
  IF duplicate.source<>'cold_call' OR duplicate.status<>'nuovo' OR duplicate.created_at<'2026-11-11 10:20:00+00'::timestamptz
   OR nullif(btrim(duplicate.contact_name),'') IS NOT NULL OR nullif(btrim(duplicate.company_name),'') IS NOT NULL
   OR nullif(btrim(duplicate.email),'') IS NOT NULL OR nullif(btrim(duplicate.notes),'') IS NOT NULL
   OR duplicate.next_activity_date IS NOT NULL OR duplicate.next_activity_type IS NOT NULL OR duplicate.next_activity_notes IS NOT NULL
   OR duplicate.assigned_to IS NOT NULL OR duplicate.next_activity_assigned_to IS NOT NULL OR duplicate.website_lead_id IS NOT NULL
   OR coalesce(duplicate.qualification,'{}'::jsonb)<>'{}'::jsonb OR coalesce(duplicate.value,0)<>0
   OR duplicate.discount_override IS NOT NULL OR duplicate.bruno_mode<>'draft' THEN RAISE EXCEPTION 'Doppione arricchito: riparazione interrotta'; END IF;
  SELECT (SELECT count(*) FROM public.bruno_actions WHERE lead_id=r.duplicate_id)
    +(SELECT count(*) FROM public.bruno_voice_calls WHERE lead_id=r.duplicate_id)
    +(SELECT count(*) FROM public.chat_conversations WHERE lead_id=r.duplicate_id)
    +(SELECT count(*) FROM public.commercial_offers WHERE lead_id=r.duplicate_id)
    +(SELECT count(*) FROM public.crm_inbound_calls WHERE lead_id=r.duplicate_id)
    +(SELECT count(*) FROM public.email_items WHERE lead_id=r.duplicate_id)
    +(SELECT count(*) FROM public.email_outbox WHERE lead_id=r.duplicate_id)
    +(SELECT count(*) FROM public.newsletter_recipients WHERE lead_id=r.duplicate_id)
    +(SELECT count(*) FROM public.outreach_prospects WHERE lead_id=r.duplicate_id) INTO linked;
  IF linked<>0 THEN RAISE EXCEPTION 'Altri documenti associati: riparazione interrotta'; END IF;
  UPDATE public.leads SET phone=r.e164,country=r.country WHERE id=r.original_id;
  UPDATE public.crm_direct_calls SET lead_id=r.original_id WHERE lead_id=r.duplicate_id;
  UPDATE public.crm_messages SET lead_id=r.original_id WHERE lead_id=r.duplicate_id;
  UPDATE public.telegram_notifications SET lead_id=r.original_id,handled_at=coalesce(handled_at,now()),handled_by=coalesce(handled_by,'duplicate_reconciled') WHERE lead_id=r.duplicate_id AND kind='lead';
  UPDATE public.telegram_notifications SET lead_id=r.original_id WHERE lead_id=r.duplicate_id;
  DELETE FROM public.leads WHERE id=r.duplicate_id;
 END LOOP;
END $repair$;