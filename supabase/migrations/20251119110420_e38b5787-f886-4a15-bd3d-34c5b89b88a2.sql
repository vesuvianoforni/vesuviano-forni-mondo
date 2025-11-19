-- Aggiungi policy per permettere modifiche anonime su configurator_ovens
-- (solo per uso interno, da proteggere in produzione)

-- Policy per permettere a chiunque di aggiornare i forni
CREATE POLICY "Allow anonymous updates on ovens"
ON configurator_ovens
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy per permettere a chiunque di inserire forni
CREATE POLICY "Allow anonymous inserts on ovens"
ON configurator_ovens
FOR INSERT
WITH CHECK (true);

-- Policy per permettere a chiunque di eliminare forni
CREATE POLICY "Allow anonymous deletes on ovens"
ON configurator_ovens
FOR DELETE
USING (true);