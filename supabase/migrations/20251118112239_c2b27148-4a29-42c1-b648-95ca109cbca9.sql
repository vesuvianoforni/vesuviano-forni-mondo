-- Aggiungi colonne per il feedback del cliente nella tabella configurator_sessions
ALTER TABLE configurator_sessions
ADD COLUMN IF NOT EXISTS feedback_status text CHECK (feedback_status IN ('interested', 'not_interested')),
ADD COLUMN IF NOT EXISTS feedback_reason text,
ADD COLUMN IF NOT EXISTS feedback_date timestamp with time zone;