ALTER TABLE public.outreach_prospects ADD COLUMN evidence jsonb NOT NULL DEFAULT '{}'::jsonb, ADD COLUMN qualified boolean NOT NULL DEFAULT false, ADD COLUMN qualification_reason text;
ALTER TABLE public.outreach_messages ADD COLUMN html text, ADD COLUMN sources jsonb NOT NULL DEFAULT '[]'::jsonb, ADD COLUMN approved_at timestamptz, ADD COLUMN approved_by uuid, ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
CREATE TRIGGER outreach_messages_updated BEFORE UPDATE ON public.outreach_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.outreach_runs ADD COLUMN input jsonb NOT NULL DEFAULT '{}'::jsonb, ADD COLUMN result jsonb NOT NULL DEFAULT '{}'::jsonb, ADD COLUMN actor_run_id text, ADD COLUMN dataset_id text, ADD COLUMN created_by uuid;
CREATE TABLE public.outreach_agent_config (key text PRIMARY KEY DEFAULT 'default', instructions text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.outreach_agent_config TO authenticated; GRANT ALL ON public.outreach_agent_config TO service_role;
ALTER TABLE public.outreach_agent_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read Mario config" ON public.outreach_agent_config FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE TRIGGER outreach_agent_config_updated BEFORE UPDATE ON public.outreach_agent_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.outreach_agent_config(key,instructions) VALUES ('default','Dai priorità alle pizzerie indipendenti e ai distributori Horeca in UK e Francia. Ricerca in piccoli lotti, verifica il sito ufficiale e motiva la pertinenza. Prepara email nella lingua del destinatario; non inviare. Per i partner chiedi se sono interessati a valutare una collaborazione commerciale, senza promettere esclusiva o margini. Per le pizzerie chiedi se vogliono ricevere informazioni sui forni.');
CREATE TABLE public.outreach_knowledge (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, content text NOT NULL, source_url text, active boolean NOT NULL DEFAULT true, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.outreach_knowledge TO authenticated; GRANT ALL ON public.outreach_knowledge TO service_role;
ALTER TABLE public.outreach_knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read Mario knowledge" ON public.outreach_knowledge FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE TRIGGER outreach_knowledge_updated BEFORE UPDATE ON public.outreach_knowledge FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.outreach_knowledge(title,content,source_url) VALUES
('Vesuviano: identità e prodotti','Vesuviano realizza forni per pizza artigianali napoletani nei laboratori di Sant’Anastasia e Boscoreale, con sabbia vulcanica. Modelli: Anastasia, Ottavio, Real Bosco, Sebastian, VesuvioBuono, Forno Rotante. Alimentazioni: legna, gas, elettrico; disponibilità e compatibilità vanno verificate nel catalogo. Usare Products/Prodotti, mai Solutions/Soluzioni.','https://vesuvianoforni.com'),
('Offerta per pizzerie e partner','Pizzerie: valutazione di un forno in base a spazio, produzione, alimentazione e tempi effettivi. Partner: confronto commerciale con aziende che vendono o installano attrezzature professionali Horeca. Non promettere esclusiva territoriale, provvigioni, margini, certificazioni o consegne non confermati. I bruciatori sono prodotti separati dal modello del forno.','https://vesuvianoforni.com/en'),
('Contatti e firma','Firma Gennaro Caglione, Sales & Export Manager, Vesuviano Forni. Sito https://vesuvianoforni.com; telefono +39 081 19231684; WhatsApp https://wa.me/393509286941. Mittente outreach dedicato: ciao@vesuviano-forni.com. Non inventare indirizzi postali.','https://vesuvianoforni.com'),
('Sequenze e qualità','Avvio giorno 0; follow-on giorno 3; follow-up finale giorno 7 rispetto all’avvio. Tre messaggi distinti, brevi e utili, una domanda pertinente ciascuno. Stop con risposta, disiscrizione, rimbalzo o invio incerto. Niente falso Re:/Fwd:, familiarità inventata, urgenza fittizia o prezzi. Nessun consenso dedotto da un indirizzo pubblico. Germania: raccolta per revisione manuale, mai invio automatico.',NULL);
REVOKE INSERT, UPDATE ON public.outreach_settings FROM authenticated;
REVOKE UPDATE ON public.outreach_prospects FROM authenticated;
UPDATE public.outreach_settings SET paused=true, sender_email='ciao@vesuviano-forni.com', pause_reason='Motori ricerca e bozze disponibili; invio automatico non attivato: integrazione durabile e verifica condizioni IONOS richieste.' WHERE key='default';
CREATE OR REPLACE FUNCTION public.claim_mario_run(p_kind text,p_input jsonb,p_user uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_id uuid;
BEGIN
 IF p_kind NOT IN ('firecrawl_search','enrich','draft','apify_search') THEN RAISE EXCEPTION 'invalid operation'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('mario-'||p_kind));
 UPDATE public.outreach_runs SET status='failed',error='operation_expired',finished_at=now() WHERE kind=p_kind AND status='running' AND lease_until<now();
 IF EXISTS(SELECT 1 FROM public.outreach_runs WHERE kind=p_kind AND status='running' AND lease_until>=now()) THEN RAISE EXCEPTION 'operation_running'; END IF;
 INSERT INTO public.outreach_runs(kind,input,created_by,lease_until) VALUES(p_kind,p_input,p_user,now()+interval '15 minutes') RETURNING id INTO v_id;
 RETURN v_id;
END; $$;
REVOKE ALL ON FUNCTION public.claim_mario_run(text,jsonb,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_mario_run(text,jsonb,uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.mario_prospect_summary() RETURNS TABLE(kind text,country text,status text,total bigint) LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT p.kind,p.country,p.status,count(*) FROM public.outreach_prospects p GROUP BY p.kind,p.country,p.status; $$;
REVOKE ALL ON FUNCTION public.mario_prospect_summary() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.mario_prospect_summary() TO authenticated,service_role;