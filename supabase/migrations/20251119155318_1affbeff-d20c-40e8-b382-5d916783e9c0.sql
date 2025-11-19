-- Aggiungi campo sizes per gestire multipli dimensionamenti per modello
ALTER TABLE configurator_ovens 
ADD COLUMN IF NOT EXISTS sizes jsonb DEFAULT '[]'::jsonb;

-- Commento per documentare la struttura sizes
COMMENT ON COLUMN configurator_ovens.sizes IS 'Array di dimensionamenti: [{"diameter": 100, "pizza_capacity": "4-6 pizze", "prices": {"listA": {"base": 5000, "gas": 300, "electric": 500, "installation": 1000}, "listB": {...}, "listC": {...}}}]';

-- I campi vecchi rimangono per retrocompatibilità ma possono essere deprecati
COMMENT ON COLUMN configurator_ovens.diameter IS 'DEPRECATED: Usa sizes invece';
COMMENT ON COLUMN configurator_ovens.pizza_capacity IS 'DEPRECATED: Usa sizes invece';
COMMENT ON COLUMN configurator_ovens.base_price_a IS 'DEPRECATED: Usa sizes invece';
COMMENT ON COLUMN configurator_ovens.base_price_b IS 'DEPRECATED: Usa sizes invece';
COMMENT ON COLUMN configurator_ovens.base_price_c IS 'DEPRECATED: Usa sizes invece';