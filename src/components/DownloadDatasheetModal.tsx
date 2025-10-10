import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DownloadDatasheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  ovenType: string;
  datasheetUrl?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
}

const DownloadDatasheetModal = ({ isOpen, onClose, ovenType, datasheetUrl }: DownloadDatasheetModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: ''
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

  const handleDownload = async () => {
    if (!isFormValid()) {
      toast({
        title: t('downloadDatasheet.error'),
        description: t('downloadDatasheet.fillAllFields'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Send data to Supabase edge function
      const { error } = await supabase.functions.invoke('send-form-data', {
        body: {
          formType: 'datasheet-download',
          data: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
            ovenType: ovenType
          }
        }
      });

      if (error) throw error;

      // Push GTM event (wait 300ms before closing)
      (window.parent as any).dataLayer = (window.parent as any).dataLayer || [];
      (window.parent as any).dataLayer.push({
        event: 'lead_submit_success',
        formType: 'datasheet_download',
      });

      setTimeout(() => {
        toast({
          title: t('downloadDatasheet.success'),
          description: t('downloadDatasheet.successMessage'),
        });

        // Reset form and close modal
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          city: '',
        });
        onClose();
      }, 300);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: t('downloadDatasheet.error'),
        description: t('downloadDatasheet.errorMessage'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair text-charcoal-900 pr-8">
            {t('downloadDatasheet.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <p className="text-sm text-stone-600">
            {t('downloadDatasheet.subtitle')}
          </p>
          
          <div className="bg-vesuviano-50 border border-vesuviano-200 rounded-lg p-4">
            <p className="text-sm text-vesuviano-800 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t('downloadDatasheet.emailNotice')}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('downloadDatasheet.firstName')} *</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder={t('downloadDatasheet.firstNamePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">{t('downloadDatasheet.lastName')} *</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder={t('downloadDatasheet.lastNamePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('downloadDatasheet.email')} *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('downloadDatasheet.emailPlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('downloadDatasheet.phone')} *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder={t('downloadDatasheet.phonePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">{t('downloadDatasheet.city')} *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder={t('downloadDatasheet.cityPlaceholder')}
                required
              />
            </div>
          </div>

          <Button
            onClick={handleDownload}
            disabled={!isFormValid() || isSubmitting}
            className="w-full bg-vesuviano-500 hover:bg-vesuviano-600 text-white"
          >
            {isSubmitting ? t('downloadDatasheet.downloading') : t('downloadDatasheet.download')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadDatasheetModal;
