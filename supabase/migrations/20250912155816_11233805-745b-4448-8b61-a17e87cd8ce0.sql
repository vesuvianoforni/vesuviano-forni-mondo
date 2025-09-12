-- Popoliamo il database con alcuni forni di esempio
INSERT INTO public.ovens (name, category, subcategory, description, image_url, specifications) VALUES
('Vesuvio Buono Verde Mosaico', 'mosaico', 'Forno Tradizionale', 'Forno a legna tradizionale con rivestimento in mosaico verde, ideale per pizzerie e ristoranti di alta qualità.', '/lovable-uploads/vesuviobuono-verde-mosaico.jpg', '{"diametro": "120cm", "materiale": "mattoni refrattari", "combustibile": "legna", "temperatura_max": "500°C", "capacita": "6-8 pizze"}'),

('Vesuvio Buono Marrone Completo', 'legna', 'Forno Completo', 'Forno a legna completo con rivestimento marrone, perfetto per uso domestico e commerciale.', '/lovable-uploads/vesuviobuono-marrone-completo.jpg', '{"diametro": "100cm", "materiale": "mattoni refrattari", "combustibile": "legna", "temperatura_max": "480°C", "capacita": "4-6 pizze"}'),

('Vesuvio Buono Osteria Pizza', 'legna', 'Osteria', 'Forno specializzato per pizzerie e osterie, design elegante e prestazioni professionali.', '/lovable-uploads/vesuviobuono-osteria-pizza.jpg', '{"diametro": "140cm", "materiale": "mattoni refrattari", "combustibile": "legna", "temperatura_max": "520°C", "capacita": "8-10 pizze"}'),

('Forno Arancione Terra del Gusto', 'gas', 'Forno a Gas', 'Forno a gas con rivestimento arancione, perfetto per chi cerca praticità e controllo della temperatura.', '/lovable-uploads/forno-arancione-terra-del-gusto.png', '{"diametro": "110cm", "materiale": "acciaio inox", "combustibile": "gas", "temperatura_max": "450°C", "capacita": "5-7 pizze"}'),

('Vesuvio Buono Verde Dettaglio', 'mosaico', 'Dettaglio Premium', 'Forno con dettagli in mosaico verde, lavorazione artigianale di alta qualità.', '/lovable-uploads/vesuviobuono-verde-dettaglio.jpg', '{"diametro": "130cm", "materiale": "mattoni refrattari + mosaico", "combustibile": "legna", "temperatura_max": "500°C", "capacita": "7-9 pizze"}'),

('Forno Metallo Bianco', 'gas', 'Moderno', 'Forno moderno in metallo bianco, design contemporaneo per cucine professionali.', '/lovable-uploads/forno-metallo-bianco.png', '{"diametro": "100cm", "materiale": "acciaio inox", "combustibile": "gas", "temperatura_max": "420°C", "capacita": "4-6 pizze"}'),

('Forno Metallo Nero', 'gas', 'Professional', 'Forno professionale in metallo nero, ideale per ristoranti e pizzerie moderne.', '/lovable-uploads/forno-metallo-nero.png', '{"diametro": "120cm", "materiale": "acciaio al carbonio", "combustibile": "gas", "temperatura_max": "460°C", "capacita": "6-8 pizze"}'),

('Vesuvio Buono Marrone Aperto', 'legna', 'Forno Aperto', 'Forno a legna con design aperto, perfetto per cotture a vista e spettacolarizzazione.', '/lovable-uploads/vesuviobuono-marrone-aperto.jpg', '{"diametro": "150cm", "materiale": "mattoni refrattari", "combustibile": "legna", "temperatura_max": "550°C", "capacita": "10-12 pizze"}');