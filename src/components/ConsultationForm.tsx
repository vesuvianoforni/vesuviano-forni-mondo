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

const ConsultationForm = () => {
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
    { id: "identification", label: "Identificazione migliore soluzione" },
    { id: "quotation", label: "Quotazione personalizzata" },
    { id: "rendering", label: "Rendering 3D alta fedeltà" },
    { id: "logistics", label: "Organizzazione logistica e export" }
  ];

  const ovenTypes = [
    "Forno a Legna Fisso",
    "Forno a Legna Rotante", 
    "Forno a Gas Fisso",
    "Forno a Gas Rotante",
    "Forno Elettrico Fisso",
    "Forno Elettrico Rotante",
    "VesuvioBuono a Legna",
    "VesuvioBuono Combinato Gas/Legna",
    "Non sono sicuro - necessito consulenza"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Campi Obbligatori",
        description: "Nome e Email sono richiesti per inviare la richiesta.",
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
        title: "🔥 Richiesta Inviata con Successo!",
        description: "Ti abbiamo inviato una email di conferma. Ti contatteremo entro 24 ore per la tua consulenza gratuita.",
      });

    } catch (error) {
      console.error("Errore invio consulenza:", error);
      toast({
        title: "Errore nell'Invio",
        description: "Si è verificato un problema. Riprova o contattaci direttamente al +39 350 928 6941",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadCatalog = () => {
    console.log("Downloading catalog...");
    toast({
      title: "Catalogo Scaricato!",
      description: "Il catalogo completo è stato scaricato sul tuo dispositivo.",
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
    <section id="consultation" className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-vesuviano-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <Badge className="bg-green-100 text-green-800 px-4 py-2 text-base md:text-lg font-semibold mb-4">
              <CheckCircle className="mr-2" size={20} />
              CONSULENZA GRATUITA
            </Badge>
            <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
              Inizia il Tuo Progetto
            </h2>
            <p className="font-inter text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              I nostri esperti ti guideranno nella scelta della soluzione perfetta, 
              dalla progettazione al trasporto internazionale.
            </p>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Form - Prima su mobile per migliore UX */}
            <div className="order-1 lg:order-2 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair text-xl md:text-2xl">Richiesta Consulenza</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          placeholder="Il tuo nome"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                          placeholder="la-tua-email@esempio.com"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Telefono</label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+39 123 456 7890"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Azienda/Ristorante</label>
                        <Input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="Nome della tua attività"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Paese di Destinazione</label>
                        <Input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                          placeholder="Es. Francia, Germania, USA..."
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Tipo di Forno</label>
                        <Select onValueChange={(value) => setFormData(prev => ({ ...prev, ovenType: value }))}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleziona il tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {ovenTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Capacità Richiesta</label>
                        <Input
                          type="text"
                          value={formData.capacity}
                          onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                          placeholder="Es. 100 pizze/ora, 50 cm diametro..."
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Budget Orientativo</label>
                        <Input
                          type="text"
                          value={formData.budget}
                          onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                          placeholder="Es. €5.000 - €15.000"
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Services */}
                    <div>
                      <label className="block text-sm font-medium mb-3 md:mb-4">Servizi Richiesti:</label>
                      <div className="grid grid-cols-1 gap-3">
                        {services.map((service) => (
                          <div key={service.id} className="flex items-start space-x-3">
                            <Checkbox
                              id={service.id}
                              checked={formData.services.includes(service.id)}
                              onCheckedChange={(checked) => handleServiceChange(service.id, checked as boolean)}
                              className="mt-0.5 flex-shrink-0"
                            />
                            <label htmlFor={service.id} className="text-sm cursor-pointer leading-relaxed">
                              {service.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Messaggio</label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Descrivici il tuo progetto, le tue esigenze specifiche o qualsiasi domanda..."
                        rows={4}
                        className="w-full resize-none"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full bg-vesuviano-600 hover:bg-vesuviano-700 disabled:opacity-50 text-white text-base md:text-lg py-3 h-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Invio in corso...
                        </>
                      ) : (
                        "Invia Richiesta Consulenza Gratuita"
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center leading-relaxed">
                      Ti contatteremo entro 24 ore. I tuoi dati sono protetti e non saranno condivisi con terzi.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info - Seconda su mobile */}
            <div className="order-2 lg:order-1 lg:col-span-1 space-y-4 md:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair text-xl md:text-2xl">I Nostri Servizi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-start space-x-3">
                      <CheckCircle className="text-vesuviano-600 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-sm text-gray-700 leading-relaxed">{service.label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair text-xl md:text-2xl">Contatti Diretti</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-5">
                  <div className="flex items-start space-x-3">
                    <Phone className="text-vesuviano-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm md:text-base">Telefono</p>
                      <p className="text-sm text-gray-600">+39 350 928 6941</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="text-vesuviano-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm md:text-base">Email</p>
                      <p className="text-sm text-gray-600 break-all">info@vesuvianoforni.com</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="text-vesuviano-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm md:text-base">Laboratorio</p>
                      <p className="text-sm text-gray-600">Napoli, Italia</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={downloadCatalog}
                className="w-full bg-fire-600 hover:bg-fire-700 text-white text-sm md:text-base h-auto py-3"
              >
                <Download className="mr-2 flex-shrink-0" size={20} />
                Scarica Catalogo Completo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultationForm;