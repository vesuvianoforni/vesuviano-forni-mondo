CREATE TABLE public.email_signatures (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 mailbox_id uuid NOT NULL REFERENCES public.email_mailboxes(id) ON DELETE CASCADE,
 name text NOT NULL,
 role text NOT NULL DEFAULT '',
 company text NOT NULL DEFAULT 'Vesuviano Forni',
 phone text NOT NULL DEFAULT '',
 whatsapp text NOT NULL DEFAULT '',
 email text NOT NULL DEFAULT 'info@vesuvianoforni.com',
 website text NOT NULL DEFAULT 'https://vesuvianoforni.com',
 address text NOT NULL DEFAULT '',
 is_default boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.email_signatures TO authenticated;
GRANT ALL ON public.email_signatures TO service_role;
ALTER TABLE public.email_signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales read email signatures" ON public.email_signatures FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'commerciale'));
CREATE POLICY "Backend manages email signatures" ON public.email_signatures FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE UNIQUE INDEX email_signature_default_per_mailbox ON public.email_signatures(mailbox_id) WHERE is_default;
CREATE TRIGGER email_signatures_updated_at BEFORE UPDATE ON public.email_signatures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.save_email_signature(_mailbox uuid, _id uuid, _fields jsonb)
RETURNS public.email_signatures LANGUAGE plpgsql SET search_path=public AS $$
DECLARE result public.email_signatures;
BEGIN
 PERFORM 1 FROM public.email_mailboxes WHERE id=_mailbox FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'MAIL_CONFIG_MISSING'; END IF;
 IF coalesce((_fields->>'is_default')::boolean,false) THEN
  UPDATE public.email_signatures SET is_default=false WHERE mailbox_id=_mailbox AND is_default AND id<>_id;
 END IF;
 INSERT INTO public.email_signatures(id,mailbox_id,name,role,company,phone,whatsapp,email,website,address,is_default)
 VALUES (_id,_mailbox,_fields->>'name',_fields->>'role',_fields->>'company',_fields->>'phone',_fields->>'whatsapp',_fields->>'email',_fields->>'website',_fields->>'address',(_fields->>'is_default')::boolean)
 ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,role=EXCLUDED.role,company=EXCLUDED.company,phone=EXCLUDED.phone,whatsapp=EXCLUDED.whatsapp,email=EXCLUDED.email,website=EXCLUDED.website,address=EXCLUDED.address,is_default=EXCLUDED.is_default
 WHERE email_signatures.mailbox_id=_mailbox RETURNING * INTO result;
 IF result.id IS NULL THEN RAISE EXCEPTION 'MAIL_SIGNATURE_INVALID'; END IF;
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.save_email_signature(uuid,uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_email_signature(uuid,uuid,jsonb) TO service_role;
ALTER TABLE public.email_outbox ADD COLUMN rendered_text text, ADD COLUMN rendered_html text, ADD COLUMN signature_id uuid, ADD COLUMN signature_snapshot jsonb;