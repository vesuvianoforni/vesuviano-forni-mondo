// Pure helpers for the Telegram cockpit: message layout, priority, Rome clock.
export const ERP = 'https://vesuvianoforni.com';

export const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

export const CHANNEL: Record<string, string> = {
  wasender: '💬 WhatsApp Gennaro', whatsapp_api: '🤖 Bruno IT', whatsapp_uk: '🤖 Bruno UK', email: '📧 Email', call: '📞 Chiamata', note: '📝 Nota',
};
export const STAGE: Record<string, string> = {
  nuovo: 'Nuovo', pre_qualificato: 'Pre-qualificato', qualificato: 'Qualificato', trattativa: 'Trattativa', vinto: 'Vinto', perso: 'Perso',
};

export type Priority = 'alta' | 'normale' | 'bassa';
export function priority(stage: string | null | undefined, kind: 'lead' | 'message', hasOpenOffer = false): Priority {
  if (kind === 'lead') return 'alta';
  if (stage === 'trattativa' || hasOpenOffer) return 'alta';
  if (stage === 'perso' || stage === 'vinto') return 'bassa';
  return 'normale';
}
const PRI: Record<Priority, string> = { alta: '🔴 Alta', normale: '🟡 Normale', bassa: '⚪ Bassa' };

export interface LeadLite { id: string; contact_name?: string | null; company_name?: string | null; country?: string | null; city?: string | null; status?: string | null; phone?: string | null; email?: string | null; next_activity_type?: string | null; next_activity_date?: string | null; value?: number | null }

export const leadName = (l: LeadLite) => l.contact_name || l.company_name || l.email || l.phone || 'Cliente';
export const leadUrl = (id: string) => `${ERP}/erp/crm?lead=${id}`;
export const communicationUrl = (id: string, channel: string) => `${ERP}/erp/${channel === 'email' ? 'mail' : 'chat'}?lead=${encodeURIComponent(id)}${channel === 'email' ? '' : `&platform=${encodeURIComponent(channel)}`}`;
export function directCallLabel(status: string, answered: boolean) {
  if (status === 'unknown') return 'Esito da verificare';
  if (status === 'failed') return 'Chiamata non riuscita';
  return answered ? 'Chiamata conclusa' : 'Tentativo concluso senza risposta registrata';
}

export function telegramCallSummary(call: { summary?: string | null; recording_status?: string | null; recording_error?: string | null }) {
  const summary = call.summary?.trim();
  if (summary) return `<b>Riepilogo</b>\n${esc(cut(summary, 2200))}`;
  if (['pending','starting','recording','processing'].includes(call.recording_status ?? '')) return '<i>Riepilogo in preparazione.</i>';
  return '<i>Riepilogo non disponibile: nessuna conversazione registrata ed elaborata.</i>';
}

export function fmtDate(iso?: string | null) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

/** Fixed card layout used by every Bruno alert. */
export function card(o: { icon: string; type: string; pri?: Priority; lead?: LeadLite; channel?: string; body?: string[]; context?: string[] }) {
  const head = `${o.icon} <b>${esc(o.type)}</b>${o.pri ? ' · ' + PRI[o.pri] : ''}`;
  const rows: string[] = [head];
  if (o.lead) {
    const where = [o.lead.city, o.lead.country].filter(Boolean).join(', ');
    rows.push(`👤 <b>${esc(leadName(o.lead))}</b>${where ? ` (${esc(where)})` : ''}${o.lead.status ? ` · ${esc(STAGE[o.lead.status] ?? o.lead.status)}` : ''}`);
  }
  if (o.channel) rows.push(`Canale: ${esc(CHANNEL[o.channel] ?? o.channel)}`);
  if (o.body?.length) rows.push('━━━━━━━━━━', ...o.body);
  if (o.context?.length) rows.push('━━━━━━━━━━', ...o.context.map((c) => `<i>${c}</i>`));
  return rows.join('\n').slice(0, 4000);
}

export function messageBody(m: { body?: string | null; subject?: string | null; sender?: string | null; created_at?: string }) {
  const parts: string[] = [];
  if (m.subject) parts.push(`<b>${esc(cut(m.subject, 150))}</b>`);
  const text = (m.body ?? '').trim();
  parts.push(text ? `«${esc(cut(text, 600))}»${text.length > 600 ? '\n<i>continua nella scheda</i>' : ''}` : '<i>(nessun testo)</i>');
  if (m.created_at) parts.push(`🕒 ${fmtDate(m.created_at)}`);
  return parts.join('\n');
}

export function leadContext(l: LeadLite, extra: string[] = []) {
  const c: string[] = [];
  if (l.next_activity_type || l.next_activity_date) c.push(`Prossima attività: ${esc(l.next_activity_type ?? '')} ${fmtDate(l.next_activity_date)}`.trim());
  if (l.value) c.push(`Valore: € ${Number(l.value).toLocaleString('it-IT')}`);
  return [...c, ...extra.map(esc)];
}

export function romeClock(d = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', hour: '2-digit', weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hourCycle: 'h23' }).formatToParts(d).map((x) => [x.type, x.value]));
  return { hour: Number(p.hour), weekday: p.weekday as string, day: `${p.year}-${p.month}-${p.day}` };
}

/** Which daily summary is due at this Rome hour (weekdays only). */
export function dueSummary(d = new Date()): 'mattina' | 'sera' | null {
  const c = romeClock(d);
  if (c.weekday === 'Sat' || c.weekday === 'Sun') return null;
  return c.hour === 8 ? 'mattina' : c.hour === 20 ? 'sera' : null;
}

export const COMMANDS = [
  { command: 'oggi', description: 'Agenda e attività scadute' },
  { command: 'lead', description: 'Scheda sintetica: /lead nome' },
  { command: 'caldi', description: 'Trattative senza risposta da 48h' },
  { command: 'offerte', description: 'Offerte inviate in attesa' },
  { command: 'mario', description: 'Stato autopilota e invii di oggi' },
  { command: 'aiuto', description: 'Esempi di istruzioni a Bruno' },
];

export const HELP = [
  '🧭 <b>Cabina di comando Bruno</b>',
  'Scrivete menzionando @Erp_vesuviano_bot o rispondendo a un suo messaggio. Istruzioni in italiano: Bruno scrive al cliente nella sua lingua.',
  '',
  '<b>Esempi</b>',
  '• scrivi a Mark su WhatsApp Gennaro che il forno parte venerdì',
  '• manda un\'email a Pierre con la scheda tecnica dell\'Anastasia',
  '• dopo la nostra chiamata a Mark, prepara un follow-up su Bruno UK',
  '• mostra le ultime chiamate dirette del team e le email di Pierre',
  '• crea un\'offerta per Stanislao con un Ottavio gas e mandala',
  '• sposta Luca in Trattativa, richiamo giovedì alle 10',
  '',
  '<b>Comandi</b>',
  ...COMMANDS.map((c) => `/${c.command} – ${c.description}`),
  '',
  'Ogni azione arriva come proposta: ✅ Approva, ✏️ Modifica, ❌ Annulla. Le proposte scadono dopo 24 ore.',
].join('\n');
