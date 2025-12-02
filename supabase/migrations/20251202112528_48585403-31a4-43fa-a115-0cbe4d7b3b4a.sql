-- Enable realtime for configurator_sessions table
ALTER TABLE configurator_sessions REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE configurator_sessions;