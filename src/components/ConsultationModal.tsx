import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConsultationModal = ({ isOpen, onClose }: ConsultationModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.city) {
      toast({
        title: t('consultationModal.messages.requiredFields'),
        description: t('consultationModal.messages.fillRequired'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const fullFormData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        country: formData.city,
        ovenType: t('consultationModal.form.needHelp'),
        message: t('consultationModal.messages.autoMessage')
      };

      const { data, error } = await supabase.functions.invoke('send-consultation-email', {
        body: fullFormData
      });

      if (error) throw error;

      const currentLang = i18n.language || 'it';
      const thankYouRoutes: Record<string, string> = {
        'it': '/it/thank-you-it',
        'en': '/en/thank-you-en',
        'fr': '/fr/thank-you-fr',
        'es': '/es/thank-you-es',
        'de': '/de/thank-you-de'
      };
      
      navigate(thankYouRoutes[currentLang] || '/it/thank-you-it');
    } catch (error) {
      console.error("Errore invio consulenza:", error);
      toast({
        title: t('consultationModal.messages.error'),
        description: t('consultationModal.messages.errorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl text-center">
            {t('consultationModal.title')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t('consultationModal.form.firstName')}
              </label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
                placeholder={t('consultationModal.form.firstNamePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t('consultationModal.form.lastName')}
              </label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
                placeholder={t('consultationModal.form.lastNamePlaceholder')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t('consultationModal.form.email')}
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              placeholder={t('consultationModal.form.emailPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t('consultationModal.form.phone')}
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
              placeholder={t('consultationModal.form.phonePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t('consultationModal.form.city')}
            </label>
            <Input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              required
              placeholder={t('consultationModal.form.cityPlaceholder')}
            />
          </div>

          <Button 
            type="submit" 
            size="lg"
            disabled={isSubmitting}
            className="w-full bg-vesuviano-600 hover:bg-vesuviano-700 disabled:opacity-50 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('consultationModal.form.submitting')}
              </>
            ) : (
              t('consultationModal.form.submit')
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationModal;
