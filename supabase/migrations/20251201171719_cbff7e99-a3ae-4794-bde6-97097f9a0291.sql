CREATE TABLE public.email_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  email_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_to TEXT NOT NULL,
  sent_from TEXT NOT NULL DEFAULT 'info@vesuvianoforni.com',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB,
  CONSTRAINT fk_email_history_session 
    FOREIGN KEY (session_id) 
    REFERENCES public.configurator_sessions(id) 
    ON DELETE CASCADE
);

CREATE INDEX idx_email_history_session_id ON public.email_history(session_id);
CREATE INDEX idx_email_history_sent_at ON public.email_history(sent_at DESC);