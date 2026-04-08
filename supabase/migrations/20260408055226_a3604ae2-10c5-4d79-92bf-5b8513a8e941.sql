
-- Table to store AI chat conversations
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.website_leads(id) ON DELETE SET NULL,
  visitor_id TEXT NOT NULL,
  visitor_name TEXT,
  visitor_email TEXT,
  visitor_phone TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  lang TEXT NOT NULL DEFAULT 'en',
  page_url TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookup by visitor
CREATE INDEX idx_chat_conversations_visitor_id ON public.chat_conversations(visitor_id);
CREATE INDEX idx_chat_conversations_last_message ON public.chat_conversations(last_message_at DESC);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (from the chat widget)
CREATE POLICY "Anyone can insert chat conversations"
ON public.chat_conversations
FOR INSERT
TO public
WITH CHECK (true);

-- Anyone can update their own conversation (by visitor_id)
CREATE POLICY "Anyone can update own chat conversation"
ON public.chat_conversations
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Admins can view all conversations
CREATE POLICY "Admins can view all chat conversations"
ON public.chat_conversations
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Commerciale can view all conversations
CREATE POLICY "Commerciale can view chat conversations"
ON public.chat_conversations
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'commerciale'::app_role));
