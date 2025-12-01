-- Add erp_webhook_url column to configurator_sessions to store the ERP webhook URL for each lead
ALTER TABLE configurator_sessions 
ADD COLUMN erp_webhook_url TEXT;