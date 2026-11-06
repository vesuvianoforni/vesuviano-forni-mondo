// Site-wide structured data, ported from the former index.html <head>.
export const SITE_STRUCTURED_DATA: ReadonlyArray<Record<string, unknown>> = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Vesuviano Forni",
    "alternateName": "Vesuviano",
    "description": "Produttore di forni artigianali napoletani dal 1950. Specializzati in forni a legna tradizionali, forni a gas/elettrici moderni e la rivoluzionaria linea VesuvioBuono a zero emissioni.",
    "url": "https://vesuvianoforni.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/oven-gallery/site/vesuviano-logo-bianco.png",
      "width": 400,
      "height": 400
    },
    "image": "https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/oven-gallery/site/vesuviano-social-banner.jpg",
    "sameAs": [
      "https://www.facebook.com/vesuviano",
      "https://www.instagram.com/vesuviano",
      "https://www.linkedin.com/company/vesuviano-forni"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Napoli",
      "addressRegion": "Campania",
      "addressCountry": "IT",
      "postalCode": "80100"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 40.8518,
      "longitude": 14.2681
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "availableLanguage": [
          "Italian",
          "English",
          "French",
          "German",
          "Spanish"
        ],
        "areaServed": "Worldwide"
      },
      {
        "@type": "ContactPoint",
        "contactType": "Sales",
        "availableLanguage": [
          "Italian",
          "English"
        ],
        "areaServed": "Europe"
      }
    ],
    "foundingDate": "1950",
    "founder": {
      "@type": "Person",
      "name": "Famiglia Vesuviano"
    },
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "value": "20-50"
    },
    "knowsAbout": [
      "Forni a legna",
      "Forni tradizionali napoletani",
      "Forni pizza",
      "Tecnologie a zero emissioni",
      "Artigianato italiano",
      "Mattoni refrattari"
    ],
    "makesOffer": [
      {
        "@type": "Product",
        "name": "Forni a Legna Tradizionali",
        "description": "Forni a legna artigianali napoletani per pizza e pane, realizzati con mattoni refrattari di alta qualità",
        "category": "Forni a Legna",
        "brand": {
          "@type": "Brand",
          "name": "Vesuviano"
        },
        "manufacturer": {
          "@type": "Organization",
          "name": "Vesuviano Forni"
        }
      },
      {
        "@type": "Product",
        "name": "VesuvioBuono - Forni a Zero Emissioni",
        "description": "Forni innovativi a zero impatto ambientale con abbattitore di fuliggine integrato, per un futuro sostenibile",
        "category": "Forni Ecologici",
        "brand": {
          "@type": "Brand",
          "name": "VesuvioBuono"
        },
        "manufacturer": {
          "@type": "Organization",
          "name": "Vesuviano Forni"
        },
        "offers": {
          "@type": "Offer",
          "availability": "https://schema.org/InStock",
          "priceRange": "€€€",
          "seller": {
            "@type": "Organization",
            "name": "Vesuviano Forni"
          }
        }
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    },
    "areaServed": {
      "@type": "Place",
      "name": "Worldwide"
    },
    "slogan": "Tradizione e innovazione dal 1950"
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Vesuviano Forni",
    "alternateName": "Vesuviano",
    "url": "https://vesuvianoforni.com",
    "description": "Sito ufficiale di Vesuviano Forni - produttore di forni artigianali napoletani dal 1950",
    "publisher": {
      "@type": "Organization",
      "name": "Vesuviano Forni"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://vesuvianoforni.com/?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": [
      "it-IT",
      "en-US",
      "fr-FR",
      "de-DE",
      "es-ES"
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Sezioni Principali",
    "description": "Navigazione principale del sito Vesuviano Forni",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Chi Siamo",
        "url": "https://vesuvianoforni.com/#craftsmanship",
        "description": "Scopri la nostra storia e tradizione artigianale napoletana dal 1950"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "I Nostri Servizi",
        "url": "https://vesuvianoforni.com/#services",
        "description": "Consulenza tecnica, progettazione 3D, logistica internazionale e formazione"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "VesuvioBuono",
        "url": "https://vesuvianoforni.com/#vesuviobuono",
        "description": "Forni rivoluzionari a zero emissioni per un futuro sostenibile"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Richiedi Offerta",
        "url": "https://vesuvianoforni.com/#consultation",
        "description": "Contattaci per una consulenza gratuita personalizzata"
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": "Architetto AI",
        "url": "https://vesuvianoforni.com/architettoai",
        "description": "Visualizza il tuo forno nel tuo spazio con AI e Realtà Aumentata"
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://vesuvianoforni.com/#localbusiness",
    "name": "Vesuviano Forni",
    "description": "Laboratorio artigianale di forni napoletani professionali a Napoli, dal 1950.",
    "url": "https://vesuvianoforni.com",
    "telephone": "+39 081 1923 1684",
    "email": "info@vesuvianoforni.com",
    "image": "https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/oven-gallery/site/vesuviano-social-banner.jpg",
    "priceRange": "€€€",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Sant'Anastasia",
      "addressRegion": "Campania",
      "addressCountry": "IT",
      "postalCode": "80048"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 40.8665,
      "longitude": 14.4036
    },
    "areaServed": {
      "@type": "Place",
      "name": "Worldwide"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Posso personalizzare il forno in base al mio locale?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Assolutamente sì. Ogni forno può essere personalizzato nella verniciatura, nel rivestimento in piastrelle e persino nel design della cupola. Offriamo anche un render 3D gratuito per visualizzare il forno nel tuo ambiente prima della produzione."
        }
      },
      {
        "@type": "Question",
        "name": "Effettuate consegna e installazione?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sì, ci occupiamo di trasporto e installazione completa in Italia e all'estero. Il forno arriva già assemblato e testato, pronto all'uso. Il nostro team tecnico può anche fornire formazione iniziale sul corretto utilizzo."
        }
      },
      {
        "@type": "Question",
        "name": "Quanto tempo serve per ricevere il forno?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "I tempi medi di consegna variano da 20 a 45 giorni, in base al livello di personalizzazione richiesto. Dopo la conferma dell'ordine, riceverai una data stimata di consegna garantita."
        }
      },
      {
        "@type": "Question",
        "name": "Offrite assistenza o garanzia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tutti i nostri forni sono coperti da 3 anni di garanzia ufficiale su struttura e componenti. In più, il nostro centro tecnico a Napoli fornisce assistenza post-vendita e ricambi originali sempre disponibili."
        }
      },
      {
        "@type": "Question",
        "name": "Quanto costa un forno?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "I nostri forni artigianali partono da 2.700,00 € per i modelli base fino a circa 23.000,00 € per realizzazioni speciali. Ogni progetto è realizzato su misura. Per un preventivo personalizzato puoi richiedere una consulenza gratuita."
        }
      }
    ]
  }
];
