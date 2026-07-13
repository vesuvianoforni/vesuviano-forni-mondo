import { useEffect } from 'react';
import { loadLanguage } from '@/i18n/config';
import Header from '@/components/Header';
import SEOHead from '@/components/SEOHead';
import ConsultationForm from '@/components/ConsultationForm';
import { Phone, Mail, MessageCircle, MapPin } from 'lucide-react';

type Lang = 'it' | 'en' | 'fr' | 'es' | 'de';

const COPY: Record<Lang, { title: string; subtitle: string; seoTitle: string; seoDesc: string; whatsapp: string; call: string; email: string; visit: string; address: string; canonical: string }> = {
  it: {
    title: 'Contattaci',
    subtitle: 'Parla con il nostro team. Rispondiamo entro 24 ore lavorative.',
    seoTitle: 'Contatti | Vesuviano Forni',
    seoDesc: 'Contatta Vesuviano Forni: telefono, email, WhatsApp e sede a Sant\'Anastasia (NA). Rispondiamo entro 24 ore lavorative.',
    whatsapp: 'Scrivici su WhatsApp',
    call: 'Chiamaci',
    email: 'Scrivici',
    visit: 'Vieni a trovarci',
    address: 'Sant\'Anastasia (NA), Italia',
    canonical: '/it/contatti',
  },
  en: {
    title: 'Contact us',
    subtitle: 'Talk to our team. We reply within 24 working hours.',
    seoTitle: 'Contact | Vesuviano Forni',
    seoDesc: 'Contact Vesuviano Forni: phone, email, WhatsApp and workshop in Sant\'Anastasia (Naples, Italy). We reply within 24 working hours.',
    whatsapp: 'Message us on WhatsApp',
    call: 'Call us',
    email: 'Email us',
    visit: 'Visit our workshop',
    address: 'Sant\'Anastasia (Naples), Italy',
    canonical: '/en/contact',
  },
  fr: {
    title: 'Contactez-nous',
    subtitle: 'Parlez avec notre équipe. Nous répondons sous 24 heures ouvrées.',
    seoTitle: 'Contact | Vesuviano Forni',
    seoDesc: 'Contactez Vesuviano Forni : téléphone, email, WhatsApp et atelier à Sant\'Anastasia (Naples, Italie).',
    whatsapp: 'Écrivez-nous sur WhatsApp',
    call: 'Appelez-nous',
    email: 'Écrivez-nous',
    visit: 'Visitez notre atelier',
    address: 'Sant\'Anastasia (Naples), Italie',
    canonical: '/fr/contact',
  },
  es: {
    title: 'Contáctanos',
    subtitle: 'Habla con nuestro equipo. Respondemos en 24 horas laborables.',
    seoTitle: 'Contacto | Vesuviano Forni',
    seoDesc: 'Contacta con Vesuviano Forni: teléfono, email, WhatsApp y taller en Sant\'Anastasia (Nápoles, Italia).',
    whatsapp: 'Escríbenos por WhatsApp',
    call: 'Llámanos',
    email: 'Escríbenos',
    visit: 'Visita nuestro taller',
    address: 'Sant\'Anastasia (Nápoles), Italia',
    canonical: '/es/contacto',
  },
  de: {
    title: 'Kontakt',
    subtitle: 'Sprechen Sie mit unserem Team. Wir antworten innerhalb von 24 Werkstunden.',
    seoTitle: 'Kontakt | Vesuviano Forni',
    seoDesc: 'Kontaktieren Sie Vesuviano Forni: Telefon, E-Mail, WhatsApp und Werkstatt in Sant\'Anastasia (Neapel, Italien).',
    whatsapp: 'WhatsApp-Nachricht senden',
    call: 'Rufen Sie uns an',
    email: 'E-Mail schreiben',
    visit: 'Besuchen Sie uns',
    address: 'Sant\'Anastasia (Neapel), Italien',
    canonical: '/de/kontakt',
  },
};

interface Props { lang: Lang }

const LocalizedContact = ({ lang }: Props) => {
  const c = COPY[lang];

  useEffect(() => {
    loadLanguage(lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const cards = [
    {
      icon: Phone,
      title: c.call,
      value: '+39 081 19231684',
      href: 'tel:+390811923168',
    },
    {
      icon: MessageCircle,
      title: c.whatsapp,
      value: '+39 350 928 6941',
      href: 'https://api.whatsapp.com/send?phone=393509286941&text=Ciao%20Vesuviano%20Forni%2C%20',
    },
    {
      icon: Mail,
      title: c.email,
      value: 'info@vesuvianoforni.com',
      href: 'mailto:info@vesuvianoforni.com',
    },
    {
      icon: MapPin,
      title: c.visit,
      value: c.address,
      href: 'https://maps.google.com/?q=Vesuviano+Forni+Sant%27Anastasia+Napoli',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SEOHead lang={lang} canonical={c.canonical} title={c.seoTitle} description={c.seoDesc} />

      <section className="bg-charcoal-900 text-white pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl text-center">
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{c.title}</h1>
          <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto">{c.subtitle}</p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {cards.map((card) => {
              const Icon = card.icon;
              const external = card.href.startsWith('http');
              return (
                <a
                  key={card.title}
                  href={card.href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-stone-200 hover:border-vesuviano-300 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-vesuviano-100 flex items-center justify-center mb-4 group-hover:bg-vesuviano-600 transition-colors">
                    <Icon className="w-6 h-6 text-vesuviano-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-inter font-semibold text-charcoal-900 mb-1">{card.title}</h3>
                  <p className="text-stone-600 text-sm break-words">{card.value}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <div id="consultation">
        <ConsultationForm />
      </div>
    </div>
  );
};

export default LocalizedContact;
