export type EmailSignature = {
  id: string; name: string; role: string; company: string; phone: string; whatsapp: string;
  email: string; website: string; address: string; is_default: boolean;
};

// Email clients cannot load app CSS. Keep the mail theme centralized and inline it at composition time.
const theme = { background: '#f3f4f5', paper: '#ffffff', ink: '#242424', muted: '#686868', border: '#dedede', brand: '#8B4513', header: '#272321' };
export const EMAIL_LOGO = 'https://vesuvianoforni.com/lovable-uploads/vesuviano-logo-bianco.png';
export const escapeEmail = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
export function selectEmailSignature(signatures: EmailSignature[], id?: string | null) {
  if (id === null) return null;
  const signature = id ? signatures.find(s => s.id === id) : signatures.find(s => s.is_default);
  if (id && !signature) throw new Error('MAIL_SIGNATURE_INVALID');
  return signature || null;
}
export function signatureText(signature: EmailSignature | null) {
  if (!signature) return '';
  return [signature.name, signature.role, signature.company, signature.phone,
    signature.whatsapp ? `WhatsApp: ${signature.whatsapp}` : '', signature.email, signature.website, signature.address].filter(Boolean).join('\n');
}
function signatureHTML(s: EmailSignature | null) {
  if (!s) return '';
  const link = (href: string, label: string) => `<a href="${escapeEmail(href)}" style="color:${theme.ink};text-decoration:none;">${escapeEmail(label)}</a>`;
  const digits = (value: string) => value.replace(/\D/g, '');
  const contacts = [s.phone ? link(`tel:+${digits(s.phone)}`, s.phone) : '',
    s.whatsapp ? link(`https://wa.me/${digits(s.whatsapp)}`, `WhatsApp · ${s.whatsapp}`) : '',
    s.email ? link(`mailto:${s.email}`, s.email) : '',
    s.website.startsWith('https://') ? link(s.website, s.website.replace(/^https:\/\//, '').replace(/\/$/, '')) : ''].filter(Boolean);
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:32px;border-top:1px solid ${theme.border};"><tr><td style="padding-top:24px;">
    <p style="margin:0 0 5px;font-size:17px;font-weight:bold;color:${theme.ink};">${escapeEmail(s.name)}</p>
    ${s.role ? `<p style="margin:0 0 5px;font-size:13px;color:${theme.muted};">${escapeEmail(s.role)}</p>` : ''}
    <p style="margin:0 0 16px;font-size:14px;font-weight:bold;color:${theme.brand};">${escapeEmail(s.company)}</p>
    ${contacts.map(contact => `<p style="margin:0 0 7px;font-size:13px;line-height:1.6;overflow-wrap:anywhere;">${contact}</p>`).join('')}
    ${s.address ? `<p style="margin:12px 0 0;font-size:12px;line-height:1.6;color:${theme.muted};">${escapeEmail(s.address).replace(/\n/g, '<br>')}</p>` : ''}
    </td></tr></table>`;
}
export function renderMailboxEmail(body: string, signature: EmailSignature | null) {
  const footer = signatureText(signature);
  const text = [body, footer].filter(Boolean).join('\n\n');
  const paragraphs = body.replace(/\r\n/g, '\n').split(/\n\n+/).map(p => `<p style="margin:0 0 18px;line-height:1.75;overflow-wrap:anywhere;">${escapeEmail(p).replace(/\n/g, '<br>')}</p>`).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"></head>
    <body style="margin:0;padding:0;background:${theme.background};font-family:Arial,Helvetica,sans-serif;color:${theme.ink};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${theme.background};"><tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${theme.paper};">
    <tr><td style="padding:22px 28px;background:${theme.header};border-bottom:3px solid ${theme.brand};"><a href="https://vesuvianoforni.com" style="color:${theme.paper};text-decoration:none;"><img src="${EMAIL_LOGO}" width="120" height="77" alt="Vesuviano Forni" style="display:block;width:120px;height:77px;border:0;"></a></td></tr>
    <tr><td style="padding:30px 24px;font-size:15px;">${paragraphs}${signatureHTML(signature)}</td></tr>
    </table></td></tr></table></body></html>`;
  return { html, text };
}