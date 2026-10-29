export type SubmissionState = 'pending' | 'sending' | 'accepted' | 'rejected' | 'unknown';
export const canSubmitSMTP = (state: SubmissionState) => state === 'pending';
export const canAppendSent = (state: SubmissionState, copy: string) => state === 'accepted' && !['found', 'appended'].includes(copy);
export const nextExistingUIDs = (uids:number[],cursor:number,size=5) => uids.filter(uid=>uid>cursor).sort((a,b)=>a-b).slice(0,size);
export type EmailPart = {type:string;part?:string;disposition?:string;encoding?:string;parameters?:Record<string,string>;childNodes?:EmailPart[]};
export function textPart(structure?:EmailPart):EmailPart | undefined {
  if(!structure||structure.disposition?.toLowerCase()==='attachment'||structure.type==='message/rfc822')return;
  const parts=(structure.childNodes||[]).map(s=>textPart(s)).filter((p):p is EmailPart=>!!p);
  return parts.find(p=>p.type==='text/plain')||parts[0]||(/^text\/(plain|html)$/i.test(structure.type)?structure:undefined);
}

type Folder = { path: string; specialUse?: string; specialUseSource?: string; flags: Set<string> };
export function discoverSent(folders: Folder[], saved?: string | null): string {
  const selectable = folders.filter(f => !f.flags.has('\\Noselect'));
  const authoritative = selectable.filter(f => f.specialUse === '\\Sent' && f.specialUseSource === 'extension');
  if (authoritative.length === 1) return authoritative[0].path;
  if (saved && selectable.some(f => f.path === saved)) return saved;
  const inferred = selectable.filter(f => f.specialUse === '\\Sent' || /(^|[/.])(sent|sent items|sent messages|posta inviata|inviata|inviati|sent mail)$/i.test(f.path));
  if (inferred.length === 1) return inferred[0].path;
  throw new Error('SENT_FOLDER_AMBIGUOUS');
}

export function nextUIDBatch(last: number, validity: string | undefined, currentValidity: string, uidNext: number, size = 25) {
  const cursor = validity === currentValidity ? last : 0;
  return { cursor, start: cursor + 1, end: Math.min(cursor + size, uidNext - 1) };
}
export function chooseLead(ids: string[], threadLead?: string | null) {
  const unique = [...new Set(ids)];
  if (threadLead && (unique.length === 0 || unique.includes(threadLead))) return threadLead;
  return unique.length === 1 ? unique[0] : null;
}

export function safeMailError(error: unknown): string {
  const e = error as { code?: string; responseCode?: number; message?: string };
  if (e?.responseCode === 535 || e?.code === 'EAUTH' || /authentication|invalid credentials/i.test(e?.message || '')) return 'MAIL_AUTH_FAILED';
  if (/certificate|cert_|tls/i.test(e?.code || '')) return 'MAIL_TLS_FAILED';
  if (e?.code === 'ETIMEDOUT' || e?.code === 'ETIMEOUT') return 'MAIL_TIMEOUT';
  if (e?.code === 'ECONNREFUSED') return 'MAIL_CONNECTION_REFUSED';
  const known = ['SENT_FOLDER_AMBIGUOUS','SMTP_PORT_UNSUPPORTED','IMAP_PORT_UNSUPPORTED','MAIL_CONFIG_MISSING','MAILBOX_DISABLED','MAILBOX_BUSY','SMTP_UNKNOWN','SENT_COPY_UNKNOWN','MIME_TOO_LARGE','MAIL_SEARCH_FAILED','MAIL_IDEMPOTENCY_CONFLICT','MAIL_DB_FAILED'];
  return known.includes(e?.message || '') ? String(e.message) : 'MAIL_OPERATION_FAILED';
}