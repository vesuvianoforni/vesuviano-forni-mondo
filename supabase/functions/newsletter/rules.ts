import { escapeEmail, EMAIL_LOGO } from '../_shared/email-layout.ts';
import { recipientLanguage } from './localization.ts';

export const NEWSLETTER_FROM = 'Vesuviano Forni <newsletter@vesuvianoforni.com>';
export const NEWSLETTER_REPLY_TO = 'info@vesuvianoforni.com';

export type Audience = { stages: string[]; countries: string[] };
export type LeadRow = { id: string; email: string | null; status: string; country: string | null; phone?: string | null; archived?: boolean };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TEST_RE = /(test|example\.com|prova)/i;

/** Picks unique, valid, non-unsubscribed recipients matching the audience. Lost leads are never mailed. */
export function selectRecipients(leads: LeadRow[], audience: Audience, unsubscribed: Set<string>, fallback = 'it') {
  const countries = audience.countries.map((c) => c.trim().toLowerCase()).filter(Boolean);
  const seen = new Set<string>();
  const out: { lead_id: string; email: string; language: string }[] = [];
  for (const l of leads) {
    const email = (l.email || '').trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email) || TEST_RE.test(email)) continue;
    if (l.archived || l.status === 'perso') continue;
    if (!audience.stages.includes(l.status)) continue;
    if (countries.length && !countries.includes((l.country || '').trim().toLowerCase())) continue;
    if (unsubscribed.has(email) || seen.has(email)) continue;
    seen.add(email);
    out.push({ lead_id: l.id, email, language: recipientLanguage(l.phone, l.country, fallback) });
  }
  return out;
}

const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export async function unsubscribeToken(email: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`unsub:${email.toLowerCase()}`));
  return b64url(new Uint8Array(sig)).slice(0, 32);
}
export const encodeEmail = (email: string) => b64url(new TextEncoder().encode(email.toLowerCase()));
export const decodeEmail = (v: string) => new TextDecoder().decode(Uint8Array.from(atob(v.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)));

const FOOTER: Record<string, { unsub: string; why: string }> = {
  it: { unsub: 'Disiscriviti', why: 'Ricevi questa email perché sei in contatto con Vesuviano Forni.' },
  en: { unsub: 'Unsubscribe', why: 'You receive this email because you contacted Vesuviano Forni.' },
  fr: { unsub: 'Se désabonner', why: 'Vous recevez cet e-mail car vous avez contacté Vesuviano Forni.' },
  de: { unsub: 'Abmelden', why: 'Sie erhalten diese E-Mail, weil Sie Vesuviano Forni kontaktiert haben.' },
  es: { unsub: 'Darse de baja', why: 'Recibes este correo porque contactaste con Vesuviano Forni.' },
};

export type Campaign = { subject: string; preheader: string; body: string; image_url: string | null; extra_images?: string[]; cta_label: string | null; cta_url: string | null; language: string };

export function renderNewsletter(c: Campaign, unsubscribeUrl: string) {
  const f = FOOTER[c.language] || FOOTER.it;
  const safeUrl = (u: string | null) => (u && /^https:\/\//.test(u) ? u : null);
  const img = safeUrl(c.image_url);
  const cta = safeUrl(c.cta_url);
  const extras = (c.extra_images || []).map(safeUrl).filter(Boolean).slice(0, 3) as string[];
  const extraRow = extras.length ? `<tr><td style="padding:0 28px 24px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${extras.map((u) => `<td width="${Math.floor(100 / extras.length)}%" style="padding:0 4px;"><img src="${escapeEmail(u)}" alt="" style="display:block;width:100%;height:auto;border:0;border-radius:4px;"></td>`).join('')}</tr></table></td></tr>` : '';
  const paragraphs = c.body.replace(/\r\n/g, '\n').split(/\n\n+/).map((p) => `<p style="margin:0 0 18px;line-height:1.7;">${escapeEmail(p).replace(/\n/g, '<br>')}</p>`).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#f3f4f5;font-family:Arial,Helvetica,sans-serif;color:#242424;">
<div style="display:none;max-height:0;overflow:hidden;">${escapeEmail(c.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f5;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;">
<tr><td style="padding:22px 28px;background:#272321;border-bottom:3px solid #8B4513;"><a href="https://vesuvianoforni.com"><img src="${EMAIL_LOGO}" width="120" height="77" alt="Vesuviano Forni" style="display:block;width:120px;height:77px;border:0;"></a></td></tr>
${img ? `<tr><td><img src="${escapeEmail(img)}" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></td></tr>` : ''}
<tr><td style="padding:30px 28px;font-size:15px;">${paragraphs}
${cta ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 8px;"><tr><td style="background:#8B4513;border-radius:6px;"><a href="${escapeEmail(cta)}" style="display:inline-block;padding:14px 26px;color:#ffffff;font-weight:bold;text-decoration:none;font-size:15px;">${escapeEmail(c.cta_label || 'Scopri di più')}</a></td></tr></table>` : ''}
</td></tr>
${extraRow}
<tr><td style="padding:20px 28px;background:#faf8f6;font-size:12px;line-height:1.6;color:#686868;">
<strong style="color:#242424;">Vesuviano Forni</strong> · Tel. +39 081 1923 1684 · WhatsApp +39 350 928 6941 · <a href="mailto:info@vesuvianoforni.com" style="color:#686868;">info@vesuvianoforni.com</a><br>
${f.why} <a href="${escapeEmail(unsubscribeUrl)}" style="color:#686868;">${f.unsub}</a></td></tr>
</table></td></tr></table></body></html>`;
  const text = `${c.body}\n\n${cta ? `${c.cta_label || ''}: ${cta}\n\n` : ''}Vesuviano Forni · info@vesuvianoforni.com\n${f.unsub}: ${unsubscribeUrl}`;
  return { html, text };
}
