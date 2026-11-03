CREATE OR REPLACE FUNCTION public.validate_mario_delivery() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 IF NEW.daily_limit<1 OR NEW.daily_limit>200 THEN RAISE EXCEPTION 'Limite: da 1 a 200 email complessive al giorno'; END IF;
 IF NEW.min_interval_seconds<180 OR NEW.min_interval_seconds>86400 THEN RAISE EXCEPTION 'Intervallo minimo: 180 secondi'; END IF;
 IF NEW.window_start<0 OR NEW.window_end>24 OR NEW.window_start>=NEW.window_end THEN RAISE EXCEPTION 'Finestra oraria non valida'; END IF;
 IF NEW.timezone NOT LIKE 'Europe/%' THEN RAISE EXCEPTION 'Fuso orario non consentito'; END IF;
 IF 'IT'=ANY(NEW.send_markets) OR 'DE'=ANY(NEW.send_markets) OR 'IT'=ANY(NEW.markets) THEN RAISE EXCEPTION 'Italia esclusa; Germania solo contatto manuale'; END IF;
 IF NOT NEW.paused AND (NEW.provider_verified_at IS NULL OR COALESCE(NEW.preflight->>'ready','false')<>'true') THEN RAISE EXCEPTION 'Prerequisiti invio non verificati'; END IF;
 RETURN NEW; END; $$;