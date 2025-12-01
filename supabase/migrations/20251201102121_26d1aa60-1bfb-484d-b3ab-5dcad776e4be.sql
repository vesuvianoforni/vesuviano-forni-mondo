-- Add shipping options for 140cm and 150cm diameters
INSERT INTO public.configurator_options (name, type, price, diameter, is_active, description)
VALUES 
  ('Spedizione in Europa', 'shipping', 3000, 140, true, 'Costo di spedizione per forno diametro 140cm'),
  ('Spedizione in Europa', 'shipping', 3500, 150, true, 'Costo di spedizione per forno diametro 150cm');