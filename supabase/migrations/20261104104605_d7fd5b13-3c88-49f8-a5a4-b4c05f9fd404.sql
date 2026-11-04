CREATE TABLE public.bruno_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'generale',
  title text NOT NULL,
  content text NOT NULL,
  stages text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bruno_knowledge TO authenticated;
GRANT ALL ON public.bruno_knowledge TO service_role;
ALTER TABLE public.bruno_knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales manage bruno knowledge" ON public.bruno_knowledge FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE TRIGGER bruno_knowledge_updated BEFORE UPDATE ON public.bruno_knowledge FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.product_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'foto',
  title text NOT NULL,
  url text NOT NULL,
  storage_path text,
  language text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_assets TO authenticated;
GRANT ALL ON public.product_assets TO service_role;
ALTER TABLE public.product_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales manage product assets" ON public.product_assets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE INDEX product_assets_product_idx ON public.product_assets(product_id);

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS qualification jsonb NOT NULL DEFAULT '{}'::jsonb;

INSERT INTO public.bruno_knowledge (category,title,content,stages,sort_order) VALUES
('azienda','Chi siamo','Vesuviano Forni: laboratorio artigianale napoletano di forni per pizza, officine a Sant''Anastasia e Poggiomarino (Napoli). Titolare e manager: Stanislao Elefante ("Stan").','{}',0),
('consegna','Forno assemblato e built-on-site','Il forno arriva già assemblato e pronto all''uso; va solo posizionato. Se l''ingresso è troppo stretto (circa sotto 80-90 cm) si fa il built-on-site: spediamo da Napoli un cassone di materiali (~800 kg) e una squadra costruisce il forno sul posto.','{}',1),
('consegna','Scarico','Per lo scarico serve muletto o gru. Alcuni trasporti veloci non hanno muletto a bordo: dirlo prima al cliente. Nei dubbi chiedere foto o video dell''ingresso.','{}',2),
('tempi','Tempi di produzione e consegna','In offerta: 20 giorni di produzione + 25 di spedizione. Spesso la consegna arriva prima, ma non garantire mai date del corriere.','{}',3),
('pagamento','Condizioni di pagamento','50% acconto all''ordine, 50% saldo a forno pronto prima della spedizione. Nessun finanziamento diretto. Ai nuovi clienti esteri si può suggerire un piccolo bonifico di prova. UK in GBP su conto aziendale Wise (se la banca non accetta Wise, passare a Stan).','{}',4),
('pagamento','IVA e validità offerta','IVA 22% Italia, 0% extra-UE (UK). Validità offerta 30 giorni. La proforma inviata è la base definitiva dell''ordine: le condizioni non cambiano dopo.','{}',5),
('prodotti','Misure e finiture consigliate','80 cm domestico (2-3 pizze); 100 cm piccola attività (2-4); 120 cm la scelta più comune per nuove attività (~6); 130-140 cm per molti coperti. Finiture: verniciato (costa meno), mosaico o piastrelle (se il forno è a vista nel locale il mosaico fa la differenza).','{nuovo,pre_qualificato,qualificato}',6),
('obiezioni','Costa troppo','Riconosci, chiedi se il problema è il budget totale o il confronto con un altro preventivo. Proponi alternative vere: misura più piccola, versione verniciata, modello più leggero. Mai promettere sconti: "ne parlo con Stan e ti faccio sapere".','{qualificato,trattativa}',7),
('obiezioni','Sto valutando altre aziende','Chiedi cosa conta di più (qualità, tempi, prezzo); racconta cosa ci rende diversi: artigianato napoletano, mosaico fatto a mano, forni installati in UK da visitare.','{trattativa}',8),
('obiezioni','Non mi fido a pagare all''estero','Offri documenti aziendali, bonifico di prova, referenze di clienti nella sua zona, visita in officina.','{trattativa}',9),
('obiezioni','Ci devo pensare / non interessato','"Nessun problema, prenditi il tempo che serve." Chiedi solo un''indicazione di tempo. Se non è più interessato: ringrazia e chiudi, nessun follow-up.','{trattativa,perso}',10);