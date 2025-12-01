ALTER TABLE configurator_sessions 
ADD COLUMN sent_via_email boolean DEFAULT false,
ADD COLUMN sent_via_whatsapp boolean DEFAULT false;