-- lovable-cron-fallback-reviewed: bounded queue; the 5-minute tick exists only while welcome jobs are waiting and unschedules itself once none remain.
CREATE TABLE public.bruno_welcome_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE REFERENCES public.leads(id) ON DELETE CASCADE,
  website_lead_id uuid,
  form_type text,
  status text NOT NULL DEFAULT 'pending',
  whatsapp_line text,
  language text,
  call_at timestamptz,
  message_id uuid NOT NULL DEFAULT gen_random_uuid(),
  sent_at timestamptz,
  call_id uuid,
  reason text,
  tick_token uuid NOT NULL DEFAULT gen_random_uuid(),
  lease_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bruno_welcome_jobs TO authenticated;
GRANT ALL ON public.bruno_welcome_jobs TO service_role;
ALTER TABLE public.bruno_welcome_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read welcome jobs" ON public.bruno_welcome_jobs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE TRIGGER bruno_welcome_jobs_updated BEFORE UPDATE ON public.bruno_welcome_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.validate_bruno_welcome_job() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
 IF NEW.status NOT IN ('pending','waiting_template','sent','called','done','skipped','failed') THEN RAISE EXCEPTION 'Stato benvenuto non valido'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER bruno_welcome_jobs_validate BEFORE INSERT OR UPDATE ON public.bruno_welcome_jobs FOR EACH ROW EXECUTE FUNCTION public.validate_bruno_welcome_job();

INSERT INTO public.bruno_automations(key, enabled) VALUES ('new_lead_welcome', false) ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.kick_bruno_welcome() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE j public.bruno_welcome_jobs;
BEGIN
 FOR j IN SELECT * FROM public.bruno_welcome_jobs
   WHERE (status IN ('pending','waiting_template') OR (status='sent' AND call_at<=now()))
     AND (lease_until IS NULL OR lease_until<now()) ORDER BY created_at LIMIT 10 LOOP
  PERFORM net.http_post(url:='https://lgueucxznbqgvhpjzurf.supabase.co/functions/v1/bruno-voice',headers:='{"Content-Type":"application/json"}'::jsonb,body:=jsonb_build_object('action','welcome_tick','job_id',j.id,'token',j.tick_token),timeout_milliseconds:=10000);
 END LOOP;
 PERFORM pg_advisory_xact_lock(hashtext('bruno-welcome-schedule'));
 IF NOT EXISTS(SELECT 1 FROM public.bruno_welcome_jobs WHERE status IN ('pending','waiting_template','sent')) THEN
  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname='bruno-welcome';
 END IF;
END $$;

CREATE OR REPLACE FUNCTION public.wake_bruno_welcome() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
 IF NEW.status IN ('pending','waiting_template','sent') THEN
  PERFORM pg_advisory_xact_lock(hashtext('bruno-welcome-schedule'));
  IF NOT EXISTS(SELECT 1 FROM cron.job WHERE jobname='bruno-welcome') THEN
   PERFORM cron.schedule('bruno-welcome','*/5 * * * *','SELECT public.kick_bruno_welcome()');
  END IF;
  IF TG_OP='INSERT' THEN
   PERFORM net.http_post(url:='https://lgueucxznbqgvhpjzurf.supabase.co/functions/v1/bruno-voice',headers:='{"Content-Type":"application/json"}'::jsonb,body:=jsonb_build_object('action','welcome_tick','job_id',NEW.id,'token',NEW.tick_token),timeout_milliseconds:=10000);
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER bruno_welcome_jobs_wake AFTER INSERT OR UPDATE OF status ON public.bruno_welcome_jobs FOR EACH ROW EXECUTE FUNCTION public.wake_bruno_welcome();

CREATE OR REPLACE FUNCTION public.claim_bruno_welcome_job(p_id uuid, p_token uuid) RETURNS SETOF public.bruno_welcome_jobs LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
 UPDATE public.bruno_welcome_jobs SET lease_until=now()+interval '2 minutes'
 WHERE id=p_id AND tick_token=p_token AND status IN ('pending','waiting_template','sent') AND (lease_until IS NULL OR lease_until<now()) RETURNING *;
$$;
REVOKE ALL ON FUNCTION public.kick_bruno_welcome() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.wake_bruno_welcome() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_bruno_welcome_job(uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_bruno_welcome_job(uuid,uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.website_lead_to_crm()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE lid uuid; ph text := right(regexp_replace(coalesce(NEW.phone,''),'\D','','g'),9);
BEGIN
  IF coalesce(NEW.email,'')='' AND length(ph)<6 THEN RETURN NEW; END IF;
  SELECT id INTO lid FROM public.leads
   WHERE (coalesce(NEW.email,'')<>'' AND lower(email)=lower(NEW.email))
      OR (length(ph)>=6 AND right(regexp_replace(coalesce(phone,''),'\D','','g'),9)=ph)
   ORDER BY created_at LIMIT 1;
  IF lid IS NULL THEN
    INSERT INTO public.leads(contact_name, company_name, email, phone, city, source, status, pipeline, notes, website_lead_id, created_at)
    VALUES (nullif(trim(coalesce(NEW.first_name,'')||' '||coalesce(NEW.last_name,'')),''), NEW.company, NEW.email, NEW.phone, NEW.city,
      coalesce(nullif(NEW.metadata->>'utm_source',''), NEW.form_type), 'nuovo', 'Vesuviano', NEW.notes, NEW.id, NEW.created_at)
    RETURNING id INTO lid;
    -- New generic leads only (ready-to-ship requests have their own flow); the job checks the on/off switch itself.
    IF coalesce(NEW.form_type,'') <> 'ready_to_ship' AND length(ph) >= 6 THEN
      BEGIN
        INSERT INTO public.bruno_welcome_jobs(lead_id, website_lead_id, form_type, language)
        VALUES (lid, NEW.id, NEW.form_type, nullif(coalesce(NEW.metadata->>'language', NEW.metadata->>'lang'),''))
        ON CONFLICT (lead_id) DO NOTHING;
      EXCEPTION WHEN others THEN NULL;
      END;
    END IF;
  ELSE
    UPDATE public.leads SET created_at=least(created_at,NEW.created_at) WHERE id=lid;
  END IF;
  RETURN NEW;
EXCEPTION WHEN others THEN RETURN NEW;
END $function$;