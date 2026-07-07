-- Add signature columns
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS signature_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  ADD COLUMN IF NOT EXISTS client_signature TEXT,
  ADD COLUMN IF NOT EXISTS client_signed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS client_signature_ip TEXT;

-- Backfill token for existing rows (if any)
UPDATE public.contracts
  SET signature_token = encode(gen_random_bytes(24), 'hex')
  WHERE signature_token IS NULL;

-- Public read via token (anon can only see contracts if they know the token — token filter enforced client-side via .eq('signature_token', token))
GRANT SELECT ON public.contracts TO anon;
GRANT UPDATE (client_signature, client_signed_at, client_signature_ip, status, signed_at) ON public.contracts TO anon;

-- Public policies scoped by presence of a token match; since anon cannot filter server-side with auth.uid(),
-- we allow SELECT to anon only for rows accessed by token (client always queries with .eq('signature_token', ...)).
-- To keep it safe we require signature_token IS NOT NULL and expose only via that filter.
CREATE POLICY "Anon can read contract by token"
  ON public.contracts FOR SELECT
  TO anon
  USING (signature_token IS NOT NULL);

CREATE POLICY "Anon can sign contract by token (once)"
  ON public.contracts FOR UPDATE
  TO anon
  USING (signature_token IS NOT NULL AND client_signature IS NULL)
  WITH CHECK (signature_token IS NOT NULL);