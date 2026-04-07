CREATE TABLE public.ai_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  content text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage knowledge base" ON public.ai_knowledge_base
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Commerciale can manage knowledge base" ON public.ai_knowledge_base
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'commerciale'::app_role))
  WITH CHECK (has_role(auth.uid(), 'commerciale'::app_role));

CREATE POLICY "Anyone can read active knowledge base" ON public.ai_knowledge_base
  FOR SELECT TO public
  USING (is_active = true);

CREATE TRIGGER update_ai_knowledge_base_updated_at
  BEFORE UPDATE ON public.ai_knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed with default knowledge
INSERT INTO public.ai_knowledge_base (category, title, content, sort_order) VALUES
('azienda', 'Chi siamo', 'Vesuviano è un produttore artigianale napoletano di forni professionali per pizza. Siamo basati a Napoli, Italia. I nostri forni sono esportati in tutto il mondo.', 0),
('prodotti', 'Forni Tradizionali', 'Produciamo forni tradizionali a legna in vari diametri, costruiti artigianalmente con materiali di alta qualità.', 1),
('prodotti', 'Forni a Gas', 'Offriamo forni a gas professionali per pizzerie che necessitano di praticità senza rinunciare alla qualità.', 2),
('prodotti', 'Forni Elettrici', 'I nostri forni elettrici combinano tecnologia moderna con la tradizione napoletana.', 3),
('prodotti', 'Forni Rotativi', 'Forni rotativi professionali per alta produttività in pizzeria.', 4),
('prodotti', 'Sistema VesuvioBuono', 'Il sistema VesuvioBuono è il nostro forno innovativo a zero emissioni, ideale per contesti urbani e locali con restrizioni ambientali.', 5),
('servizi', 'Built on Place', 'Servizio di installazione personalizzata "Built on Place" per forni costruiti direttamente in loco.', 6),
('servizi', 'Pronta Consegna', 'Forni disponibili in pronta consegna per chi ha bisogno di una soluzione rapida.', 7),
('caratteristiche', 'Spazi stretti', 'Il nostro forno passa in spazi stretti da 45cm di larghezza, dove gli altri forni non passerebbero mai. Anche nelle porte più strette.', 8),
('contatti', 'Informazioni di contatto', 'Telefono: 081 19231684. Email: info@vesuvianoforni.com. WhatsApp disponibile.', 9);