CREATE TABLE public.email_mailboxes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), address text NOT NULL UNIQUE, enabled boolean NOT NULL DEFAULT false,
 sent_folder text, last_sync_at timestamptz, last_error text, lease_token uuid, lease_until timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.email_mailboxes TO authenticated;
GRANT ALL ON public.email_mailboxes TO service_role;
ALTER TABLE public.email_mailboxes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales read mailbox state" ON public.email_mailboxes FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE TRIGGER email_mailboxes_updated BEFORE UPDATE ON public.email_mailboxes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.email_mailboxes(address) VALUES ('info@vesuvianoforni.com') ON CONFLICT(address) DO NOTHING;

CREATE TABLE public.email_outbox (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), mailbox_id uuid NOT NULL REFERENCES public.email_mailboxes(id),
 idempotency_key uuid NOT NULL, message_id text NOT NULL, lead_id uuid NOT NULL REFERENCES public.leads(id),
 created_by uuid, recipient text NOT NULL, subject text NOT NULL, body text NOT NULL, mime text NOT NULL,
 smtp_status text NOT NULL DEFAULT 'pending', copy_status text NOT NULL DEFAULT 'pending',
 smtp_accepted_at timestamptz, append_attempted_at timestamptz, copy_next_attempt_at timestamptz,
 crm_message_id uuid REFERENCES public.crm_messages(id), last_error text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(mailbox_id,idempotency_key), UNIQUE(mailbox_id,message_id)
);
GRANT ALL ON public.email_outbox TO service_role;
ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER email_outbox_updated BEFORE UPDATE ON public.email_outbox FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.email_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), mailbox_id uuid NOT NULL REFERENCES public.email_mailboxes(id),
 message_key text NOT NULL, message_id text, in_reply_to text, reference_ids jsonb NOT NULL DEFAULT '[]',
 sender text NOT NULL, recipients jsonb NOT NULL DEFAULT '[]', subject text NOT NULL DEFAULT '', body text NOT NULL DEFAULT '',
 direction text NOT NULL, sent_at timestamptz NOT NULL, lead_id uuid REFERENCES public.leads(id), crm_message_id uuid REFERENCES public.crm_messages(id),
 attachment_names jsonb NOT NULL DEFAULT '[]',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(mailbox_id,message_key)
);
GRANT SELECT ON public.email_items TO authenticated;
GRANT ALL ON public.email_items TO service_role;
ALTER TABLE public.email_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales read mailbox messages" ON public.email_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE TRIGGER email_items_updated BEFORE UPDATE ON public.email_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.email_folder_cursors (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), mailbox_id uuid NOT NULL REFERENCES public.email_mailboxes(id),
 folder text NOT NULL, uid_validity text NOT NULL, last_uid bigint NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(mailbox_id,folder)
);
GRANT ALL ON public.email_folder_cursors TO service_role;
ALTER TABLE public.email_folder_cursors ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER email_folder_cursors_updated BEFORE UPDATE ON public.email_folder_cursors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.email_sync_runs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), mailbox_id uuid NOT NULL REFERENCES public.email_mailboxes(id),
 kind text NOT NULL DEFAULT 'sync', status text NOT NULL DEFAULT 'queued', processed integer NOT NULL DEFAULT 0,
 linked integer NOT NULL DEFAULT 0, error_code text, started_at timestamptz, finished_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.email_sync_runs TO authenticated;
GRANT ALL ON public.email_sync_runs TO service_role;
ALTER TABLE public.email_sync_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales read mailbox logs" ON public.email_sync_runs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE TRIGGER email_sync_runs_updated BEFORE UPDATE ON public.email_sync_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE UNIQUE INDEX email_sync_one_queued ON public.email_sync_runs(mailbox_id) WHERE status='queued';
CREATE UNIQUE INDEX crm_email_external_unique ON public.crm_messages(external_id) WHERE channel='email' AND external_id IS NOT NULL;
CREATE INDEX email_items_unlinked ON public.email_items(mailbox_id) WHERE lead_id IS NULL;

CREATE OR REPLACE FUNCTION public.acquire_email_mailbox(_id uuid,_token uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 UPDATE public.email_mailboxes SET lease_token=_token,lease_until=now()+interval '3 minutes' WHERE id=_id AND (lease_until IS NULL OR lease_until<now());
 RETURN FOUND;
END $$;
REVOKE ALL ON FUNCTION public.acquire_email_mailbox(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_email_mailbox(uuid,uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.validate_email_states() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.smtp_status NOT IN ('pending','sending','accepted','rejected','unknown') OR NEW.copy_status NOT IN ('pending','found','appended','failed','unknown') THEN RAISE EXCEPTION 'Invalid email state'; END IF;
 IF NEW.smtp_status IS DISTINCT FROM OLD.smtp_status AND OLD.smtp_status IN ('accepted','unknown','rejected','sending') AND NEW.smtp_status='pending' THEN RAISE EXCEPTION 'SMTP resend forbidden'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER email_outbox_states BEFORE UPDATE ON public.email_outbox FOR EACH ROW EXECUTE FUNCTION public.validate_email_states();