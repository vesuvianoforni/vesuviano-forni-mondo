CREATE TABLE public.telegram_links (
  user_id uuid PRIMARY KEY,
  chat_id bigint UNIQUE,
  telegram_username text,
  link_code text UNIQUE,
  code_expires_at timestamptz,
  linked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, DELETE ON public.telegram_links TO authenticated;
GRANT ALL ON public.telegram_links TO service_role;
ALTER TABLE public.telegram_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own telegram link read" ON public.telegram_links FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own telegram link delete" ON public.telegram_links FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.telegram_updates (
  update_id bigint PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.telegram_updates TO service_role;
ALTER TABLE public.telegram_updates ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.telegram_bruno_messages (
  id bigserial PRIMARY KEY,
  chat_id bigint NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX telegram_bruno_messages_chat_idx ON public.telegram_bruno_messages (chat_id, id DESC);
GRANT ALL ON public.telegram_bruno_messages TO service_role;
GRANT USAGE ON SEQUENCE public.telegram_bruno_messages_id_seq TO service_role;
ALTER TABLE public.telegram_bruno_messages ENABLE ROW LEVEL SECURITY;