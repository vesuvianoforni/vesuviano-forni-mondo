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
import { Flame, Clock, Euro, Pizza, Video } from 'lucide-react';
import Video360Modal from '@/components/Video360Modal';

interface ConfiguratorOven {
  id: string;
  model_name: string;
  fuel_type: string;
  diameter: number;
  pizza_capacity: string;
  image_url: string;
  video_url_360?: string;
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
  const [showVideo360, setShowVideo360] = useState(false);

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
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Configuratore Forni</h1>
          <p className="text-muted-foreground">Configura il tuo forno perfetto</p>
        </div>
        
        {/* Step 1: Model Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Scegli il Modello</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {models.map(model => (
              <Card 
                key={model} 
                className={`cursor-pointer transition-all hover:shadow-lg ${selectedModel === model ? 'ring-2 ring-primary' : ''}`}
                onClick={() => { setSelectedModel(model); setSelectedFuelType(''); setSelectedDiameter(''); }}
              >
                <CardContent className="p-4">
                  <div className="aspect-square mb-3 bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={ovens.find(o => o.model_name === model)?.image_url || '/placeholder.svg'} 
                      alt={model}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-center">{model}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Step 2: Fuel Type Selection */}
        {selectedModel && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Scegli l'Alimentazione</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableFuelTypes.map(fuel => (
                <Card 
                  key={fuel}
                  className={`cursor-pointer transition-all hover:shadow-lg ${selectedFuelType === fuel ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => { setSelectedFuelType(fuel); setSelectedDiameter(''); }}
                >
                  <CardContent className="p-6 text-center">
                    <Flame className="w-8 h-8 mx-auto mb-2" />
                    <h3 className="font-semibold">{fuel}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Diameter Selection */}
        {selectedFuelType && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Scegli la Dimensione</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableDiameters.map(oven => (
                <Card 
                  key={oven.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${selectedDiameter === oven.diameter.toString() ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedDiameter(oven.diameter.toString())}
                >
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Pizza className="w-8 h-8 mx-auto mb-2" />
                      <h3 className="font-semibold text-lg">{oven.diameter}cm</h3>
                      <p className="text-sm text-muted-foreground">{oven.pizza_capacity}</p>
                      <p className="text-lg font-bold mt-2">€{oven.base_price.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        {/* Step 4: Additional Options & Summary */}
        {selectedOven && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>4. Opzioni Aggiuntive e Riepilogo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Opzioni Aggiuntive</h3>
                <div className="space-y-3">
                  {installationOption && (
                    <div className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox id="installation" checked={hasInstallation} onCheckedChange={(c) => setHasInstallation(c as boolean)} />
                      <div className="flex-1">
                        <Label htmlFor="installation" className="cursor-pointer font-medium">{installationOption.name}</Label>
                        <p className="text-sm text-muted-foreground">{installationOption.description}</p>
                        <p className="text-sm font-semibold mt-1">+€{installationOption.price.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                  {gasConversionOption && selectedFuelType === 'Legna' && (
                    <div className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox id="gas" checked={hasGasConversion} onCheckedChange={(c) => setHasGasConversion(c as boolean)} />
                      <div className="flex-1">
                        <Label htmlFor="gas" className="cursor-pointer font-medium">{gasConversionOption.name}</Label>
                        <p className="text-sm text-muted-foreground">{gasConversionOption.description}</p>
                        <p className="text-sm font-semibold mt-1">+€{gasConversionOption.price.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4 text-xl">Riepilogo Configurazione</h3>
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-24 bg-background rounded-lg overflow-hidden">
                      <img src={selectedOven.image_url} alt={selectedOven.model_name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{selectedOven.model_name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Flame className="w-4 h-4" /><span>{selectedOven.fuel_type}</span></div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Pizza className="w-4 h-4" /><span>{selectedOven.diameter}cm - {selectedOven.pizza_capacity}</span></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t"><Clock className="w-5 h-5" /><span>Consegna: {selectedOven.delivery_time_weeks} settimane</span></div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-lg font-semibold">Totale:</span>
                    <span className="text-3xl font-bold text-primary">€{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setShowQuoteModal(true)} className="flex-1" size="lg">Richiedi Preventivo</Button>
                {selectedOven.video_url_360 && (
                  <Button onClick={() => setShowVideo360(true)} variant="outline" size="lg" className="flex-1">
                    <Video className="w-5 h-5 mr-2" />
                    Video 360°
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
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
        {selectedOven && (
          <Video360Modal
            open={showVideo360}
            onClose={() => setShowVideo360(false)}
            videoUrl={selectedOven.video_url_360}
            title={`${selectedOven.model_name} ${selectedOven.fuel_type}`}
          />
        )}
      </div>
    </div>
  );
};

export default Configurator;