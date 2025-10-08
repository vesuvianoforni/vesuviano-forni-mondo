import React from "react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle, HelpCircle } from "lucide-react";

const FAQSection = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const scrollToContact = () => {
    const element = document.getElementById('consultation');
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const faqs = [
    {
      question: "Posso personalizzare il forno in base al mio locale?",
      answer: "Assolutamente sì. Ogni forno può essere personalizzato nella verniciatura, nel rivestimento in piastrelle e persino nel design della cupola. Offriamo anche un render 3D gratuito per visualizzare il forno nel tuo ambiente prima della produzione."
    },
    {
      question: "Effettuate consegna e installazione?",
      answer: "Sì, ci occupiamo di trasporto e installazione completa in Italia e all'estero. Il forno arriva già assemblato e testato, pronto all'uso. Il nostro team tecnico può anche fornire formazione iniziale sul corretto utilizzo."
    },
    {
      question: "Quanto tempo serve per ricevere il forno?",
      answer: "I tempi medi di consegna variano da 20 a 45 giorni, in base al livello di personalizzazione richiesto. Dopo la conferma dell'ordine, riceverai una data stimata di consegna garantita."
    },
    {
      question: "Offrite assistenza o garanzia?",
      answer: "Tutti i nostri forni sono coperti da 3 anni di garanzia ufficiale su struttura e componenti. In più, il nostro centro tecnico a Napoli fornisce assistenza post-vendita e ricambi originali sempre disponibili."
    },
    {
      question: "Quanto costa un forno?",
      answer: "I nostri forni artigianali partono da 2.700,00 € per i modelli base fino a circa 23.000,00 € per realizzazioni speciali, come il forno placcato in oro che abbiamo costruito per un cliente esclusivo. Ogni progetto è unico e viene realizzato su misura, in base alle esigenze produttive e al design desiderato. Per ricevere un preventivo personalizzato, puoi richiedere una consulenza gratuita."
    }
  ];

  return (
    <section id="faq" className="py-16 md:py-24 bg-gradient-to-b from-white to-stone-50">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-vesuviano-100 rounded-2xl mb-6">
            <HelpCircle className="w-8 h-8 text-vesuviano-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
            Domande Frequenti
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Trova le risposte alle domande più comuni sui nostri forni artigianali
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-white border border-stone-200 rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left font-semibold text-stone-900 hover:text-vesuviano-600 py-6">
                <span className="flex items-start gap-3">
                  <span className="text-vesuviano-500 font-bold shrink-0">{index + 1}.</span>
                  <span>{faq.question}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-stone-600 pb-6 pl-8">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-vesuviano-50 to-stone-50 rounded-2xl p-8 border border-vesuviano-100">
          <MessageCircle className="w-12 h-12 text-vesuviano-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-stone-900 mb-3">
            Non trovi la risposta che cerchi?
          </h3>
          <p className="text-stone-600 mb-6">
            Contattaci ora e un nostro esperto ti risponderà entro 24 ore
          </p>
          <Button 
            onClick={scrollToContact}
            size="lg"
            className="bg-vesuviano-600 hover:bg-vesuviano-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Contattaci ora
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;