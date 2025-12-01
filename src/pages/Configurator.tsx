import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Flame, Clock, Euro, Pizza, PlayCircle, Image as ImageIcon, Sparkles, Phone } from 'lucide-react';
import ColorRenderGenerator from '@/components/configurator/ColorRenderGenerator';
import ArchitettoAI from '@/components/configurator/ArchitettoAI';
import Video360Modal from '@/components/Video360Modal';
import ConfiguratorLanguageSelector from '@/components/ConfiguratorLanguageSelector';

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
    passage_space_cm?: number | null;
    can_be_built_on_site?: boolean;
    coatings: Array<{
      name: string;
      image_url: string;
      video_url_360?: string;
      render_images?: string[];
      prices: {
        listA: { base: number; gas?: number; electric?: number; onSite?: number };
        listB: { base: number; gas?: number; electric?: number; onSite?: number };
        listC: { base: number; gas?: number; electric?: number; onSite?: number };
      };
    }>;
  }>;
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
  const { t, i18n } = useTranslation();
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
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(true);
  const [colorRenderImageUrl, setColorRenderImageUrl] = useState<string>("");
  const [selectedColorForRender, setSelectedColorForRender] = useState<string>("");
  const [spaceImageUrl, setSpaceImageUrl] = useState<string>("");
  const [architectAIRenderUrl, setArchitectAIRenderUrl] = useState<string>("");
  const [showContactMethodModal, setShowContactMethodModal] = useState(false);
  const [selectedContactMethod, setSelectedContactMethod] = useState<'whatsapp' | 'phone' | ''>('');
  const [showThankYouMessage, setShowThankYouMessage] = useState(false);

  useEffect(() => { 
    fetchData(); 
    if (sessionId) loadSessionData();
  }, []);

  // Auto-detect browser language
  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    const supportedLangs = ['it', 'en', 'fr'];
    if (supportedLangs.includes(browserLang) && i18n.language !== browserLang) {
      i18n.changeLanguage(browserLang);
    }
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
      toast.error(t('configurator.errors.loadingError'));
    } finally {
      setLoading(false);
    }
  };

  const models = Array.from(new Set(
    ovens
      .filter(o => {
        if (!buildType) return true; // Show all if buildType not selected
        if (buildType === 'on_site') {
          // Check if at least one size can be built on site
          if (o.sizes && o.sizes.length > 0) {
            return o.sizes.some(size => size.can_be_built_on_site === true);
          }
          return false;
        }
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
        oven.sizes.forEach(size => {
          // Filter by buildType if on_site
          if (buildType === 'on_site') {
            if (size.can_be_built_on_site === true) {
              diametersSet.add(size.diameter);
            }
          } else {
            diametersSet.add(size.diameter);
          }
        });
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

  // Track customer actions
  const trackAction = async (actionType: string, actionData?: any) => {
    if (!sessionId) return;
    
    try {
      const { data: session } = await supabase
        .from('configurator_sessions')
        .select('customer_actions')
        .eq('id', sessionId)
        .single();
      
      const currentActions = Array.isArray(session?.customer_actions) ? session.customer_actions : [];
      const newAction = {
        type: actionType,
        timestamp: new Date().toISOString(),
        ...actionData
      };
      
      await supabase
        .from('configurator_sessions')
        .update({ 
          customer_actions: [...currentActions, newAction] as any
        })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error tracking action:', error);
    }
  };

  // Track selections
  useEffect(() => {
    if (selectedModel) trackAction('model_selected', { model: selectedModel });
  }, [selectedModel]);

  useEffect(() => {
    if (selectedFuelType) trackAction('fuel_selected', { fuelType: selectedFuelType });
  }, [selectedFuelType]);

  useEffect(() => {
    if (selectedDiameter) trackAction('size_selected', { diameter: selectedDiameter });
  }, [selectedDiameter]);

  useEffect(() => {
    if (selectedCoating) trackAction('coating_selected', { coating: selectedCoating });
  }, [selectedCoating]);

  const handleSaveQuote = async () => {
    if (!selectedOven) { toast.error(t('configurator.errors.completeConfig')); return; }
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
        await trackAction('quote_saved', { quoteId: quoteData.id, totalPrice: calculateTotal() });
        
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
      
      toast.success(sessionId ? t('configurator.success.thankYouInterest') : t('configurator.success.quoteSaved'));
      setShowQuoteModal(false);
      setSelectedModel(''); setSelectedFuelType(''); setSelectedDiameter('');
      setDeliveryOption('');
      setCustomerName(''); setCustomerEmail(''); setCustomerPhone(''); setNotes('');
    } catch (error) {
      toast.error(t('configurator.errors.savingError'));
    } finally {
      setSavingQuote(false);
    }
  };

  const handleInterestedClick = async () => {
    if (!selectedOven) {
      toast.error(t('configurator.errors.completeConfig'));
      return;
    }

    if (!customerData?.name || !customerData?.email || !customerData?.phone) {
      toast.error(t('configurator.errors.missingCustomer'));
      return;
    }

    // Show contact method selection modal
    setShowContactMethodModal(true);
  };

  const handleContactMethodSubmit = async () => {
    if (!selectedContactMethod) {
      toast.error(t('configurator.errors.selectContactMethod'));
      return;
    }

    setSavingQuote(true);
    try {
      // Save quote
      const { data: quoteData, error: quoteError } = await supabase
        .from('configurator_quotes')
        .insert({
          oven_id: selectedOven!.id,
          has_installation: buildType === 'on_site',
          has_gas: selectedFuelType === 'Gas',
          total_price: calculateTotal(),
          delivery_time_weeks: selectedOven!.delivery_time_weeks,
          customer_name: customerData!.name,
          customer_email: customerData!.email,
          customer_phone: customerData!.phone,
          notes: `Metodo di contatto preferito: ${selectedContactMethod === 'whatsapp' ? 'WhatsApp' : 'Chiamata telefonica'}${notes ? '\n' + notes : ''}`
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
              name: customerData!.name,
              email: customerData!.email,
              phone: customerData!.phone,
              contact_method: selectedContactMethod
            }
          })
          .eq('id', sessionId);

        // Send email with complete details
        await supabase.functions.invoke('send-consultation-email', {
          body: {
            type: 'configurator_interest',
            quoteId: quoteData.id,
            ovenModel: selectedOven!.model_name,
            diameter: selectedOven!.diameter,
            pizzaCapacity: selectedOven!.pizza_capacity,
            fuelType: selectedFuelType,
            totalPrice: calculateTotal(),
            deliveryOption: buildType === 'on_site' ? 'Costruito sul Posto' : 'Spedizione in Europa',
            deliveryWeeks: selectedOven!.delivery_time_weeks,
            customerName: customerData!.name,
            customerEmail: customerData!.email,
            customerPhone: customerData!.phone,
            contactMethod: selectedContactMethod === 'whatsapp' ? 'WhatsApp' : 'Chiamata telefonica'
          }
        });
      }

      setShowContactMethodModal(false);
      setShowThankYouMessage(true);
    } catch (error) {
      console.error('Error saving interested status:', error);
      toast.error(t('configurator.errors.savingError'));
    } finally {
      setSavingQuote(false);
    }
  };

  const handleNotInterestedSubmit = async () => {
    if (feedbackReasons.length === 0 && !otherReason.trim()) {
      toast.error(t('configurator.feedback.subtitle'));
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

      toast.success(t('configurator.success.feedbackSent'));
      setShowNotInterestedModal(false);
      setFeedbackReasons([]);
      setOtherReason('');
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast.error(t('configurator.errors.savingError'));
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

  const handleDepositPayment = async () => {
    if (!selectedOven || !customerData?.name || !customerData?.email || !customerData?.phone) {
      toast.error(t('configurator.errors.completeConfig'));
      return;
    }

    try {
      setSavingQuote(true);

      // First, create the quote
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
          notes: notes || null,
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Update session if exists
      if (sessionId && quoteData) {
        await supabase
          .from('configurator_sessions')
          .update({
            quote_id: quoteData.id,
            status: 'payment_initiated',
            customer_info: {
              name: customerData.name,
              email: customerData.email,
              phone: customerData.phone,
            },
          })
          .eq('id', sessionId);
      }

      // Calculate prices
      const totalPrice = calculateTotal();
      const discountedPrice = totalPrice * 0.95;
      const depositAmount = discountedPrice * 0.01;

      // Create Stripe checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            ovenModel: selectedOven.model_name,
            fuelType: selectedFuelType,
            diameter: selectedOvenData?.size?.diameter || selectedOven.diameter,
            coating: selectedCoating || undefined,
            buildType: buildType,
            totalPrice: totalPrice,
            discountedPrice: discountedPrice,
            depositAmount: depositAmount,
            customerName: customerData.name,
            customerEmail: customerData.email,
            customerPhone: customerData.phone,
            quoteId: quoteData.id,
            sessionId: sessionId || undefined,
            deliveryWeeks: selectedOven.delivery_time_weeks,
            pizzaCapacity: selectedOvenData?.size?.pizza_capacity || selectedOven.pizza_capacity,
          },
        }
      );

      if (checkoutError) {
        console.error('Checkout error:', checkoutError);
        throw new Error('Errore nella creazione della sessione di pagamento');
      }

      // Redirect to Stripe Checkout
      if (checkoutData?.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error('URL di pagamento non ricevuto');
      }
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      toast.error(error.message || 'Errore nell\'elaborazione del pagamento');
    } finally {
      setSavingQuote(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;

  return (
    <div className="min-h-screen bg-background py-4 sm:py-6 md:py-12 px-3 sm:px-4 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <ConfiguratorLanguageSelector />
        </div>
        
        <div className="text-center mb-4 sm:mb-6 md:mb-12">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-1 sm:mb-2">{t('configurator.title')}</h1>
          {customerData ? (
            <div className="space-y-1 sm:space-y-2">
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
                {t('configurator.subtitle')}, <span className="font-semibold text-foreground">{customerData.name}</span>
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
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base">{t('configurator.subtitle')}</p>
          )}
        </div>
        
        {/* Step 0: Build Type Selection */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4">1. {t('configurator.buildType.title')}</h2>
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
                <CardTitle className="text-base sm:text-lg md:text-xl">{t('configurator.buildType.readyToUse')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-3">
                  <Pizza className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-primary" />
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  {t('configurator.buildType.readyToUseDesc')}
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
                <CardTitle className="text-base sm:text-lg md:text-xl">{t('configurator.buildType.builtOnSite')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-3">
                  <Flame className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-primary" />
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  {t('configurator.buildType.builtOnSiteDesc')}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Step 1: Model Selection */}
        {buildType && (
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4">2. {t('configurator.selectModel')}</h2>
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
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <h3 className="font-semibold text-center mb-2 sm:mb-3 text-sm sm:text-base">{model}</h3>
                    
                    {/* Anteprima configurazioni */}
                    <div className="border-t pt-2 sm:pt-3 space-y-1.5 sm:space-y-2">
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-0.5 sm:mb-1">{t('configurator.preview.fuelTypes')}</p>
                        <div className="flex flex-wrap gap-0.5 sm:gap-1">
                          {preview.fuelTypes.map(fuel => (
                            <span key={fuel} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-vesuviano-50 text-vesuviano-700 rounded-full">
                              {t(`configurator.fuelTypes.${fuel}`)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-0.5 sm:mb-1">{t('configurator.preview.dimensions')}</p>
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
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4">3. {t('configurator.steps.chooseFuel')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {availableFuelTypes.map(fuel => (
                <Card 
                  key={fuel}
                  className={`cursor-pointer transition-all hover:shadow-lg active:scale-[0.98] ${selectedFuelType === fuel ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => { setSelectedFuelType(fuel); setSelectedDiameter(''); }}
                >
                  <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                    <Flame className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 mx-auto mb-1 sm:mb-2" />
                    <h3 className="font-semibold text-xs sm:text-sm md:text-base">{t(`configurator.fuelTypes.${fuel}`)}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Diameter Selection */}
        {selectedFuelType && availableDiameters.length > 0 && (
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4">4. {t('configurator.steps.chooseDiameter')}</h2>
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
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4">5. {t('configurator.steps.chooseCoating')}</h2>
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
              <CardTitle className="text-lg sm:text-xl md:text-2xl">{availableCoatings.length > 0 ? '6' : '5'}. {t('configurator.steps.additionalOptions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              {/* Prezzo Totale - Sempre visibile in alto */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 rounded-lg p-4 sm:p-6 shadow-lg mb-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t('configurator.price.total')}</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
                      €{calculateTotal().toFixed(2)}
                    </p>
                  </div>
                  <Euro className="w-8 h-8 sm:w-12 sm:h-12 text-primary/30" />
                </div>
                {deliveryOption === 'shipping' && (
                  <div className="mt-3 pt-3 border-t border-primary/20">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">{t('configurator.price.oven')}</span>
                      <span className="font-semibold">€{getOvenPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm mt-1">
                      <span className="text-muted-foreground">{t('configurator.price.shipping')}</span>
                      <span className="font-semibold">
                        +€{getShippingPrice(selectedOvenData.size?.diameter || selectedOven.diameter).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {buildType === 'ready_to_use' && (
                <div>
                  <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{t('configurator.deliveryOptions.title')}</h3>
                  {selectedOvenData?.size?.passage_space_cm && (
                    <div className="mb-3 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-xs sm:text-sm text-blue-900">
                        <strong>{t('configurator.delivery.spaceRequired')}</strong> {selectedOvenData.size.passage_space_cm} cm
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
                          <Label className="cursor-pointer font-medium text-sm sm:text-base">{t('configurator.delivery.shippingEurope')}</Label>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">{t('configurator.delivery.shippingDescription')}</p>
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


              {/* Oven Media Gallery - Photo and Video */}
              <div>
                <h3 className="font-semibold mb-4 text-base sm:text-lg">Il Tuo Forno</h3>
                <div className="space-y-4">
                  {/* Media Toggle Buttons */}
                  {(selectedOvenData.coating?.video_url_360 || selectedOven.video_url_360) && (
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant={showPhotoGallery ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowPhotoGallery(true)}
                        className="flex items-center gap-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Foto
                      </Button>
                      <Button
                        variant={!showPhotoGallery ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowPhotoGallery(false)}
                        className="flex items-center gap-2"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Video 360°
                      </Button>
                    </div>
                  )}

                  {/* Main Display */}
                  <div className="aspect-[4/5] sm:aspect-[3/4] md:aspect-video relative overflow-hidden rounded-lg border bg-muted">
                    {!showPhotoGallery && (selectedOvenData.coating?.video_url_360 || selectedOven.video_url_360) ? (
                      <video 
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls
                        className="w-full h-full object-contain"
                      src={selectedOvenData.coating?.video_url_360 || selectedOven.video_url_360}
                    >
                      {t('configurator.media.videoNotSupported')}
                    </video>
                  ) : (
                    <img 
                      src={selectedOvenData.coating?.image_url || selectedOven.image_url} 
                      alt={selectedOven.model_name}
                      className="w-full h-full object-contain p-2 sm:p-4"
                    />
                  )}
                </div>
                
                {/* Additional Images */}
                {showPhotoGallery && ((selectedOvenData.coating?.render_images && selectedOvenData.coating.render_images.length > 0) ||
                  (selectedOven.additional_images && selectedOven.additional_images.length > 0)) && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {(selectedOvenData.coating?.render_images || selectedOven.additional_images || []).map((img: string, index: number) => (
                      <div key={index} className="aspect-square relative overflow-hidden rounded border cursor-pointer hover:opacity-80 transition-opacity bg-muted">
                        <img 
                          src={img} 
                          alt={`${selectedOven.model_name} - ${t('configurator.media.viewAlt')} ${index + 1}`}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Color Render Generator */}
            <ColorRenderGenerator
              ovenName={selectedOven.model_name}
              ovenImageUrl={selectedOvenData.coating?.image_url || selectedOven.image_url}
              selectedCoating={selectedCoating}
              onRenderGenerated={(imageUrl, color) => {
                setColorRenderImageUrl(imageUrl);
                setSelectedColorForRender(color);
              }}
            />

            {/* Architetto AI */}
            <ArchitettoAI
              ovenName={selectedOven.model_name}
              ovenImageUrl={colorRenderImageUrl || selectedOvenData.coating?.image_url || selectedOven.image_url}
              onSpaceImageSelected={setSpaceImageUrl}
              onRenderGenerated={setArchitectAIRenderUrl}
            />
            
            <div className="border-t pt-4 md:pt-6">
              <h3 className="font-semibold mb-3 md:mb-4 text-lg md:text-xl">{t('configurator.configuration.title')}</h3>
              <div className="bg-gradient-to-br from-background to-muted/30 rounded-xl p-4 md:p-6 space-y-4 md:space-y-5 border-2 border-primary/10 shadow-lg">
                
                {/* Header con immagine e titolo */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 md:w-28 md:h-28 bg-background rounded-xl overflow-hidden flex-shrink-0 shadow-md border border-border">
                    <img 
                      src={selectedOvenData.coating?.image_url || selectedOven.image_url} 
                      alt={selectedOven.model_name} 
                      className="w-full h-full object-contain p-2" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg md:text-xl mb-2">{selectedOven.model_name}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-3">
                      {selectedOven.description || t('configurator.configuration.description')}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-xs md:text-sm">
                        <Flame className="w-4 h-4 text-primary" />
                        <span className="font-medium">{t(`configurator.fuelTypes.${selectedFuelType}`)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs md:text-sm">
                        <Pizza className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {selectedOvenData.size?.diameter || selectedOven.diameter}cm
                        </span>
                      </div>
                    </div>
                    {selectedCoating && (
                      <div className="text-xs md:text-sm mt-2 px-2 py-1 bg-primary/10 rounded-md inline-block">
                        <span className="font-medium">{t('configurator.configuration.coating')}</span> {selectedCoating}
                      </div>
                    )}
                  </div>
                </div>

                {/* Dettagli tecnici */}
                <div className="bg-background/80 rounded-lg p-3 md:p-4 space-y-2 border border-border/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('configurator.configuration.pizzas')}</span>
                    <span className="font-semibold">{selectedOvenData.size?.pizza_capacity || selectedOven.pizza_capacity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {t('configurator.configuration.deliveryTime')}
                    </span>
                    <span className="font-semibold">{selectedOven.delivery_time_weeks} {t('configurator.summary.weeks')}</span>
                  </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('configurator.summary.buildType')}</span>
                      <span className="font-semibold">
                        {buildType === 'ready_to_use' ? t('configurator.buildType.readyToUse') : t('configurator.buildType.builtOnSite')}
                      </span>
                    </div>
                  </div>

                  {/* Totale */}
                  <div className="bg-primary/5 rounded-lg p-3 md:p-5 border-2 border-primary/20">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <span className="text-sm md:text-lg font-semibold">{t('configurator.summary.total')}</span>
                      <span className="text-xl md:text-3xl font-bold text-primary">€{calculateTotal().toFixed(2)}</span>
                    </div>
                    
                    {/* Sconto a tempo */}
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-lg p-2 md:p-4 mb-2 md:mb-3">
                      <div className="flex items-start gap-1 md:gap-2 mb-1 md:mb-2">
                        <Sparkles className="w-3.5 h-3.5 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-green-700 dark:text-green-400 text-[11px] md:text-base leading-tight break-words">
                            {t('configurator.summary.discount.title')}
                          </p>
                          <p className="text-[10px] md:text-sm text-green-600 dark:text-green-500 mt-0.5 md:mt-1 leading-snug break-words">
                            {t('configurator.summary.discount.description')} €{(calculateTotal() * 0.05).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1.5 md:pt-2 border-t border-green-500/20 gap-2">
                        <span className="text-[10px] md:text-sm font-medium text-green-700 dark:text-green-400 leading-tight break-words">{t('configurator.summary.discount.discountedPrice')}</span>
                        <span className="text-base md:text-2xl font-bold text-green-600 dark:text-green-400 flex-shrink-0">
                          €{(calculateTotal() * 0.95).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Modalità di pagamento */}
                    <div className="bg-background/80 rounded-lg p-2 md:p-4 border border-border/50 mb-2 md:mb-3">
                      <p className="font-semibold text-[11px] md:text-base mb-1 md:mb-2 flex items-center gap-1 md:gap-2">
                        <Euro className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
                        <span className="leading-tight break-words">{t('configurator.summary.paymentTerms.title')}</span>
                      </p>
                      <div className="space-y-1 text-[10px] md:text-sm text-muted-foreground">
                        <div className="flex items-start gap-1 md:gap-2">
                          <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-primary flex-shrink-0 mt-1"></div>
                          <span className="leading-snug break-words"><strong>{t('configurator.summary.paymentTerms.deposit')}</strong> {t('configurator.summary.paymentTerms.depositDescription')}</span>
                        </div>
                        <div className="flex items-start gap-1 md:gap-2">
                          <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-primary flex-shrink-0 mt-1"></div>
                          <span className="leading-snug break-words"><strong>{t('configurator.summary.paymentTerms.balance')}</strong> {t('configurator.summary.paymentTerms.balanceDescription')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pulsante blocca ordine */}
                    <Button 
                      className="w-full h-auto py-2 md:py-4 px-2 md:px-4 text-xs md:text-base font-bold shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                      onClick={handleDepositPayment}
                      disabled={!customerData?.name || !customerData?.email || !customerData?.phone}
                    >
                      <div className="flex flex-col items-center gap-0.5 md:gap-1 w-full">
                        <span className="flex items-center justify-center gap-1 md:gap-2 text-[11px] md:text-base w-full">
                          <Euro className="w-3.5 h-3.5 md:w-5 md:h-5 flex-shrink-0" />
                          <span className="leading-tight break-words">{t('configurator.payment.depositButton')}</span>
                        </span>
                        <span className="text-[9px] md:text-sm font-medium opacity-90 leading-tight text-center max-w-full break-words px-0.5">
                          {t('configurator.cta.payDeposit').split(' — ')[1]}
                        </span>
                      </div>
                    </Button>
                    <div className="space-y-2 mt-3">
                      <p className="text-[10px] md:text-xs text-center text-muted-foreground font-medium">
                        {t('configurator.summary.depositAmount')}: <span className="font-bold">€{(calculateTotal() * 0.95 * 0.01).toFixed(2)}</span>
                      </p>
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-2 md:p-3 space-y-1">
                        <p className="text-[10px] md:text-sm text-blue-900 dark:text-blue-100 flex items-start gap-1.5 md:gap-2">
                          <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0 text-xs md:text-base">✓</span>
                          <span className="leading-snug break-words">{t('configurator.payment.benefit2')}</span>
                        </p>
                        <p className="text-[10px] md:text-sm text-blue-900 dark:text-blue-100 flex items-start gap-1.5 md:gap-2">
                          <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0 text-xs md:text-base">✓</span>
                          <span className="leading-snug break-words">{t('configurator.payment.benefit1')}</span>
                        </p>
                      </div>
                    </div>

                    {/* CTA secondaria - Richiedi contatto */}
                    <div className="mt-3 md:mt-4">
                      <Button 
                        onClick={handleInterestedClick}
                        className="w-full text-xs md:text-base h-auto py-2 md:py-3" 
                        size="lg"
                        variant="outline"
                      >
                        <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" />
                        <span className="leading-tight break-words">{t('configurator.cta.interested')}</span>
                      </Button>
                      <p className="text-[10px] md:text-xs text-center text-muted-foreground mt-2 leading-snug px-1 break-words">
                        {t('configurator.payment.teamWillCall')}
                      </p>
                    </div>

                    {/* CTA Non sono interessato */}
                    <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border/50">
                      <Button 
                        onClick={() => setShowNotInterestedModal(true)}
                        className="w-full text-[11px] md:text-sm" 
                        size="sm"
                        variant="ghost"
                      >
                        {t('configurator.cta.notInterested')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Bottoni feedback */}
              {sessionId && (buildType === 'on_site' || deliveryOption) && (
                <div className="border-t pt-3 sm:pt-4 md:pt-6 mt-3 sm:mt-4 md:mt-6 space-y-2 sm:space-y-3">
                  <h3 className="font-semibold text-center mb-2 sm:mb-3 md:mb-4 text-sm sm:text-base md:text-lg">{t('configurator.payment.needHelp')}</h3>
                  <Button 
                    onClick={handleInterestedClick}
                    className="w-full text-xs sm:text-sm md:text-base h-12 sm:h-auto" 
                    size="lg"
                    variant="default"
                  >
                    <span className="hidden sm:inline">{t('configurator.payment.interestedButton')}</span>
                    <span className="sm:hidden leading-tight">{t('configurator.payment.interestedButtonShort')}<br/>{t('configurator.payment.interestedButtonShortSub')}</span>
                  </Button>
                  <Button 
                    onClick={() => setShowNotInterestedModal(true)}
                    className="w-full text-xs sm:text-sm md:text-base" 
                    size="lg"
                    variant="outline"
                  >
                    {t('configurator.payment.notInterestedButton')}
                  </Button>
                </div>
              )}
              {!deliveryOption && buildType === 'ready_to_use' && sessionId && (
                <p className="text-xs sm:text-sm text-center text-muted-foreground mt-4 sm:mt-6">{t('configurator.delivery.selectDelivery')}</p>
              )}
              {!buildType && sessionId && (
                <p className="text-xs sm:text-sm text-center text-muted-foreground mt-4 sm:mt-6">{t('configurator.delivery.chooseBuildType')}</p>
              )}
            </CardContent>
          </Card>
        )}
        <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader><DialogTitle className="text-lg sm:text-xl">{t('configurator.modals.quote.title')}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t('configurator.modals.quote.name')}</Label>
                <Input 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)}
                  readOnly={!!customerData}
                  className={customerData ? "bg-muted" : ""}
                />
              </div>
              <div>
                <Label>{t('configurator.modals.quote.email')}</Label>
                <Input 
                  type="email" 
                  value={customerEmail} 
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  readOnly={!!customerData}
                  className={customerData ? "bg-muted" : ""}
                />
              </div>
              <div>
                <Label>{t('configurator.modals.quote.phone')}</Label>
                <Input 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  readOnly={!!customerData}
                  className={customerData ? "bg-muted" : ""}
                />
              </div>
              <div><Label>{t('configurator.modals.quote.notes')}</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} /></div>
              <Button onClick={handleSaveQuote} className="w-full" disabled={savingQuote}>{savingQuote ? t('configurator.modals.quote.submitting') : t('configurator.modals.quote.submit')}</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Non Interessato */}
        <Dialog open={showNotInterestedModal} onOpenChange={setShowNotInterestedModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('configurator.modals.notInterested.title')}</DialogTitle>
              <DialogDescription>
                {t('configurator.modals.notInterested.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>{t('configurator.modals.notInterested.mainReason')}</Label>
                {['tooExpensive', 'tooLong', 'urgent', 'dontLike', 'noModel', 'otherSupplier'].map((key) => {
                  const reason = t(`configurator.feedback.reasons.${key}`);
                  return (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={feedbackReasons.includes(reason)}
                        onCheckedChange={() => toggleFeedbackReason(reason)}
                      />
                      <label
                        htmlFor={key}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {reason}
                      </label>
                    </div>
                  );
                })}
              </div>
              
              <div>
                <Label htmlFor="other-reason">Altro (specificare):</Label>
                <Textarea
                  id="other-reason"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value.slice(0, 500))}
                  placeholder="Inserisci qui la tua motivazione..."
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {otherReason.length}/500 caratteri
                </p>
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

        {/* Contact Method Selection Modal */}
        <Dialog open={showContactMethodModal} onOpenChange={setShowContactMethodModal}>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Come preferisci essere contattato?</DialogTitle>
              <DialogDescription>
                Scegli il metodo di contatto che preferisci e ti richiameremo al più presto
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <Button
                  variant={selectedContactMethod === 'whatsapp' ? 'default' : 'outline'}
                  className="w-full h-auto py-4 justify-start"
                  onClick={() => setSelectedContactMethod('whatsapp')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-xl">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">WhatsApp</div>
                      <div className="text-xs opacity-80">Ti contatteremo su WhatsApp</div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant={selectedContactMethod === 'phone' ? 'default' : 'outline'}
                  className="w-full h-auto py-4 justify-start"
                  onClick={() => setSelectedContactMethod('phone')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Chiamata Telefonica</div>
                      <div className="text-xs opacity-80">Ti chiameremo al tuo numero</div>
                    </div>
                  </div>
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowContactMethodModal(false);
                    setSelectedContactMethod('');
                  }}
                  className="flex-1"
                  disabled={savingQuote}
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleContactMethodSubmit}
                  className="flex-1"
                  disabled={savingQuote || !selectedContactMethod}
                >
                  {savingQuote ? 'Invio...' : 'Conferma'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Thank You Message Modal */}
        <Dialog open={showThankYouMessage} onOpenChange={setShowThankYouMessage}>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl text-center">Grazie {customerData?.name}! 🎉</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-center">
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <p className="text-sm md:text-base text-green-900 dark:text-green-100">
                  La tua richiesta è stata inviata con successo!
                </p>
                <p className="text-sm md:text-base text-green-900 dark:text-green-100 mt-3">
                  {selectedContactMethod === 'whatsapp' 
                    ? 'Ti contatteremo presto su WhatsApp'
                    : 'Ti chiameremo al più presto'}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Il nostro team clienti ti ricontatterà entro 24 ore per finalizzare il tuo ordine.
              </p>
              <Button
                onClick={() => setShowThankYouMessage(false)}
                className="w-full"
              >
                Chiudi
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Configurator;