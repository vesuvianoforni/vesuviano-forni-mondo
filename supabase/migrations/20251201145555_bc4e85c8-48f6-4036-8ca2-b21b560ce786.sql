-- Add link_sent column to configurator_sessions table to track if link was sent to customer
ALTER TABLE configurator_sessions 
ADD COLUMN link_sent BOOLEAN NOT NULL DEFAULT false;