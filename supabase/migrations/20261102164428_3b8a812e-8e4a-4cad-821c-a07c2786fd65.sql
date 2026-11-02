WITH v(name, cost) AS (VALUES
('Real Bosco 80 · Verniciato · Legna',2900),('Real Bosco 100 · Verniciato · Legna',3400),('Real Bosco 120 · Verniciato · Legna',4700),('Real Bosco 130 · Verniciato · Legna',5700),
('Real Bosco 80 · Mosaicato · Legna',3600),('Real Bosco 100 · Mosaicato · Legna',4200),('Real Bosco 120 · Mosaicato · Legna',5700),('Real Bosco 130 · Mosaicato · Legna',7200),
('Real Bosco 80 · Piastrellato · Legna',3600),('Real Bosco 100 · Piastrellato · Legna',4100),('Real Bosco 120 · Piastrellato · Legna',5500),('Real Bosco 130 · Piastrellato · Legna',6900),
('Real Bosco 80 · Verniciato · Gas',2900+1650),('Real Bosco 100 · Verniciato · Gas',3400+2100),('Real Bosco 120 · Verniciato · Gas',4700+2100),('Real Bosco 130 · Verniciato · Gas',5700+2100),
('Real Bosco 80 · Mosaicato · Gas',3600+1650),('Real Bosco 100 · Mosaicato · Gas',4200+2100),('Real Bosco 120 · Mosaicato · Gas',5700+2100),('Real Bosco 130 · Mosaicato · Gas',7200+2100),
('Real Bosco 80 · Piastrellato · Gas',3600+1650),('Real Bosco 100 · Piastrellato · Gas',4100+2100),('Real Bosco 120 · Piastrellato · Gas',5500+2100),('Real Bosco 130 · Piastrellato · Gas',6900+2100),
('RealBosco Rotante 130 · Mosaico Classico · Legna',16000),('RealBosco Rotante 130 · Mosaico Classico · Gas',16000),('RealBosco Rotante 130 · Mosaico Classico · Costruito sul posto',16000),
('P1 Plus Atmospheric',1650),('P2 Atmospheric',2100),('D2/M Atmospheric',4400),('DRAGO SIX Atmospheric',4850))
INSERT INTO public.product_costs (product_id, cost, currency)
SELECT p.id, v.cost * 0.5, 'EUR' FROM v JOIN public.products p ON p.name = v.name AND p.is_active
ON CONFLICT (product_id) DO UPDATE SET cost = EXCLUDED.cost, currency = 'EUR', updated_at = now();