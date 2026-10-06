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
import { redirectToThankYou } from "@/lib/thankYou";
import { getAttribution } from "@/lib/attribution";

const ConsultationForm = ({ embedded = false }: { embedded?: boolean }) => {
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
        body: { ...formData, ...getAttribution() }
      });

      if (error) throw error;

      // Success: redirect to the localized thank-you page (GTM conversion trigger).
      redirectToThankYou(i18n.language);
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

  const formCard = (
    <Card className="shadow-lg border-stone-200/60">
      <CardContent className="p-4 sm:p-5 md:p-8">
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
                    <a href="tel:+393509286941" className="flex items-center gap-3 text-muted-foreground hover:text-vesuviano-600 transition-colors group">
                      <div className="w-10 h-10 bg-vesuviano-50 rounded-lg flex items-center justify-center group-hover:bg-vesuviano-100 transition-colors">
                        <Phone className="text-vesuviano-600" size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('consultation.contact.phone')}</p>
                        <p className="font-medium text-foreground">+39 350 928 6941</p>
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

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultationForm;
