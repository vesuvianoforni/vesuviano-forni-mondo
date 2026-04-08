CREATE POLICY "Anyone can select own chat conversation by visitor_id"
ON public.chat_conversations
FOR SELECT
TO anon
USING (true);