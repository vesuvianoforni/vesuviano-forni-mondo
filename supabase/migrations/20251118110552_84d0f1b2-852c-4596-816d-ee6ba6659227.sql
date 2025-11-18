-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can create sessions" ON configurator_sessions;

-- Create policy that only allows admins to create sessions
CREATE POLICY "Admins can create sessions" 
ON configurator_sessions 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- The anonymous policy is already there for development
-- In production, you should remove it and enable authentication for admins