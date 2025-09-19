import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, User, Mail, MapPin, Phone, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";


interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  ovenModel: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  city: string;
  email: string;
  phone: string;
  company?: string;
  website?: string;
}

const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  ovenModel
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    city: '',
    email: '',
    phone: '',
    company: '',
    website: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return formData.firstName.trim() !== '' && 
           formData.lastName.trim() !== '' && 
           formData.email.trim() !== '' && 
           formData.city.trim() !== '';
  };

  const handleDownload = async () => {
    if (!isFormValid()) {
      toast({
        title: "Campi mancanti",
        description: "Compila tutti i campi obbligatori per procedere al download.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Send form data to our notification system
      await supabase.functions.invoke('send-form-data', {
        body: {
          formType: 'download-modal',
          data: formData
        }
      });

      // Procedi con il download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `forno-${ovenModel.replace(/\s+/g, '-')}-${formData.firstName}-${formData.lastName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      onClose();
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        city: '',
        email: '',
        phone: '',
        company: '',
        website: ''
      });

      toast({
        title: "Download completato!",
        description: "L'immagine è stata scaricata con successo.",
      });

    } catch (error) {
      console.error("Errore durante il download:", error);
      toast({
        title: "Errore download",
        description: "Si è verificato un errore durante il download. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden !translate-y-0 !top-4 !bottom-4 !left-[50%] !translate-x-[-50%] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Download className="w-6 h-6 text-vesuviano-600" />
            <span>Scarica la Tua Immagine</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="grid md:grid-cols-2 gap-6 pb-4">
            {/* Preview Image */}
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={imageUrl} 
                  alt="Anteprima forno generato"
                  className="w-full rounded-lg shadow-lg"
                />
                <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  Anteprima
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Il tuo <span className="font-medium text-vesuviano-600">{ovenModel}</span> 
                  <br />nel tuo spazio personalizzato
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  I tuoi dati per il download
                </h3>
                <p className="text-sm text-gray-600">
                  Inserisci i tuoi dati per ricevere l'immagine ad alta risoluzione
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName" className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Nome</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Il tuo nome"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Cognome</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Il tuo cognome"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="la-tua-email@esempio.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="city" className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>Città</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="La tua città"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span>Telefono</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+39 123 456 7890"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="company" className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Azienda (opzionale)</span>
                </Label>
                <Input
                  id="company"
                  value={formData.company || ''}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Nome azienda"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="website" className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>Sito Web (opzionale)</span>
                </Label>
                <Input
                  id="website"
                  value={formData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="www.esempio.com"
                  className="mt-1"
                />
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  onClick={handleDownload}
                  disabled={!isFormValid() || isSubmitting}
                  className="w-full bg-gradient-to-r from-vesuviano-500 to-vesuviano-600 hover:from-vesuviano-600 hover:to-vesuviano-700 text-white font-medium py-3"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Download...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Download className="w-5 h-5" />
                      <span>Scarica Immagine HD</span>
                    </div>
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Riceverai anche informazioni sui nostri forni Vesuviano
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadModal;