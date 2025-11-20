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
  fuel_type: string[];
  diameter: number;
  pizza_capacity: string;
  image_url: string;
  additional_images?: string[];
  video_url_360?: string;
  base_price_a: number;
  base_price_b?: number;
  base_price_c?: number;
  gas_price_a?: number;
  gas_price_b?: number;
  gas_price_c?: number;
  electric_price_a?: number;
  electric_price_b?: number;
  electric_price_c?: number;
  installation_price_a?: number;
  installation_price_b?: number;
  installation_price_c?: number;
  delivery_time_weeks: number;
  description: string | null;
  coatings?: Array<{type: string; name: string; image_url: string}>;
  sizes?: Array<{
    diameter: number;
    pizza_capacity: string;
    coatings: Array<{
      name: string;
      image_url: string;
      prices: {
        listA: { base: number; gas?: number; electric?: number; onSite?: number };
        listB: { base: number; gas?: number; electric?: number; onSite?: number };
        listC: { base: number; gas?: number; electric?: number; onSite?: number };
      };
    }>;
  }>;
  can_be_built_on_site?: boolean;
  passage_space_cm?: number;
}

interface ConfiguratorOption {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string | null;
}

interface ConfiguratorProps {
  sessionId?: string;
}

const Configurator = ({ sessionId }: ConfiguratorProps = {}) => {
  const [ovens, setOvens] = useState<ConfiguratorOven[]>([]);
  const [options, setOptions] = useState<ConfiguratorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [buildType, setBuildType] = useState<'on_site' | 'ready_to_use' | ''>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedFuelType, setSelectedFuelType] = useState<string>('');
  const [selectedDiameter, setSelectedDiameter] = useState<string>('');
  const [selectedCoating, setSelectedCoating] = useState<string>('');
  const [deliveryOption, setDeliveryOption] = useState<'shipping' | ''>('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [savingQuote, setSavingQuote] = useState(false);
  const [showVideo360, setShowVideo360] = useState(false);
  const [priceList, setPriceList] = useState<'A' | 'B' | 'C'>('A');
  const [customerData, setCustomerData] = useState<{
    name: string;
    email: string;
    phone: string;
  } | null>(null);
  const [showNotInterestedModal, setShowNotInterestedModal] = useState(false);
  const [feedbackReasons, setFeedbackReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState('');
  const [savingFeedback, setSavingFeedback] = useState(false);

  useEffect(() => { 
    fetchData(); 
    if (sessionId) loadSessionData();
  }, []);

  const loadSessionData = async () => {
    if (!sessionId) return;
    try {
      const { data, error } = await supabase
        .from('configurator_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      
      if (error) throw error;
      if (data) {
        setPriceList(data.price_list as 'A' | 'B' | 'C');
        const customerInfo = {
          name: data.customer_name || '',
          email: data.customer_email || '',
          phone: data.customer_phone || ''
        };
        setCustomerData(customerInfo);
        
        // Precompila anche i campi del form
        setCustomerName(customerInfo.name);
        setCustomerEmail(customerInfo.email);
        setCustomerPhone(customerInfo.phone);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [ovensResult, optionsResult] = await Promise.all([
        supabase.from('configurator_ovens').select('*').eq('is_active', true),
        supabase.from('configurator_options').select('*').eq('is_active', true)
      ]);
      if (ovensResult.error) throw ovensResult.error;
      if (optionsResult.error) throw optionsResult.error;
      setOvens((ovensResult.data as unknown as ConfiguratorOven[]) || []);
      setOptions(optionsResult.data || []);
    } catch (error) {
      toast.error('Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  };

  const models = Array.from(new Set(
    ovens
      .filter(o => {
        if (!buildType) return true; // Show all if buildType not selected
        if (buildType === 'on_site') return o.can_be_built_on_site !== false;
        return true; // ready_to_use can show all
      })
      .map(o => o.model_name)
  ));
  const availableFuelTypes = selectedModel ? Array.from(new Set(ovens.filter(o => o.model_name === selectedModel).flatMap(o => o.fuel_type))) : [];
  
  // Get available diameters from sizes array or legacy structure
  const getAvailableDiameters = () => {
    if (!selectedModel || !selectedFuelType) return [];
    const modelOvens = ovens.filter(o => o.model_name === selectedModel && o.fuel_type.includes(selectedFuelType));
    const diametersSet = new Set<number>();
    modelOvens.forEach(oven => {
      if (oven.sizes && oven.sizes.length > 0) {
        oven.sizes.forEach(size => diametersSet.add(size.diameter));
      } else {
        diametersSet.add(oven.diameter);
      }
    });
    return Array.from(diametersSet).sort((a, b) => a - b);
  };
  
  const availableDiameters = getAvailableDiameters();
  
  // Get available coatings for selected diameter
  const getAvailableCoatings = () => {
    if (!selectedModel || !selectedFuelType || !selectedDiameter) return [];
    const modelOven = ovens.find(o => o.model_name === selectedModel && o.fuel_type.includes(selectedFuelType));
    if (!modelOven) return [];
    
    if (modelOven.sizes && modelOven.sizes.length > 0) {
      const size = modelOven.sizes.find(s => s.diameter === parseInt(selectedDiameter));
      return size?.coatings || [];
    }
    return [];
  };
  
  const availableCoatings = getAvailableCoatings();
  
  // Get selected oven data
  const getSelectedOvenData = () => {
    if (!selectedModel || !selectedFuelType || !selectedDiameter) return null;
    const modelOven = ovens.find(o => o.model_name === selectedModel && o.fuel_type.includes(selectedFuelType));
    if (!modelOven) return null;
    
    // New structure with sizes
    if (modelOven.sizes && modelOven.sizes.length > 0) {
      const size = modelOven.sizes.find(s => s.diameter === parseInt(selectedDiameter));
      if (!size) return null;
      
      const coating = selectedCoating ? size.coatings.find(c => c.name === selectedCoating) : size.coatings[0];
      if (!coating) return null;
      
      return {
        oven: modelOven,
        size,
        coating,
        isNewStructure: true
      };
    }
    
    // Legacy structure
    if (modelOven.diameter === parseInt(selectedDiameter)) {
      return {
        oven: modelOven,
        size: null,
        coating: null,
        isNewStructure: false
      };
    }
    
    return null;
  };
  
  const selectedOvenData = getSelectedOvenData();
  const selectedOven = selectedOvenData?.oven;

  // Funzione per ottenere l'anteprima delle configurazioni per un modello
  const getModelPreview = (modelName: string) => {
    const modelOvens = ovens.filter(o => o.model_name === modelName);
    const fuelTypes = Array.from(new Set(modelOvens.flatMap(o => o.fuel_type)));
    const diametersSet = new Set<number>();
    
    modelOvens.forEach(oven => {
      if (oven.sizes && oven.sizes.length > 0) {
        oven.sizes.forEach(size => diametersSet.add(size.diameter));
      } else {
        diametersSet.add(oven.diameter);
      }
    });
    
    const diameters = Array.from(diametersSet).sort((a, b) => a - b);
    return { fuelTypes, diameters };
  };

  // Calcola il prezzo della spedizione in base al diametro
  const getShippingPrice = (diameter: number) => {
    if (diameter === 80) return 1000;
    if (diameter === 100) return 1300;
    if (diameter === 120) return 1400;
    if (diameter === 130) return 1500;
    return 0;
  };

  // Ottieni il prezzo in base al listino selezionato
  const getPrice = (field: 'base' | 'gas' | 'electric' | 'onSite') => {
    if (!selectedOvenData) return 0;
    
    // New structure with sizes and coatings
    if (selectedOvenData.isNewStructure && selectedOvenData.coating) {
      const priceKey = `list${priceList}` as 'listA' | 'listB' | 'listC';
      const prices = selectedOvenData.coating.prices[priceKey];
      return prices?.[field] || prices?.base || 0;
    }
    
    // Legacy structure
    if (!selectedOvenData.isNewStructure && selectedOven) {
      const suffix = priceList.toLowerCase();
      const fieldName = `${field}_price_${suffix}` as keyof ConfiguratorOven;
      return selectedOven[fieldName] as number || 0;
    }
    
    return 0;
  };

  // Calcola il prezzo base del forno in base all'alimentazione
  const getOvenPrice = () => {
    if (!selectedOvenData) return 0;
    if (selectedFuelType === 'Legna') return getPrice('base');
    if (selectedFuelType === 'Gas') return getPrice('gas') || getPrice('base');
    if (selectedFuelType === 'Elettrico') return getPrice('electric') || getPrice('base');
    return getPrice('base');
  };

  const calculateTotal = () => {
    if (!selectedOvenData) return 0;
    
    // Per "Costruito sul Posto", il prezzo è unico (non forno + spedizione)
    if (buildType === 'on_site') {
      return getPrice('onSite');
    }
    
    // Per "Già Pronto all'Uso"
    let total = getOvenPrice();
    
    const diameter = selectedOvenData.size?.diameter || selectedOven?.diameter || 0;
    if (deliveryOption === 'shipping') {
      total += getShippingPrice(diameter);
    }
    
    return total;
  };

  const handleSaveQuote = async () => {
    if (!selectedOven) { toast.error('Completa la configurazione'); return; }
    setSavingQuote(true);
    try {
      const { data: quoteData, error: quoteError } = await supabase.from('configurator_quotes').insert({
        oven_id: selectedOven.id, 
        has_installation: buildType === 'on_site',
        has_gas: selectedFuelType === 'Gas',
        total_price: calculateTotal(), 
        delivery_time_weeks: selectedOven.delivery_time_weeks,
        customer_name: customerName || null, 
        customer_email: customerEmail || null,
        customer_phone: customerPhone || null, 
        notes: notes || null
      }).select().single();
      
      if (quoteError) throw quoteError;

      // Update session if exists
      if (sessionId && quoteData) {
        await supabase
          .from('configurator_sessions')
          .update({ 
            quote_id: quoteData.id,
            status: 'interested',
            customer_info: {
              name: customerName,
              email: customerEmail,
              phone: customerPhone
            }
          })
          .eq('id', sessionId);

        // Send notification email
        await supabase.functions.invoke('send-consultation-email', {
          body: {
            type: 'configurator_interest',
            quoteId: quoteData.id,
            ovenModel: selectedOven.model_name,
            fuelType: selectedFuelType,
            totalPrice: calculateTotal(),
            deliveryOption: buildType === 'on_site' ? 'Costruito sul Posto' : 'Spedizione in Europa',
            customerName,
            customerEmail,
            customerPhone
          }
        });
      }
      
      toast.success(sessionId ? 'Grazie per il tuo interesse! Ti contatteremo presto.' : 'Preventivo salvato!');
      setShowQuoteModal(false);
      setSelectedModel(''); setSelectedFuelType(''); setSelectedDiameter('');
      setDeliveryOption('');
      setCustomerName(''); setCustomerEmail(''); setCustomerPhone(''); setNotes('');
    } catch (error) {
      toast.error('Errore nel salvare');
    } finally {
      setSavingQuote(false);
    }
  };

  const handleInterestedClick = async () => {
    if (!selectedOven) {
      toast.error('Completa la configurazione');
      return;
    }

    if (!customerData?.name || !customerData?.email || !customerData?.phone) {
      toast.error('Dati cliente mancanti');
      return;
    }

    setSavingQuote(true);
    try {
      // Save quote
      const { data: quoteData, error: quoteError } = await supabase
        .from('configurator_quotes')
        .insert({
          oven_id: selectedOven.id,
          has_installation: buildType === 'on_site',
          has_gas: selectedFuelType === 'Gas',
          total_price: calculateTotal(),
          delivery_time_weeks: selectedOven.delivery_time_weeks,
          customer_name: customerData.name,
          customer_email: customerData.email,
          customer_phone: customerData.phone,
          notes: notes || null
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Update session
      if (sessionId && quoteData) {
        await supabase
          .from('configurator_sessions')
          .update({
            quote_id: quoteData.id,
            status: 'interested',
            feedback_status: 'interested',
            customer_info: {
              name: customerData.name,
              email: customerData.email,
              phone: customerData.phone
            }
          })
          .eq('id', sessionId);

        // Send email with complete details
        await supabase.functions.invoke('send-consultation-email', {
          body: {
            type: 'configurator_interest',
            quoteId: quoteData.id,
            ovenModel: selectedOven.model_name,
            diameter: selectedOven.diameter,
            pizzaCapacity: selectedOven.pizza_capacity,
            fuelType: selectedFuelType,
            totalPrice: calculateTotal(),
            deliveryOption: buildType === 'on_site' ? 'Costruito sul Posto' : 'Spedizione in Europa',
            deliveryWeeks: selectedOven.delivery_time_weeks,
            customerName: customerData.name,
            customerEmail: customerData.email,
            customerPhone: customerData.phone,
            notes: notes || ''
          }
        });
      }

      toast.success('Grazie per il tuo interesse! Ti contatteremo presto.');
      
      // Reset configurator
      setSelectedModel('');
      setSelectedFuelType('');
      setSelectedDiameter('');
      setDeliveryOption('');
      setNotes('');
    } catch (error) {
      console.error('Error saving interest:', error);
      toast.error('Errore nel salvare la richiesta');
    } finally {
      setSavingQuote(false);
    }
  };

  const handleNotInterestedSubmit = async () => {
    if (feedbackReasons.length === 0 && !otherReason.trim()) {
      toast.error('Seleziona almeno una motivazione o inserisci un commento');
      return;
    }

    setSavingFeedback(true);
    try {
      const combinedReason = [
        ...feedbackReasons,
        otherReason.trim() ? `Altro: ${otherReason}` : ''
      ].filter(Boolean).join('; ');

      if (sessionId) {
        await supabase
          .from('configurator_sessions')
          .update({
            feedback_status: 'not_interested',
            feedback_reason: combinedReason,
            feedback_date: new Date().toISOString(),
            status: 'rejected'
          })
          .eq('id', sessionId);
      }

      toast.success('Grazie per il tuo feedback!');
      setShowNotInterestedModal(false);
      setFeedbackReasons([]);
      setOtherReason('');
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast.error('Errore durante l\'invio del feedback');
    } finally {
      setSavingFeedback(false);
    }
  };

  const toggleFeedbackReason = (reason: string) => {
    setFeedbackReasons(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;

  return (
    <div className="min-h-screen bg-background py-4 sm:py-6 md:py-12 px-3 sm:px-4 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4 sm:mb-6 md:mb-12">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-1 sm:mb-2">Configuratore Forni</h1>
          {customerData ? (
            <div className="space-y-1 sm:space-y-2">
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
                Configura il tuo forno perfetto, <span className="font-semibold text-foreground">{customerData.name}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-center justify-center text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="font-medium">Email:</span> <span className="truncate max-w-[200px]">{customerData.email}</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">Tel:</span> {customerData.phone}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base">Configura il tuo forno perfetto</p>
          )}
        </div>
        
        {/* Step 0: Build Type Selection */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4">1. Come preferisci il tuo forno?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg active:scale-[0.98] ${buildType === 'ready_to_use' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => { 
                setBuildType('ready_to_use'); 
                setSelectedModel(''); 
                setSelectedFuelType(''); 
                setSelectedDiameter(''); 
                setSelectedCoating(''); 
                setDeliveryOption('');
              }}
            >
              <CardHeader className="text-center pb-3">
                <CardTitle className="text-base sm:text-lg md:text-xl">Già Pronto all'Uso</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-3">
                  <Pizza className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-primary" />
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Forno costruito artigianalmente nel nostro laboratorio e spedito pronto all'uso. 
                  Richiede spazio adeguato per il passaggio.
                </CardDescription>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg active:scale-[0.98] ${buildType === 'on_site' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => { 
                setBuildType('on_site'); 
                setSelectedModel(''); 
                setSelectedFuelType(''); 
                setSelectedDiameter(''); 
                setSelectedCoating(''); 
                setDeliveryOption('');
              }}
            >
              <CardHeader className="text-center pb-3">
                <CardTitle className="text-base sm:text-lg md:text-xl">Costruito sul Posto</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-3">
                  <Flame className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-primary" />
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Il forno viene costruito direttamente presso la tua sede dai nostri artigiani esperti.
                  Ideale per spazi ridotti o installazioni personalizzate.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Step 1: Model Selection */}
        {buildType && (
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4">2. Scegli il Modello</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {models.map(model => {
              const preview = getModelPreview(model);
              return (
                <Card 
                  key={model} 
                  className={`cursor-pointer transition-all hover:shadow-lg active:scale-[0.98] ${selectedModel === model ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => { setSelectedModel(model); setSelectedFuelType(''); setSelectedDiameter(''); }}
                >
                  <CardContent className="p-2 sm:p-3 md:p-4">
                    <div className="aspect-square mb-2 sm:mb-2 md:mb-3 bg-muted rounded-lg overflow-hidden">
                      <img 
                        src={ovens.find(o => o.model_name === model)?.image_url || '/placeholder.svg'} 
                        alt={model}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-center mb-2 sm:mb-3 text-sm sm:text-base">{model}</h3>
                    
                    {/* Anteprima configurazioni */}
                    <div className="border-t pt-2 sm:pt-3 space-y-1.5 sm:space-y-2">
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-0.5 sm:mb-1">Alimentazioni:</p>
                        <div className="flex flex-wrap gap-0.5 sm:gap-1">
                          {preview.fuelTypes.map(fuel => (
                            <span key={fuel} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-vesuviano-50 text-vesuviano-700 rounded-full">
                              {fuel}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-0.5 sm:mb-1">Dimensioni:</p>
                        <div className="flex flex-wrap gap-0.5 sm:gap-1">
                          {preview.diameters.map(diameter => (
                            <span key={diameter} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-stone-100 text-stone-700 rounded-full">
                              {diameter}cm
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        )}

        {/* Step 2: Fuel Type Selection */}
        {selectedModel && (
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4">3. Scegli l'Alimentazione</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {availableFuelTypes.map(fuel => (
                <Card 
                  key={fuel}
                  className={`cursor-pointer transition-all hover:shadow-lg active:scale-[0.98] ${selectedFuelType === fuel ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => { setSelectedFuelType(fuel); setSelectedDiameter(''); }}
                >
                  <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                    <Flame className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 mx-auto mb-1 sm:mb-2" />
                    <h3 className="font-semibold text-xs sm:text-sm md:text-base">{fuel}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Diameter Selection */}
        {selectedFuelType && availableDiameters.length > 0 && (
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4">4. Scegli il Diametro</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {availableDiameters.map(diameter => {
                const modelOven = ovens.find(o => o.model_name === selectedModel);
                const sizeData = modelOven?.sizes?.find(s => s.diameter === diameter);
                const pizzaCapacity = sizeData?.pizza_capacity || modelOven?.pizza_capacity || '';
                
                return (
                  <Card 
                    key={diameter}
                    className={`cursor-pointer transition-all ${selectedDiameter === diameter.toString() ? 'ring-2 ring-primary' : 'hover:shadow-lg'}`}
                    onClick={() => {
                      setSelectedDiameter(diameter.toString());
                      setSelectedCoating('');
                    }}
                  >
                    <CardContent className="p-4 md:p-6 text-center">
                      <Pizza className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 text-primary" />
                      <div className="font-bold text-lg md:text-xl mb-1">{diameter}cm</div>
                      <div className="text-xs md:text-sm text-muted-foreground">{pizzaCapacity}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Coating Selection (if new structure) */}
        {selectedDiameter && availableCoatings.length > 0 && (
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4">5. Scegli il Rivestimento</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {availableCoatings.map(coating => (
                <Card 
                  key={coating.name}
                  className={`cursor-pointer transition-all overflow-hidden active:scale-[0.98] ${selectedCoating === coating.name ? 'ring-2 ring-primary' : 'hover:shadow-lg'}`}
                  onClick={() => setSelectedCoating(coating.name)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square relative">
                      <img 
                        src={coating.image_url} 
                        alt={coating.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2 sm:p-3 text-center">
                      <div className="font-medium text-xs sm:text-sm line-clamp-2">{coating.name}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Additional Options & Summary */}
        {selectedOvenData && (availableCoatings.length === 0 || selectedCoating) && (
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
              <CardTitle className="text-lg sm:text-xl md:text-2xl">{availableCoatings.length > 0 ? '6' : '5'}. Opzioni Aggiuntive e Riepilogo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              {/* Prezzo Totale - Sempre visibile in alto */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 rounded-lg p-4 sm:p-6 shadow-lg mb-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Prezzo Totale</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
                      €{calculateTotal().toFixed(2)}
                    </p>
                  </div>
                  <Euro className="w-8 h-8 sm:w-12 sm:h-12 text-primary/30" />
                </div>
                {deliveryOption === 'shipping' && (
                  <div className="mt-3 pt-3 border-t border-primary/20">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Forno:</span>
                      <span className="font-semibold">€{getOvenPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm mt-1">
                      <span className="text-muted-foreground">Spedizione:</span>
                      <span className="font-semibold">
                        +€{getShippingPrice(selectedOvenData.size?.diameter || selectedOven.diameter).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {buildType === 'ready_to_use' && (
                <div>
                  <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Opzioni di Consegna</h3>
                  {selectedOven.passage_space_cm && (
                    <div className="mb-3 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-xs sm:text-sm text-blue-900">
                        <strong>Spazio necessario per il passaggio:</strong> {selectedOven.passage_space_cm} cm
                      </p>
                    </div>
                  )}
                  <div className="space-y-2 sm:space-y-3">
                    <div 
                      className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all active:scale-[0.99] ${deliveryOption === 'shipping' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      onClick={() => setDeliveryOption('shipping')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <Label className="cursor-pointer font-medium text-sm sm:text-base">Spedizione in Europa</Label>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">Spedizione con imballaggio cassonato in legno</p>
                          <p className="text-base sm:text-lg font-bold mt-1 sm:mt-2 text-primary">
                            +€{getShippingPrice(selectedOvenData.size?.diameter || selectedOven.diameter).toFixed(2)}
                          </p>
                        </div>
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${deliveryOption === 'shipping' ? 'border-primary' : 'border-border'}`}>
                          {deliveryOption === 'shipping' && <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary"></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* Oven Images Gallery */}
              <div>
                <h3 className="font-semibold mb-4">Il Tuo Forno</h3>
                <div className="space-y-3">
                  <div className="aspect-video relative overflow-hidden rounded-lg border">
                    <img 
                      src={selectedOvenData.coating?.image_url || selectedOven.image_url} 
                      alt={selectedOven.model_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {selectedOven.additional_images && selectedOven.additional_images.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {selectedOven.additional_images.map((img: string, index: number) => (
                        <div key={index} className="aspect-square relative overflow-hidden rounded border cursor-pointer hover:opacity-80 transition-opacity">
                          <img 
                            src={img} 
                            alt={`${selectedOven.model_name} - Vista ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedOven.video_url_360 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowVideo360(true)}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Visualizza Video 360°
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4 md:pt-6">
                <h3 className="font-semibold mb-3 md:mb-4 text-lg md:text-xl">Riepilogo Configurazione</h3>
                <div className="bg-muted/50 rounded-lg p-4 md:p-6 space-y-3 md:space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-background rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={selectedOvenData.coating?.image_url || selectedOven.image_url} 
                        alt={selectedOven.model_name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base md:text-lg truncate">{selectedOven.model_name}</h4>
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <Flame className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{selectedFuelType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <Pizza className="w-3 h-3 md:w-4 md:h-4" />
                        <span>
                          {selectedOvenData.size?.diameter || selectedOven.diameter}cm - {selectedOvenData.size?.pizza_capacity || selectedOven.pizza_capacity}
                        </span>
                      </div>
                      {selectedCoating && (
                        <div className="text-xs md:text-sm text-muted-foreground mt-1">
                          Rivestimento: {selectedCoating}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 md:pt-3 border-t text-sm md:text-base">
                    <Clock className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Consegna: {selectedOven.delivery_time_weeks} settimane</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 md:pt-3 border-t">
                    <span className="text-base md:text-lg font-semibold">Totale:</span>
                    <span className="text-2xl md:text-3xl font-bold text-primary">€{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              {/* Bottoni feedback */}
              {sessionId && (buildType === 'on_site' || deliveryOption) && (
                <div className="border-t pt-3 sm:pt-4 md:pt-6 mt-3 sm:mt-4 md:mt-6 space-y-2 sm:space-y-3">
                  <h3 className="font-semibold text-center mb-2 sm:mb-3 md:mb-4 text-sm sm:text-base md:text-lg">Hai bisogno di assistenza?</h3>
                  <Button 
                    onClick={handleInterestedClick}
                    className="w-full text-xs sm:text-sm md:text-base h-12 sm:h-auto" 
                    size="lg"
                    variant="default"
                  >
                    <span className="hidden sm:inline">Sono interessato - Fammi contattare dal vostro responsabile clienti</span>
                    <span className="sm:hidden leading-tight">Sono interessato<br/>Richiedi contatto</span>
                  </Button>
                  <Button 
                    onClick={() => setShowNotInterestedModal(true)}
                    className="w-full text-xs sm:text-sm md:text-base" 
                    size="lg"
                    variant="outline"
                  >
                    Non sono interessato
                  </Button>
                </div>
              )}
              {!deliveryOption && buildType === 'ready_to_use' && sessionId && (
                <p className="text-xs sm:text-sm text-center text-muted-foreground mt-4 sm:mt-6">Seleziona un'opzione di consegna per procedere</p>
              )}
              {!buildType && sessionId && (
                <p className="text-xs sm:text-sm text-center text-muted-foreground mt-4 sm:mt-6">Scegli come preferisci il tuo forno per iniziare</p>
              )}
            </CardContent>
          </Card>
        )}
        <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader><DialogTitle className="text-lg sm:text-xl">Richiedi Preventivo</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)}
                  readOnly={!!customerData}
                  className={customerData ? "bg-muted" : ""}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email" 
                  value={customerEmail} 
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  readOnly={!!customerData}
                  className={customerData ? "bg-muted" : ""}
                />
              </div>
              <div>
                <Label>Telefono</Label>
                <Input 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  readOnly={!!customerData}
                  className={customerData ? "bg-muted" : ""}
                />
              </div>
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

        {/* Modal Non Interessato */}
        <Dialog open={showNotInterestedModal} onOpenChange={setShowNotInterestedModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Aiutaci a migliorare</DialogTitle>
              <DialogDescription>
                Ci dispiace che non sia interessato. Cosa possiamo migliorare?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Seleziona una o più motivazioni:</Label>
                {[
                  'Prezzo troppo elevato',
                  'Non c\'è il modello che cerco',
                  'Tempi di consegna troppo lunghi',
                  'Preferisco un altro fornitore',
                  'Ho bisogno di più informazioni'
                ].map((reason) => (
                  <div key={reason} className="flex items-center space-x-2">
                    <Checkbox
                      id={reason}
                      checked={feedbackReasons.includes(reason)}
                      onCheckedChange={() => toggleFeedbackReason(reason)}
                    />
                    <label
                      htmlFor={reason}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {reason}
                    </label>
                  </div>
                ))}
              </div>
              
              <div>
                <Label htmlFor="other-reason">Altro (specificare):</Label>
                <Textarea
                  id="other-reason"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Inserisci qui la tua motivazione..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowNotInterestedModal(false)}
                  className="flex-1"
                  disabled={savingFeedback}
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleNotInterestedSubmit}
                  className="flex-1"
                  disabled={savingFeedback}
                >
                  {savingFeedback ? 'Invio...' : 'Invia Feedback'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Configurator;