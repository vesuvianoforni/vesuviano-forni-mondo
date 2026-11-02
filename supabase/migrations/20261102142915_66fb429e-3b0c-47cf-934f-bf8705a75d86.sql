CREATE OR REPLACE FUNCTION public.website_lead_to_crm()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
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
      coalesce(nullif(NEW.metadata->>'utm_source',''), NEW.form_type), 'nuovo', 'Vesuviano', NEW.notes, NEW.id, NEW.created_at);
  ELSE
    UPDATE public.leads SET created_at=least(created_at,NEW.created_at) WHERE id=lid;
  END IF;
  RETURN NEW;
EXCEPTION WHEN others THEN RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.website_lead_to_crm() FROM PUBLIC, anon, authenticated;