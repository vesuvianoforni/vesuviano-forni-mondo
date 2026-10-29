import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { mailboxRequest, type MailSignature } from '@/lib/mailboxEmail';

export function EmailPreview({ body, signatureId, signature }: { body: string; signatureId?: string | null; signature?: Partial<MailSignature> }) {
  const [html, setHtml] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const fields = JSON.stringify(signature);
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError('');
    const timer = setTimeout(async () => {
      try {
        const result = await mailboxRequest('preview', { body, ...(signature ? { signature: JSON.parse(fields) } : { signature_id: signatureId }) });
        if (!cancelled) setHtml(result.html);
      } catch { if (!cancelled) { setHtml(''); setError('Completa i campi validi per vedere l’anteprima.'); } }
      finally { if (!cancelled) setLoading(false); }
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [body, signatureId, fields]);
  return <div className="relative min-w-0 overflow-hidden rounded-md border bg-muted">
    {loading && <div role="status" className="absolute right-3 top-3 rounded-md border bg-background p-2"><Loader2 className="h-4 w-4 animate-spin"/><span className="sr-only">Caricamento anteprima</span></div>}
    {error ? <p role="alert" className="p-6 text-sm text-muted-foreground">{error}</p> : <iframe title="Anteprima email HTML" sandbox="" referrerPolicy="no-referrer" srcDoc={html} className="h-[580px] w-full border-0" />}
  </div>;
}