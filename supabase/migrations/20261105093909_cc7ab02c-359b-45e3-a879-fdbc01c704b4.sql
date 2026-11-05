CREATE OR REPLACE FUNCTION public.save_bruno_voice_qualification(p_call uuid,p_summary text,p_facts jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c public.bruno_voice_calls; allowed text[]:=ARRAY['uso','volume_pizze','misura','alimentazione','finitura','paese','citta','cap','accesso','tempi','modello_consigliato','note']; facts jsonb;
BEGIN
 SELECT * INTO c FROM public.bruno_voice_calls WHERE id=p_call FOR UPDATE;
 IF c.id IS NULL OR c.approved_at IS NULL OR c.started_at IS NULL OR c.started_at<now()-interval '15 minutes' OR c.status NOT IN ('starting','dialing','active','completed') THEN RAISE EXCEPTION 'Approved recent call required'; END IF;
 IF p_summary IS NULL OR length(p_summary) NOT BETWEEN 1 AND 4000 OR jsonb_typeof(p_facts)<>'object' THEN RAISE EXCEPTION 'Invalid qualification'; END IF;
 IF EXISTS (SELECT 1 FROM jsonb_each(p_facts) x WHERE NOT x.key=ANY(allowed) OR jsonb_typeof(x.value)<>'string' OR length(x.value#>>'{}')>1200) THEN RAISE EXCEPTION 'Invalid qualification fields'; END IF;
 SELECT coalesce(jsonb_object_agg(x.key,x.value),'{}'::jsonb) INTO facts FROM jsonb_each(p_facts) x WHERE length(trim(x.value#>>'{}'))>0;
 PERFORM 1 FROM public.leads WHERE id=c.lead_id FOR UPDATE;
 UPDATE public.bruno_voice_calls SET summary=p_summary,qualification=qualification||facts WHERE id=c.id;
 UPDATE public.leads SET qualification=coalesce(qualification,'{}'::jsonb)||facts WHERE id=c.lead_id;
END $$;
REVOKE ALL ON FUNCTION public.save_bruno_voice_qualification(uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_bruno_voice_qualification(uuid,text,jsonb) TO service_role;