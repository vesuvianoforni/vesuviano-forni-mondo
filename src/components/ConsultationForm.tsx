import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Download, CheckCircle, Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ConsultationForm = () => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    ovenType: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: t('consultation.messages.requiredFields'),
        description: t('consultation.messages.fillRequired'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-consultation-email', {
        body: formData
      });

      if (error) throw error;

      toast({
        title: t('consultation.messages.success'),
        description: t('consultation.messages.successDescription'),
      });
      
      setFormData({ name: "", email: "", phone: "", country: "", ovenType: "", message: "" });
    } catch (error) {
      console.error("Errore invio consulenza:", error);
      toast({
        title: t('consultation.messages.error'),
        description: t('consultation.messages.errorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="consultation" className="py-16 md:py-20 bg-gradient-to-br from-stone-50 to-vesuviano-50/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 md:mb-14">
            <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm md:text-base font-semibold mb-4">
              <CheckCircle className="mr-2" size={18} />
              {t('consultation.badge').toUpperCase()}
            </Badge>
            <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-5">
              {t('consultation.header.title')}
            </h2>
            <p className="font-inter text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('consultation.header.subtitle')}
            </p>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6 md:gap-8">
            {/* Form */}
            <div className="order-1 lg:order-2 lg:col-span-3">
              <Card className="shadow-lg border-stone-200/60">
                <CardContent className="p-5 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-foreground">{t('consultation.form.fullName')}</label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        placeholder={t('consultation.form.fullNamePlaceholder')}
                        className="h-11"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">{t('consultation.form.email')}</label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                          placeholder={t('consultation.form.emailPlaceholder')}
                          className="h-11"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">{t('consultation.form.phone')}</label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          required
                          placeholder={t('consultation.form.phonePlaceholder')}
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-foreground">{t('consultation.form.message')}</label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder={t('consultation.form.messagePlaceholder')}
                        rows={3}
                        className="resize-none"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full bg-vesuviano-600 hover:bg-vesuviano-700 disabled:opacity-50 text-white text-base md:text-lg py-3.5 h-auto flex flex-col items-center gap-0.5 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          {t('consultation.form.submitting')}
                        </span>
                      ) : (
                        <>
                          <span className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            {t('cta.getQuote')}
                          </span>
                          <span className="text-xs font-normal opacity-80">{t('cta.getQuoteSubtext')}</span>
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center leading-relaxed">
                      {t('consultation.messages.privacy')}
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="order-2 lg:order-1 lg:col-span-2 space-y-4">
              <Card className="shadow-sm border-stone-200/60">
                <CardContent className="p-5 md:p-6">
                  <h3 className="font-playfair text-lg font-semibold text-foreground mb-4">{t('consultation.contact.title')}</h3>
                  <div className="space-y-4">
                    <a href="tel:+393773831442" className="flex items-center gap-3 text-muted-foreground hover:text-vesuviano-600 transition-colors group">
                      <div className="w-10 h-10 bg-vesuviano-50 rounded-lg flex items-center justify-center group-hover:bg-vesuviano-100 transition-colors">
                        <Phone className="text-vesuviano-600" size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('consultation.contact.phone')}</p>
                        <p className="font-medium text-foreground">+39 377 383 1442</p>
                      </div>
                    </a>
                    <a href="mailto:info@vesuvianoforni.com" className="flex items-center gap-3 text-muted-foreground hover:text-vesuviano-600 transition-colors group">
                      <div className="w-10 h-10 bg-vesuviano-50 rounded-lg flex items-center justify-center group-hover:bg-vesuviano-100 transition-colors">
                        <Mail className="text-vesuviano-600" size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('consultation.contact.email')}</p>
                        <p className="font-medium text-foreground">info@vesuvianoforni.com</p>
                      </div>
                    </a>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-10 h-10 bg-vesuviano-50 rounded-lg flex items-center justify-center">
                        <MapPin className="text-vesuviano-600" size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('consultation.contact.location')}</p>
                        <p className="font-medium text-foreground">Napoli, Italia</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-stone-200/60 bg-vesuviano-50/50">
                <CardContent className="p-5 md:p-6">
                  <div className="flex items-start gap-3">
                    <Download className="text-vesuviano-600 mt-0.5 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1 text-sm">{t('consultation.download.title')}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{t('consultation.download.description')}</p>
                      <a
                        href="/lovable-uploads/vesuviobuono-scheda-tecnica.pdf"
                        download
                        className="inline-flex items-center gap-1.5 text-vesuviano-600 hover:text-vesuviano-700 text-sm font-medium transition-colors"
                      >
                        <Download size={14} />
                        {t('consultation.download.button')}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultationForm;
