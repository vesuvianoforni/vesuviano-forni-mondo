-- Add tracking fields to configurator_sessions
ALTER TABLE configurator_sessions 
ADD COLUMN IF NOT EXISTS last_opened_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS customer_actions jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN configurator_sessions.last_opened_at IS 'Timestamp when the customer last opened the configurator link';
COMMENT ON COLUMN configurator_sessions.customer_actions IS 'Array of actions performed by the customer in the configurator (selections, navigation, etc.)';