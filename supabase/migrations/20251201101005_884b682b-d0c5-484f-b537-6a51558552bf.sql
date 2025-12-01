-- Aggiungi campo diameter alla tabella configurator_options per gestire prezzi per diametro specifico
ALTER TABLE configurator_options 
ADD COLUMN diameter INTEGER;

-- Aggiungi commento per documentare l'uso del campo
COMMENT ON COLUMN configurator_options.diameter IS 'Diametro specifico per cui si applica questa opzione (null = si applica a tutti i diametri)';

-- Inserisci le opzioni di spedizione specifiche per ogni diametro
INSERT INTO configurator_options (name, type, price, diameter, is_active) VALUES
('Spedizione in Europa 80cm', 'shipping', 1000, 80, true),
('Spedizione in Europa 100cm', 'shipping', 1300, 100, true),
('Spedizione in Europa 120cm', 'shipping', 1400, 120, true),
('Spedizione in Europa 130cm', 'shipping', 1500, 130, true);

-- Aggiorna l'opzione generica esistente per renderla inattiva (non più usata)
UPDATE configurator_options 
SET is_active = false, description = 'Obsoleta - usare le opzioni specifiche per diametro'
WHERE type = 'shipping' AND diameter IS NULL;