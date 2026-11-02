CREATE TABLE public.outreach_chat_threads (
 id uuid PRIMARY KEY,
 user_id uuid NOT NULL,
 title text NOT NULL DEFAULT 'Nuova conversazione',
 messages jsonb NOT NULL DEFAULT '[]'::jsonb,
 status text NOT NULL DEFAULT 'idle',
 archived_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.outreach_chat_threads TO authenticated;
GRANT UPDATE (archived_at) ON public.outreach_chat_threads TO authenticated;
GRANT ALL ON public.outreach_chat_threads TO service_role;
ALTER TABLE public.outreach_chat_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mario own staff chats read" ON public.outreach_chat_threads FOR SELECT TO authenticated USING (user_id=auth.uid() AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale')));
CREATE POLICY "Mario own staff chats import" ON public.outreach_chat_threads FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND status='idle' AND archived_at IS NULL AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale')));
CREATE POLICY "Mario own staff chats archive" ON public.outreach_chat_threads FOR UPDATE TO authenticated USING (user_id=auth.uid() AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'))) WITH CHECK (user_id=auth.uid() AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale')));
CREATE INDEX outreach_chat_threads_owner_recent ON public.outreach_chat_threads(user_id,updated_at DESC) WHERE archived_at IS NULL;
CREATE FUNCTION public.validate_mario_chat_thread() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.status NOT IN ('idle','running','completed','interrupted','failed') THEN RAISE EXCEPTION 'Invalid chat status'; END IF;
 IF length(NEW.title)<1 OR length(NEW.title)>120 OR jsonb_typeof(NEW.messages)<>'array' OR jsonb_array_length(NEW.messages)>2000 OR octet_length(NEW.messages::text)>2000000 THEN RAISE EXCEPTION 'Invalid chat contents'; END IF;
 IF EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.messages) m WHERE jsonb_typeof(m)<>'object' OR coalesce(m->>'role','') NOT IN ('user','assistant') OR jsonb_typeof(m->'content') IS DISTINCT FROM 'string' OR length(m->>'content')>100000) THEN RAISE EXCEPTION 'Invalid chat message'; END IF;
 IF TG_OP='UPDATE' AND (NEW.id IS DISTINCT FROM OLD.id OR NEW.user_id IS DISTINCT FROM OLD.user_id) THEN RAISE EXCEPTION 'Chat identity is immutable'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.validate_mario_chat_thread() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER validate_mario_chat_thread BEFORE INSERT OR UPDATE ON public.outreach_chat_threads FOR EACH ROW EXECUTE FUNCTION public.validate_mario_chat_thread();
CREATE TRIGGER update_mario_chat_thread BEFORE UPDATE ON public.outreach_chat_threads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.outreach_chat_threads(id,user_id,title,messages,status,created_at,updated_at)
SELECT DISTINCT ON (thread_id) thread_id,created_by,left(split_part(request,E'\nContesto precedente',1),60),jsonb_build_array(jsonb_build_object('role','user','content',split_part(request,E'\nContesto precedente',1)),jsonb_build_object('role','assistant','content','Richiesta recuperata dal piano salvato. Il testo originale della risposta non era conservato; il piano e il suo stato sono disponibili qui sotto.')),'idle',created_at,created_at
FROM public.outreach_research_plans WHERE created_by IS NOT NULL ORDER BY thread_id,created_at ASC
ON CONFLICT(id) DO NOTHING;