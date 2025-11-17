-- Create table for configurator sessions with unique tokens
CREATE TABLE public.configurator_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_used BOOLEAN NOT NULL DEFAULT false,
  quote_id UUID REFERENCES public.configurator_quotes(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_info JSONB
);

-- Enable RLS
ALTER TABLE public.configurator_sessions ENABLE ROW LEVEL SECURITY;

-- Admins can manage all sessions
CREATE POLICY "Admins can manage all sessions"
ON public.configurator_sessions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone with a valid token can view their session
CREATE POLICY "Anyone can view their session by token"
ON public.configurator_sessions
FOR SELECT
USING (true);

-- Anyone with a valid token can update their session
CREATE POLICY "Anyone can update their session"
ON public.configurator_sessions
FOR UPDATE
USING (true);

-- Create index for faster token lookups
CREATE INDEX idx_configurator_sessions_token ON public.configurator_sessions(token);
CREATE INDEX idx_configurator_sessions_status ON public.configurator_sessions(status);