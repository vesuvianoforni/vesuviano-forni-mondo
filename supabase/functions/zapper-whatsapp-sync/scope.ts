// Pure helpers for the Zapper → Vesuviano WhatsApp (WaSender di Gennaro) sync.

/** Gennaro's WaSender number (+39 350 928 6941): only this account is imported. */
export const GENNARO_LINE = '3509286941';

export const digits = (v: unknown) => String(v ?? '').replace(/\D/g, '');

/** Strip WhatsApp JID suffixes and international prefixes to a comparable national number. */
export const local = (v: unknown) => {
  let d = digits(String(v ?? '').split('@')[0]);
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('39') && d.length > 10) d = d.slice(2);
  return d;
};

export const phoneKey = (v: unknown) => local(v).slice(-9);

export const isGennaro = (accountPhone: unknown) => local(accountPhone).endsWith(GENNARO_LINE);

export const normalizeText = (t: unknown) => String(t ?? '').trim().replace(/\s+/g, ' ');

const MEDIA_LABEL: Record<string, string> = {
  image: '📷 Immagine', video: '🎬 Video', audio: '🎵 Audio', document: '📄 Documento', sticker: '🎨 Sticker',
};

export function messageBody(m: { content?: string | null; message_type?: string | null; file_name?: string | null }) {
  const text = String(m.content ?? '').trim();
  if (text) return text.slice(0, 20000);
  const label = MEDIA_LABEL[String(m.message_type ?? '')] ?? '[messaggio senza testo]';
  return m.file_name ? `${label} · ${m.file_name}` : label;
}

export function externalId(m: { wasender_id?: string | null; id?: string | null }) {
  const id = String(m.wasender_id || m.id || '').trim();
  return id && id.length <= 200 ? `zapper-wa:${id}` : null;
}
