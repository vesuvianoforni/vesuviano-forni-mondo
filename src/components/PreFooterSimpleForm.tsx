import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Minimal pre-footer consultation form.
 * - No contact info / no datasheet block (those live on the contact page).
 * - Name + Email + Phone + Message + CTA. That's it.
 */
const PreFooterSimpleForm = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    ovenType: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast({
        title: t("consultation.messages.requiredFields"),
        description: t("consultation.messages.fillRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-consultation-email", {
        body: formData,
      });
      if (error) throw error;

      toast({
        title: t("consultation.messages.success"),
        description: t("consultation.messages.successDescription"),
      });
      setFormData({ name: "", email: "", phone: "", country: "", ovenType: "", message: "" });
    } catch (err) {
      console.error("Errore invio consulenza:", err);
      toast({
        title: t("consultation.messages.error"),
        description: t("consultation.messages.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="consultation"
      className="py-14 md:py-20 bg-gradient-to-br from-stone-50 to-vesuviano-50/30"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-3">
              {t("consultation.header.title")}
            </h2>
            <p className="font-inter text-sm md:text-base text-muted-foreground">
              {t("consultation.header.subtitle")}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-lg border border-stone-200/60 p-5 md:p-7 space-y-4"
          >
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              required
              placeholder={t("consultation.form.fullNamePlaceholder")}
              className="h-11"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                required
                placeholder={t("consultation.form.emailPlaceholder")}
                className="h-11"
              />
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                placeholder={t("consultation.form.phonePlaceholder")}
                className="h-11"
              />
            </div>

            <Textarea
              value={formData.message}
              onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
              placeholder={t("consultation.form.messagePlaceholder")}
              rows={3}
              className="resize-none"
            />

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full bg-vesuviano-600 hover:bg-vesuviano-700 text-white text-base py-3.5 h-auto shadow-md hover:shadow-lg transition-all duration-300"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("consultation.form.submitting")}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  {t("cta.getQuote")}
                </span>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              {t("consultation.messages.privacy")}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default PreFooterSimpleForm;
