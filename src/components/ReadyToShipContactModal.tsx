import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReadyToShipContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productCode: string;
  productDiameter: string;
  productCoating: string;
}

const ReadyToShipContactModal = ({ 
  isOpen, 
  onClose, 
  productName,
  productCode, 
  productDiameter, 
  productCoating 
}: ReadyToShipContactModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = () => {
    return formData.firstName.trim() !== '' &&
           formData.lastName.trim() !== '' &&
           formData.email.trim() !== '' &&
           formData.phone.trim() !== '' &&
           formData.city.trim() !== '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: t('readyToShip.modal.requiredFields'),
        description: t('readyToShip.modal.fillAllFields'),
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
        ovenType: `${productName} - ${productCode} (${productDiameter} - ${productCoating})`,
        message: `Richiesta informazioni per forno pronta consegna: ${productName} (Codice: ${productCode}). Diametro: ${productDiameter}, Rivestimento: ${productCoating}`
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
      console.error("Errore invio richiesta:", error);
      toast({
        title: t('readyToShip.modal.error'),
        description: t('readyToShip.modal.errorMessage'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl text-charcoal-900">
            {t('readyToShip.modal.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="bg-vesuviano-50 border border-vesuviano-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-vesuviano-900 mb-1">{t('readyToShip.modal.selectedOven')}:</p>
          <p className="text-sm text-vesuviano-800">{productName}</p>
          <div className="mt-2">
            <span className="inline-block bg-vesuviano-200 text-vesuviano-900 text-xs font-bold px-2 py-1 rounded">
              {t('readyToShip.productCode')}: {productCode}
            </span>
          </div>
          <p className="text-xs text-vesuviano-700 mt-2">
            {t('readyToShip.diameter')}: {productDiameter} • {t('readyToShip.coating')}: {productCoating}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('readyToShip.modal.firstName')} *</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                placeholder="Mario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('readyToShip.modal.lastName')} *</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                placeholder="Rossi"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('readyToShip.modal.email')} *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="mario.rossi@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('readyToShip.modal.phone')} *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="+39 333 1234567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">{t('readyToShip.modal.city')} *</Label>
            <Input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleInputChange}
              required
              placeholder="Napoli"
            />
          </div>

          <Button 
            type="submit" 
            size="lg"
            disabled={!isFormValid() || isSubmitting}
            className="w-full bg-vesuviano-600 hover:bg-vesuviano-700 disabled:opacity-50 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('readyToShip.modal.sending')}
              </>
            ) : (
              t('readyToShip.modal.submit')
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReadyToShipContactModal;
