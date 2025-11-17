-- Aggiungi nuovi campi alla tabella configurator_ovens per gestire i prezzi specifici
ALTER TABLE configurator_ovens 
ADD COLUMN IF NOT EXISTS gas_price numeric,
ADD COLUMN IF NOT EXISTS electric_price numeric,
ADD COLUMN IF NOT EXISTS installation_price numeric;

-- Commenta: 
-- base_price rimane il prezzo base (legna)
-- gas_price è il prezzo aggiuntivo per la versione a gas
-- electric_price è il prezzo aggiuntivo per la versione elettrica
-- installation_price è il prezzo per il montaggio sul posto

-- Rimuovi le vecchie opzioni (installazione e conversione gas)
DELETE FROM configurator_options WHERE type IN ('installation', 'gas_conversion');

-- Aggiungi la nuova opzione per la spedizione (i prezzi saranno calcolati dinamicamente nel codice)
INSERT INTO configurator_options (name, type, price, description, is_active)
VALUES 
  ('Spedizione in Europa', 'shipping', 0, 'Spedizione in Europa con imballaggio cassonato in legno. Il costo varia in base alle dimensioni del forno.', true),
  ('Montaggio sul Posto', 'on_site_installation', 0, 'Montaggio e installazione professionale presso la vostra sede. Il costo varia in base al modello e configurazione.', true)
ON CONFLICT DO NOTHING;