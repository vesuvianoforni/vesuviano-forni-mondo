CREATE TABLE public.outreach_autopilot (
  key text PRIMARY KEY DEFAULT 'default',
  enabled boolean NOT NULL DEFAULT false,
  owner_id uuid,
  countries text[] NOT NULL DEFAULT ARRAY['UK','FR','ES','NL','BE','IE','AT','CH','PT','DK','SE','NO','FI','PL','CZ','LU','DE'],
  territory_cursor integer NOT NULL DEFAULT 0,
  daily_organization_goal integer NOT NULL DEFAULT 150,
  last_planned_on date,
  last_tick_at timestamptz,
  lease_until timestamptz,
  last_result jsonb NOT NULL DEFAULT '{}'::jsonb,
  auto_paused_reason text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.outreach_autopilot TO authenticated;
GRANT ALL ON public.outreach_autopilot TO service_role;
ALTER TABLE public.outreach_autopilot ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin legge autopilot" ON public.outreach_autopilot FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE TRIGGER outreach_autopilot_updated BEFORE UPDATE ON public.outreach_autopilot FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.validate_mario_autopilot() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
  IF 'IT' = ANY(NEW.countries) THEN RAISE EXCEPTION 'Italia esclusa dall''autopilota'; END IF;
  IF NEW.daily_organization_goal < 10 OR NEW.daily_organization_goal > 300 THEN RAISE EXCEPTION 'Obiettivo giornaliero tra 10 e 300 organizzazioni'; END IF;
  IF NEW.enabled AND NEW.owner_id IS NULL THEN RAISE EXCEPTION 'Autopilota senza responsabile'; END IF;
  RETURN NEW; END; $$;
CREATE TRIGGER validate_mario_autopilot BEFORE INSERT OR UPDATE ON public.outreach_autopilot FOR EACH ROW EXECUTE FUNCTION public.validate_mario_autopilot();
INSERT INTO public.outreach_autopilot(key) VALUES ('default') ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.acquire_mario_autopilot() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
  UPDATE public.outreach_autopilot SET lease_until=now()+interval '4 minutes', last_tick_at=now() WHERE key='default' AND (lease_until IS NULL OR lease_until<now());
  RETURN FOUND; END; $$;
REVOKE ALL ON FUNCTION public.acquire_mario_autopilot() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_mario_autopilot() TO service_role;

-- Warm-up ramp: the effective cap grows weekly from the provider verification date up to 200.
CREATE OR REPLACE FUNCTION public.mario_effective_daily_limit() RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT LEAST(s.daily_limit, 200, CASE WHEN s.provider_verified_at IS NULL THEN 0
    ELSE (ARRAY[40,80,120,160,200])[LEAST(5, 1 + floor(extract(epoch FROM now()-s.provider_verified_at)/604800)::integer)] END)
  FROM public.outreach_settings s WHERE key='default';
$$;
REVOKE ALL ON FUNCTION public.mario_effective_daily_limit() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.mario_effective_daily_limit() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.validate_mario_delivery() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 IF NEW.daily_limit<1 OR NEW.daily_limit>200 THEN RAISE EXCEPTION 'Limite: da 1 a 200 email complessive al giorno'; END IF;
 IF NEW.min_interval_seconds<180 OR NEW.min_interval_seconds>86400 THEN RAISE EXCEPTION 'Intervallo minimo: 180 secondi'; END IF;
 IF NEW.window_start<0 OR NEW.window_end>24 OR NEW.window_start>=NEW.window_end THEN RAISE EXCEPTION 'Finestra oraria non valida'; END IF;
 IF NEW.timezone NOT LIKE 'Europe/%' THEN RAISE EXCEPTION 'Fuso orario non consentito'; END IF;
 IF 'IT'=ANY(NEW.send_markets) OR 'DE'=ANY(NEW.send_markets) OR 'IT'=ANY(NEW.markets) THEN RAISE EXCEPTION 'Italia esclusa; Germania solo contatto manuale'; END IF;
 IF NOT NEW.paused AND (NEW.provider_verified_at IS NULL OR COALESCE(NEW.provider_approval_reference,'')='' OR COALESCE(NEW.preflight->>'ready','false')<>'true') THEN RAISE EXCEPTION 'Prerequisiti invio non verificati'; END IF;
 RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.reserve_mario_submission(p_id uuid,p_token uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s public.outreach_settings; p public.outreach_prospects; m public.outreach_messages; o public.outreach_outbox; local_now timestamp; used integer; cap integer; sent7 integer; bounced7 integer;
BEGIN
 SELECT * INTO s FROM public.outreach_settings WHERE key='default' FOR UPDATE;
 IF s.paused OR s.lease_token IS DISTINCT FROM p_token OR s.lease_until<now() OR s.provider_verified_at IS NULL OR COALESCE(s.preflight->>'ready','false')<>'true' THEN RETURN false; END IF;
 local_now:=now() AT TIME ZONE s.timezone;
 IF NOT extract(isodow FROM local_now)::integer=ANY(s.weekdays) OR extract(hour FROM local_now)<s.window_start OR extract(hour FROM local_now)>=s.window_end OR s.next_delivery_at>now() THEN RETURN false; END IF;
 -- Reputation guard: more than 2% bounces over the last 7 days (min 50 sends) pauses everything.
 SELECT count(*) INTO sent7 FROM public.outreach_outbox WHERE accepted_at>now()-interval '7 days';
 SELECT count(*) INTO bounced7 FROM public.outreach_prospects WHERE status='bounced' AND replied_at>now()-interval '7 days';
 IF sent7>=50 AND bounced7*50>sent7 THEN
   UPDATE public.outreach_settings SET paused=true,pause_reason='Pausa automatica: rimbalzi oltre il 2% negli ultimi 7 giorni.' WHERE key='default';
   RETURN false;
 END IF;
 cap:=public.mario_effective_daily_limit();
 SELECT count(*) INTO used FROM public.outreach_outbox WHERE (attempted_at AT TIME ZONE s.timezone)::date=local_now::date;
 IF used>=cap OR used>=200 THEN RETURN false; END IF;
 SELECT * INTO o FROM public.outreach_outbox WHERE id=p_id FOR UPDATE;
 IF o.id IS NULL OR o.smtp_status<>'pending' OR o.attempted_at IS NOT NULL THEN RETURN false; END IF;
 SELECT * INTO p FROM public.outreach_prospects WHERE id=o.prospect_id FOR UPDATE;
 SELECT * INTO m FROM public.outreach_messages WHERE id=o.outreach_message_id FOR UPDATE;
 IF p.replied_at IS NOT NULL OR p.status IN ('replied','unsubscribed','bounced','manual','done','suppressed') OR p.country IN ('DE','IT') OR NOT p.country=ANY(s.send_markets) OR NOT p.qualified OR p.recipient_eligibility<>'eligible' OR p.email IS DISTINCT FROM o.recipient OR m.status<>'approved' OR m.approved_at IS NULL OR m.scheduled_at IS NULL OR m.scheduled_at>now() THEN RETURN false; END IF;
 IF EXISTS(SELECT 1 FROM public.outreach_suppressions WHERE lower(value) IN (lower(p.email),lower(p.domain))) THEN RETURN false; END IF;
 IF m.step>0 AND NOT EXISTS(SELECT 1 FROM public.outreach_messages WHERE prospect_id=p.id AND step=m.step-1 AND status='sent') THEN RETURN false; END IF;
 IF EXISTS(SELECT 1 FROM public.outreach_outbox WHERE prospect_id=p.id AND smtp_status IN ('sending','unknown','rejected')) THEN RETURN false; END IF;
 UPDATE public.outreach_outbox SET smtp_status='sending',attempted_at=now() WHERE id=p_id;
 -- Natural spacing: base interval plus up to 60s random jitter.
 UPDATE public.outreach_settings SET next_delivery_at=now()+make_interval(secs=>s.min_interval_seconds+floor(random()*60)::integer) WHERE key='default';
 RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.reserve_mario_submission(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_mario_submission(uuid,uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.mario_due_outbox() RETURNS SETOF public.outreach_outbox LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
 SELECT o.* FROM public.outreach_outbox o JOIN public.outreach_messages m ON m.id=o.outreach_message_id JOIN public.outreach_prospects p ON p.id=o.prospect_id JOIN public.outreach_settings s ON s.key='default'
 WHERE o.smtp_status='pending' AND o.attempted_at IS NULL AND m.status='approved' AND m.scheduled_at<=now() AND p.replied_at IS NULL AND p.status NOT IN ('replied','unsubscribed','bounced','suppressed','manual','done') AND p.qualified AND p.recipient_eligibility='eligible' AND p.email=o.recipient AND p.country=ANY(s.send_markets) AND p.country NOT IN ('DE','IT') AND NOT EXISTS(SELECT 1 FROM public.outreach_suppressions WHERE lower(value) IN (lower(p.email),lower(p.domain))) AND NOT EXISTS(SELECT 1 FROM public.outreach_outbox bad WHERE bad.prospect_id=p.id AND bad.smtp_status IN ('sending','unknown','rejected')) AND (m.step=0 OR EXISTS(SELECT 1 FROM public.outreach_messages prev WHERE prev.prospect_id=p.id AND prev.step=m.step-1 AND prev.status='sent'))
 ORDER BY m.step DESC, m.scheduled_at,o.created_at LIMIT 20;
$$;
REVOKE ALL ON FUNCTION public.mario_due_outbox() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.mario_due_outbox() TO service_role;

UPDATE public.outreach_settings SET daily_limit=200, min_interval_seconds=180,
  markets=ARRAY['UK','FR','ES','NL','BE','IE','AT','CH','PT','DK','SE','NO','FI','PL','CZ','LU','DE'],
  send_markets=ARRAY['UK','FR','ES','NL','BE','IE','AT','CH','PT','DK','SE','NO','FI','PL','CZ','LU'] WHERE key='default';