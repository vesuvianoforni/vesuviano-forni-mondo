
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
    <section id="consultation" className="py-20 bg-gradient-to-br from-gray-50 to-vesuviano-50">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-800 px-4 py-2 text-lg font-semibold mb-4">
              <CheckCircle className="mr-2" size={20} />
              CONSULENZA GRATUITA
            </Badge>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Inizia il Tuo Progetto
            </h2>
            <p className="font-inter text-xl text-gray-600 max-w-3xl mx-auto">
              I nostri esperti ti guideranno nella scelta della soluzione perfetta, 
              dalla progettazione al trasporto internazionale.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="font-playfair text-2xl">I Nostri Servizi</CardTitle>
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
                  <CardTitle className="font-playfair text-2xl">Contatti Diretti</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="text-vesuviano-600" size={20} />
                    <div>
                      <p className="font-semibold">Telefono</p>
                      <p className="text-sm text-gray-600">+39 350 928 6941</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="text-vesuviano-600" size={20} />
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-sm text-gray-600">info@vesuvianoforni.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="text-vesuviano-600" size={20} />
                    <div>
                      <p className="font-semibold">Laboratorio</p>
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
                Scarica Catalogo Completo
              </Button>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair text-2xl">Richiesta Consulenza</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          placeholder="Il tuo nome"
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
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Telefono</label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+39 123 456 7890"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Azienda/Ristorante</label>
                        <Input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="Nome della tua attività"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Paese di Destinazione</label>
                        <Input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                          placeholder="Es. Francia, Germania, USA..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Tipo di Forno</label>
                        <Select onValueChange={(value) => setFormData(prev => ({ ...prev, ovenType: value }))}>
                          <SelectTrigger>
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

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Capacità Richiesta</label>
                        <Input
                          type="text"
                          value={formData.capacity}
                          onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                          placeholder="Es. 100 pizze/ora, 50 cm diametro..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Budget Orientativo</label>
                        <Input
                          type="text"
                          value={formData.budget}
                          onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                          placeholder="Es. €5.000 - €15.000"
                        />
                      </div>
                    </div>

                    {/* Services */}
                    <div>
                      <label className="block text-sm font-medium mb-4">Servizi Richiesti:</label>
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
                      <label className="block text-sm font-medium mb-2">Messaggio</label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Descrivici il tuo progetto, le tue esigenze specifiche o qualsiasi domanda..."
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
                          Invio in corso...
                        </>
                      ) : (
                        "Invia Richiesta Consulenza Gratuita"
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      Ti contatteremo entro 24 ore. I tuoi dati sono protetti e non saranno condivisi con terzi.
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
