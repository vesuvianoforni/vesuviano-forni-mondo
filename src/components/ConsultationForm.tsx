
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, Mail, MapPin, Download, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';

const ConsultationForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    ovenType: "",
    capacity: "",
    budget: "",
    message: "",
    services: [] as string[]
  });

  const services = [
    { id: "identification", label: t('consultationForm.services.identification') },
    { id: "quotation", label: t('consultationForm.services.quotation') },
    { id: "rendering", label: t('consultationForm.services.rendering') },
    { id: "logistics", label: t('consultationForm.services.logistics') }
  ];

  const ovenTypes = [
    t('consultationForm.ovenTypes.woodFixed'),
    t('consultationForm.ovenTypes.woodRotating'),
    t('consultationForm.ovenTypes.gasFixed'),
    t('consultationForm.ovenTypes.gasRotating'),
    t('consultationForm.ovenTypes.electricFixed'),
    t('consultationForm.ovenTypes.electricRotating'),
    t('consultationForm.ovenTypes.vesuvioBuonoWood'),
    t('consultationForm.ovenTypes.vesuvioBuonoCombined'),
    t('consultationForm.ovenTypes.needConsultation')
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: t('consultationForm.messages.requiredFields'),
        description: t('consultationForm.messages.requiredFieldsDesc'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Invio richiesta consulenza:", formData);
      
      const { data, error } = await supabase.functions.invoke('send-consultation-email', {
        body: formData
      });

      if (error) {
        throw error;
      }

      console.log("Risposta email service:", data);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        country: "",
        ovenType: "",
        capacity: "",
        budget: "",
        message: "",
        services: []
      });

      toast({
        title: t('consultationForm.messages.success'),
        description: t('consultationForm.messages.successDesc'),
      });

    } catch (error) {
      console.error("Errore invio consulenza:", error);
      toast({
        title: t('consultationForm.messages.error'),
        description: t('consultationForm.messages.errorDesc'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadCatalog = () => {
    console.log("Downloading catalog...");
    toast({
      title: t('consultationForm.messages.catalogDownloaded'),
      description: t('consultationForm.messages.catalogDesc'),
    });
  };

  const handleServiceChange = (serviceId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      services: checked 
        ? [...prev.services, serviceId]
        : prev.services.filter(s => s !== serviceId)
    }));
  };

  return (
    <section id="consultation" className="py-20 bg-gradient-to-br from-gray-50 to-vesuviano-50">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-800 px-4 py-2 text-lg font-semibold mb-4">
              <CheckCircle className="mr-2" size={20} />
              {t('consultationForm.badge')}
            </Badge>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('consultationForm.title')}
            </h2>
            <p className="font-inter text-xl text-gray-600 max-w-3xl mx-auto">
              {t('consultationForm.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="font-playfair text-2xl">{t('consultationForm.services.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-start space-x-3">
                      <CheckCircle className="text-vesuviano-600 mt-1 flex-shrink-0" size={16} />
                      <span className="text-sm text-gray-700">{service.label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="font-playfair text-2xl">{t('consultationForm.directContacts')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="text-vesuviano-600" size={20} />
                    <div>
                      <p className="font-semibold">{t('consultationForm.phone')}</p>
                      <p className="text-sm text-gray-600">+39 350 928 6941</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="text-vesuviano-600" size={20} />
                    <div>
                      <p className="font-semibold">{t('consultationForm.email')}</p>
                      <p className="text-sm text-gray-600">info@vesuvianoforni.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="text-vesuviano-600" size={20} />
                    <div>
                      <p className="font-semibold">{t('consultationForm.laboratory')}</p>
                      <p className="text-sm text-gray-600">Napoli, Italia</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={downloadCatalog}
                className="w-full bg-fire-600 hover:bg-fire-700 text-white"
              >
                <Download className="mr-2" size={20} />
                {t('consultationForm.downloadCatalog')}
              </Button>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair text-2xl">{t('consultationForm.requestTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('consultationForm.form.nameRequired')}</label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          placeholder={t('consultationForm.form.namePlaceholder')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('consultationForm.form.emailRequired')}</label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                          placeholder={t('consultationForm.form.emailPlaceholder')}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('consultationForm.form.phone')}</label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder={t('consultationForm.form.phonePlaceholder')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('consultationForm.form.company')}</label>
                        <Input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                          placeholder={t('consultationForm.form.companyPlaceholder')}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('consultationForm.form.country')}</label>
                        <Input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                          placeholder={t('consultationForm.form.countryPlaceholder')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('consultationForm.form.ovenType')}</label>
                        <Select onValueChange={(value) => setFormData(prev => ({ ...prev, ovenType: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('consultationForm.form.ovenTypePlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {ovenTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('consultationForm.form.capacity')}</label>
                        <Input
                          type="text"
                          value={formData.capacity}
                          onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                          placeholder={t('consultationForm.form.capacityPlaceholder')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('consultationForm.form.budget')}</label>
                        <Input
                          type="text"
                          value={formData.budget}
                          onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                          placeholder={t('consultationForm.form.budgetPlaceholder')}
                        />
                      </div>
                    </div>

                    {/* Services */}
                    <div>
                      <label className="block text-sm font-medium mb-4">{t('consultationForm.form.servicesRequested')}</label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {services.map((service) => (
                          <div key={service.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={service.id}
                              checked={formData.services.includes(service.id)}
                              onCheckedChange={(checked) => handleServiceChange(service.id, checked as boolean)}
                            />
                            <label htmlFor={service.id} className="text-sm cursor-pointer">
                              {service.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('consultationForm.form.message')}</label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder={t('consultationForm.form.messagePlaceholder')}
                        rows={4}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full bg-vesuviano-600 hover:bg-vesuviano-700 disabled:opacity-50 text-white text-lg py-3"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t('consultationForm.form.submitting')}
                        </>
                      ) : (
                        t('consultationForm.form.submit')
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      {t('consultationForm.form.privacy')}
                    </p>
                  </form>
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
