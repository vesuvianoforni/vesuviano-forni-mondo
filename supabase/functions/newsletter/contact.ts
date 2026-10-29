/** Confirmed business contact, shared by the HTML and plain-text newsletter. */
export const NEWSLETTER_CONTACT = {
  name: 'Gennaro Caglione',
  role: 'Sales & Export Manager',
  company: 'Vesuviano Forni',
  phone: '+39 081 1923 1684',
  whatsapp: '+39 350 928 6941',
  email: 'info@vesuvianoforni.com',
  website: 'https://vesuvianoforni.com',
} as const;

export const newsletterWhatsAppUrl = () => `https://wa.me/${NEWSLETTER_CONTACT.whatsapp.replace(/\D/g, '')}`;

const LABELS: Record<string, string> = {
  it: 'Contattami su WhatsApp',
  en: 'Contact me on WhatsApp',
  fr: 'Contactez-moi sur WhatsApp',
  de: 'Kontaktieren Sie mich per WhatsApp',
  es: 'Contáctame por WhatsApp',
};
export const newsletterWhatsAppLabel = (language: string) => LABELS[language] || LABELS.it;