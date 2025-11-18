-- Add policy to allow authenticated users to insert configurator sessions
-- This is needed for admin users to generate links
CREATE POLICY "Authenticated users can create sessions" 
ON configurator_sessions 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Also allow anonymous inserts for development (remove this in production)
CREATE POLICY "Allow inserts during development" 
ON configurator_sessions 
FOR INSERT 
TO anon
WITH CHECK (true);