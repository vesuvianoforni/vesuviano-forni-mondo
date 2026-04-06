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
      question: t('faq.questions.q1.question'),
      answer: t('faq.questions.q1.answer')
    },
    {
      question: t('faq.questions.q2.question'),
      answer: t('faq.questions.q2.answer')
    },
    {
      question: t('faq.questions.q3.question'),
      answer: t('faq.questions.q3.answer')
    },
    {
      question: t('faq.questions.q4.question'),
      answer: t('faq.questions.q4.answer')
    },
    {
      question: t('faq.questions.q5.question'),
      answer: t('faq.questions.q5.answer')
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
            {t('faq.title')}
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            {t('faq.subtitle')}
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
            {t('faq.cta.title')}
          </h3>
          <p className="text-stone-600 mb-6">
            {t('faq.cta.subtitle')}
          </p>
          <CtaButton className="px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl" />
        </div>
      </div>
    </section>
  );
};

export default FAQSection;