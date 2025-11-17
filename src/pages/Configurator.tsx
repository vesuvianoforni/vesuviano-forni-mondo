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
import { Flame, Clock, Euro, Pizza } from 'lucide-react';

interface ConfiguratorOven {
  id: string;
  model_name: string;
  fuel_type: string;
  diameter: number;
  pizza_capacity: string;
  image_url: string;
  base_price: number;
  delivery_time_weeks: number;
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
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedFuelType, setSelectedFuelType] = useState<string>('');
  const [selectedDiameter, setSelectedDiameter] = useState<string>('');
  const [hasInstallation, setHasInstallation] = useState(false);
  const [hasGasConversion, setHasGasConversion] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [savingQuote, setSavingQuote] = useState(false);

  useEffect(() => { fetchData(); }, []);

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
      toast.error('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  };

  const models = Array.from(new Set(ovens.map(o => o.model_name)));
  const availableFuelTypes = selectedModel ? Array.from(new Set(ovens.filter(o => o.model_name === selectedModel).map(o => o.fuel_type))) : [];
  const availableDiameters = (selectedModel && selectedFuelType) ? ovens.filter(o => o.model_name === selectedModel && o.fuel_type === selectedFuelType) : [];
  const selectedOven = ovens.find(o => o.model_name === selectedModel && o.fuel_type === selectedFuelType && o.diameter === parseInt(selectedDiameter));
  const installationOption = options.find(o => o.type === 'installation');
  const gasConversionOption = options.find(o => o.type === 'gas_conversion');

  const calculateTotal = () => {
    if (!selectedOven) return 0;
    let total = selectedOven.base_price;
    if (hasInstallation && installationOption) total += installationOption.price;
    if (hasGasConversion && gasConversionOption) total += gasConversionOption.price;
    return total;
  };

  const handleSaveQuote = async () => {
    if (!selectedOven) { toast.error('Completa la configurazione'); return; }
    setSavingQuote(true);
    try {
      const { error } = await supabase.from('configurator_quotes').insert({
        oven_id: selectedOven.id, has_installation: hasInstallation, has_gas: hasGasConversion,
        total_price: calculateTotal(), delivery_time_weeks: selectedOven.delivery_time_weeks,
        customer_name: customerName || null, customer_email: customerEmail || null,
        customer_phone: customerPhone || null, notes: notes || null
      });
      if (error) throw error;
      toast.success('Preventivo salvato!');
      setShowQuoteModal(false);
      setSelectedModel(''); setSelectedFuelType(''); setSelectedDiameter('');
      setHasInstallation(false); setHasGasConversion(false);
      setCustomerName(''); setCustomerEmail(''); setCustomerPhone(''); setNotes('');
    } catch (error) {
      toast.error('Errore nel salvare');
    } finally {
      setSavingQuote(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Configuratore Forni</h1>
          <p className="text-muted-foreground">Configura il tuo forno perfetto</p>
        </div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Scegli il tuo forno</CardTitle>
            <CardDescription>Seleziona modello, configurazione e dimensione</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Modello</Label>
              <Select value={selectedModel} onValueChange={(v) => { setSelectedModel(v); setSelectedFuelType(''); setSelectedDiameter(''); }}>
                <SelectTrigger><SelectValue placeholder="Seleziona modello" /></SelectTrigger>
                <SelectContent>{models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {selectedModel && (
              <div className="space-y-2">
                <Label>Alimentazione</Label>
                <Select value={selectedFuelType} onValueChange={(v) => { setSelectedFuelType(v); setSelectedDiameter(''); }}>
                  <SelectTrigger><SelectValue placeholder="Seleziona alimentazione" /></SelectTrigger>
                  <SelectContent>{availableFuelTypes.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            {selectedFuelType && (
              <div className="space-y-2">
                <Label>Dimensione</Label>
                <Select value={selectedDiameter} onValueChange={setSelectedDiameter}>
                  <SelectTrigger><SelectValue placeholder="Seleziona dimensione" /></SelectTrigger>
                  <SelectContent>{availableDiameters.map(o => <SelectItem key={o.id} value={o.diameter.toString()}>{o.diameter}cm - {o.pizza_capacity}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            {selectedOven && (
              <>
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Opzioni Aggiuntive</h3>
                  {installationOption && (
                    <div className="flex items-start space-x-3 mb-4">
                      <Checkbox id="installation" checked={hasInstallation} onCheckedChange={(c) => setHasInstallation(c as boolean)} />
                      <div><Label htmlFor="installation" className="cursor-pointer">{installationOption.name} (+€{installationOption.price.toFixed(2)})</Label></div>
                    </div>
                  )}
                  {gasConversionOption && selectedFuelType === 'Legna' && (
                    <div className="flex items-start space-x-3">
                      <Checkbox id="gas" checked={hasGasConversion} onCheckedChange={(c) => setHasGasConversion(c as boolean)} />
                      <div><Label htmlFor="gas" className="cursor-pointer">{gasConversionOption.name} (+€{gasConversionOption.price.toFixed(2)})</Label></div>
                    </div>
                  )}
                </div>
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Riepilogo</h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2"><Flame className="w-4 h-4" /><span>{selectedOven.model_name} - {selectedOven.fuel_type}</span></div>
                    <div className="flex items-center gap-2"><Pizza className="w-4 h-4" /><span>{selectedOven.diameter}cm - {selectedOven.pizza_capacity}</span></div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>Consegna: {selectedOven.delivery_time_weeks} settimane</span></div>
                    <div className="flex items-center gap-2 pt-3 border-t"><Euro className="w-5 h-5" /><span className="text-2xl font-bold">€{calculateTotal().toFixed(2)}</span></div>
                  </div>
                </div>
                <Button onClick={() => setShowQuoteModal(true)} className="w-full" size="lg">Richiedi Preventivo</Button>
              </>
            )}
          </CardContent>
        </Card>
        <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Richiedi Preventivo</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome</Label><Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></div>
              <div><Label>Email</Label><Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} /></div>
              <div><Label>Telefono</Label><Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} /></div>
              <div><Label>Note</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} /></div>
              <Button onClick={handleSaveQuote} className="w-full" disabled={savingQuote}>{savingQuote ? 'Invio...' : 'Invia Richiesta'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Configurator;