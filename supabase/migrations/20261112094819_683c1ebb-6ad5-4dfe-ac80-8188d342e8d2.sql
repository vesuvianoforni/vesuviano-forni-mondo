CREATE OR REPLACE FUNCTION public.bruno_offer_followup() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE d date := (now() AT TIME ZONE 'Europe/Rome')::date; left_days int := 2;
BEGIN
  IF NEW.lead_id IS NULL OR NEW.status <> 'offerta_inviata' OR (TG_OP='UPDATE' AND OLD.status IS NOT DISTINCT FROM NEW.status) THEN RETURN NEW; END IF;
  -- Best practice: follow up 2 working days after the offer, at 10:00 Rome time.
  WHILE left_days > 0 LOOP d := d + 1; IF extract(isodow FROM d) <= 5 THEN left_days := left_days - 1; END IF; END LOOP;
  UPDATE public.leads SET next_activity_type='chiamata',
    next_activity_date=(d + time '10:00') AT TIME ZONE 'Europe/Rome',
    next_activity_notes='Bruno: follow-up offerta ' || coalesce(NEW.number,'') || ' — verificare ricezione, dubbi e tempi di decisione'
  WHERE id=NEW.lead_id AND coalesce(archived,false)=false AND status NOT IN ('vinto','perso')
    AND (next_activity_date IS NULL OR next_activity_date < now() OR coalesce(next_activity_notes,'') LIKE 'Bruno: %');
  RETURN NEW;
EXCEPTION WHEN others THEN RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.bruno_offer_followup() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER commercial_offers_bruno_followup AFTER INSERT OR UPDATE OF status ON public.commercial_offers FOR EACH ROW EXECUTE FUNCTION public.bruno_offer_followup();