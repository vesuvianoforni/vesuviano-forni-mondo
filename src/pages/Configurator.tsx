import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Flame, Clock, Euro, MapPin } from 'lucide-react';

interface ConfiguratorOven {
  id: string;
  name: string;
  category: string;
  image_url: string;
  base_price: number;
  delivery_time_weeks: number;
  diameters: any;
  description: string | null;
}

interface ConfiguratorOption {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string | null;
}

const Configurator = () => {
  const [ovens, setOvens] = useState<ConfiguratorOven[]>([]);
  const [options, setOptions] = useState<ConfiguratorOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOven, setSelectedOven] = useState<string>('');
  const [selectedDiameter, setSelectedDiameter] = useState<string>('');
  const [hasInstallation, setHasInstallation] = useState(false);
  const [hasGas, setHasGas] = useState(false);
  
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [savingQuote, setSavingQuote] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ovensResult, optionsResult] = await Promise.all([
        supabase.from('configurator_ovens').select('*').eq('is_active', true),
        supabase.from('configurator_options').select('*').eq('is_active', true)
      ]);

      if (ovensResult.error) throw ovensResult.error;
      if (optionsResult.error) throw optionsResult.error;

      setOvens(ovensResult.data || []);
      setOptions(optionsResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const selectedOvenData = ovens.find(o => o.id === selectedOven);
  const installationOption = options.find(o => o.type === 'installation');
  const gasOption = options.find(o => o.type === 'gas');

  const calculateTotal = () => {
    if (!selectedOvenData) return 0;
    let total = selectedOvenData.base_price;
    if (hasInstallation && installationOption) total += installationOption.price;
    if (hasGas && gasOption) total += gasOption.price;
    return total;
  };

  const handleSaveQuote = async () => {
    if (!selectedOven || !selectedDiameter) {
      toast.error('Seleziona un forno e un diametro');
      return;
    }

    setSavingQuote(true);
    try {
      const { error } = await supabase.from('configurator_quotes').insert({
        oven_id: selectedOven,
        diameter: selectedDiameter,
        has_installation: hasInstallation,
        has_gas: hasGas,
        total_price: calculateTotal(),
        delivery_time_weeks: selectedOvenData?.delivery_time_weeks || 0,
        customer_name: customerName || null,
        customer_email: customerEmail || null,
        customer_phone: customerPhone || null,
        notes: notes || null
      });

      if (error) throw error;

      toast.success('Preventivo salvato con successo!');
      setShowQuoteModal(false);
      
      // Reset form
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setNotes('');
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Errore nel salvataggio del preventivo');
    } finally {
      setSavingQuote(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-stone-900 mb-4">Configuratore Forni</h1>
          <p className="text-stone-600">Configura il tuo forno ideale e ricevi subito il preventivo</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Seleziona il Forno</CardTitle>
            <CardDescription>Scegli il modello che preferisci</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="oven">Modello Forno</Label>
              <Select value={selectedOven} onValueChange={setSelectedOven}>
                <SelectTrigger id="oven" className="mt-2">
                  <SelectValue placeholder="Seleziona un forno" />
                </SelectTrigger>
                <SelectContent>
                  {ovens.map((oven) => (
                    <SelectItem key={oven.id} value={oven.id}>
                      {oven.name} - {oven.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedOvenData && (
              <>
                <div className="border rounded-lg p-4 bg-white">
                  <img 
                    src={selectedOvenData.image_url} 
                    alt={selectedOvenData.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  {selectedOvenData.description && (
                    <p className="text-sm text-stone-600">{selectedOvenData.description}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="diameter">Diametro</Label>
                  <Select value={selectedDiameter} onValueChange={setSelectedDiameter}>
                    <SelectTrigger id="diameter" className="mt-2">
                      <SelectValue placeholder="Seleziona il diametro" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedOvenData.diameters.map((diameter) => (
                        <SelectItem key={diameter} value={diameter}>
                          {diameter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {selectedOven && selectedDiameter && (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Opzioni Aggiuntive</CardTitle>
                <CardDescription>Personalizza il tuo forno</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {installationOption && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Checkbox 
                        id="installation" 
                        checked={hasInstallation}
                        onCheckedChange={(checked) => setHasInstallation(checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="installation" className="cursor-pointer font-medium">
                          <MapPin className="inline w-4 h-4 mr-2" />
                          {installationOption.name}
                        </Label>
                        {installationOption.description && (
                          <p className="text-sm text-stone-500">{installationOption.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-bold">+€{installationOption.price}</span>
                  </div>
                )}

                {gasOption && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Checkbox 
                        id="gas" 
                        checked={hasGas}
                        onCheckedChange={(checked) => setHasGas(checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="gas" className="cursor-pointer font-medium">
                          <Flame className="inline w-4 h-4 mr-2" />
                          {gasOption.name}
                        </Label>
                        {gasOption.description && (
                          <p className="text-sm text-stone-500">{gasOption.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-bold">+€{gasOption.price}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Riepilogo Preventivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span>Prezzo Base:</span>
                  <span className="font-bold">€{selectedOvenData?.base_price}</span>
                </div>
                {hasInstallation && installationOption && (
                  <div className="flex justify-between">
                    <span>{installationOption.name}:</span>
                    <span className="font-bold">+€{installationOption.price}</span>
                  </div>
                )}
                {hasGas && gasOption && (
                  <div className="flex justify-between">
                    <span>{gasOption.name}:</span>
                    <span className="font-bold">+€{gasOption.price}</span>
                  </div>
                )}
                <div className="border-t pt-4 flex justify-between text-2xl font-bold text-primary">
                  <span className="flex items-center gap-2">
                    <Euro className="w-6 h-6" />
                    Totale:
                  </span>
                  <span>€{calculateTotal()}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-600 pt-2">
                  <Clock className="w-5 h-5" />
                  <span>Tempi di consegna: {selectedOvenData?.delivery_time_weeks} settimane</span>
                </div>
                
                <Button 
                  onClick={() => setShowQuoteModal(true)}
                  className="w-full mt-6"
                  size="lg"
                >
                  Richiedi Preventivo
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Richiedi Preventivo</DialogTitle>
            <DialogDescription>
              Lasciaci i tuoi dati per ricevere il preventivo dettagliato
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome e Cognome</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Mario Rossi"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="mario@esempio.it"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+39 123 456 7890"
              />
            </div>
            <div>
              <Label htmlFor="notes">Note (opzionale)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Eventuali richieste o domande..."
                rows={3}
              />
            </div>
            <Button 
              onClick={handleSaveQuote} 
              className="w-full"
              disabled={savingQuote}
            >
              {savingQuote ? 'Invio in corso...' : 'Invia Richiesta'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Configurator;