import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowLeft, FileText, Copy, ExternalLink, Loader2, Globe, DollarSign, Percent } from 'lucide-react';
import { format } from 'date-fns';
import { it as itLocale } from 'date-fns/locale';

interface ProformaItem {
  id?: string;
  item_type: 'oven' | 'burner' | 'custom';
  oven_id?: string;
  burner_id?: string;
  custom_name?: string;
  custom_description?: string;
  model_name?: string;
  fuel_type?: string;
  diameter?: number;
  coating?: string;
  image_url?: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  specifications?: any;
  sort_order: number;
}

interface Proforma {
  id: string;
  token: string;
  proforma_number: string | null;
  customer_name: string | null;
  company_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  vat_number: string | null;
  notes: string | null;
  total_price: number;
  deposit_percentage: number;
  deposit_amount: number;
  delivery_days: number | null;
  payment_option: string;
  payment_status: string;
  status: string;
  language: string;
  currency: string;
  price_list: string;
  valid_until: string | null;
  created_at: string;
}

const LANGUAGES = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CHF', symbol: 'CHF', name: 'Franco Svizzero' },
];

const PRICE_LISTS = [
  { code: 'A', name: 'Listino A' },
  { code: 'B', name: 'Listino B' },
  { code: 'C', name: 'Listino C' },
];

const getCurrencySymbol = (code: string) => CURRENCIES.find(c => c.code === code)?.symbol || '€';

const AdminProforma = () => {
  const navigate = useNavigate();
  const [proformas, setProformas] = useState<Proforma[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBurnerForm, setShowBurnerForm] = useState(false);
  const [ovens, setOvens] = useState<any[]>([]);
  const [burners, setBurners] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Create form state
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [paymentOption, setPaymentOption] = useState('deposit_5');
  const [items, setItems] = useState<ProformaItem[]>([]);
  const [language, setLanguage] = useState('it');
  const [currency, setCurrency] = useState('EUR');
  const [priceList, setPriceList] = useState('A');
  const [discountPercentage, setDiscountPercentage] = useState(0);

  // Burner form state
  const [burnerName, setBurnerName] = useState('');
  const [burnerDescription, setBurnerDescription] = useState('');
  const [burnerPrice, setBurnerPrice] = useState('');
  const [burnerImageUrl, setBurnerImageUrl] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [proformasRes, ovensRes, burnersRes] = await Promise.all([
      supabase.from('proformas').select('*').order('created_at', { ascending: false }),
      supabase.from('configurator_ovens').select('*').eq('is_active', true),
      supabase.from('burners').select('*').eq('is_active', true),
    ]);
    if (proformasRes.data) setProformas(proformasRes.data as any);
    if (ovensRes.data) setOvens(ovensRes.data);
    if (burnersRes.data) setBurners(burnersRes.data);
    setLoading(false);
  };

  // Get unique model names
  const uniqueModels = React.useMemo(() => {
    const seen = new Set<string>();
    return ovens.filter(oven => {
      if (seen.has(oven.model_name)) return false;
      seen.add(oven.model_name);
      return true;
    });
  }, [ovens]);

  // Get available fuel types, sizes, and coatings for a model
  const getModelConfig = (modelName: string) => {
    const modelOvens = ovens.filter(o => o.model_name === modelName);
    const fuelTypes = Array.from(new Set(modelOvens.flatMap((o: any) => o.fuel_type || [])));
    const sizes: { diameter: number; coatings: any[] }[] = [];
    modelOvens.forEach((oven: any) => {
      if (oven.sizes && oven.sizes.length > 0) {
        oven.sizes.forEach((size: any) => {
          if (!sizes.find(s => s.diameter === size.diameter)) {
            sizes.push({ diameter: size.diameter, coatings: size.coatings || [] });
          }
        });
      }
    });
    return { fuelTypes, sizes, firstOven: modelOvens[0] };
  };

  const addModelItem = (modelName: string) => {
    const config = getModelConfig(modelName);
    if (!config.firstOven) return;

    const newItem: ProformaItem = {
      item_type: 'oven',
      oven_id: config.firstOven.id,
      model_name: modelName,
      fuel_type: config.fuelTypes[0] || '',
      diameter: config.sizes[0]?.diameter || config.firstOven.diameter,
      coating: config.sizes[0]?.coatings?.[0]?.name || '',
      image_url: config.sizes[0]?.coatings?.[0]?.image_url || config.firstOven.image_url,
      unit_price: 0,
      quantity: 1,
      line_total: 0,
      sort_order: items.length,
    };

    // Calculate price from configurator data
    const price = getOvenPriceFromConfig(config.firstOven, newItem.fuel_type || '', newItem.diameter || 0, newItem.coating || '', priceList);
    newItem.unit_price = price;
    newItem.line_total = price;

    setItems([...items, newItem]);
  };

  const getOvenPriceFromConfig = (oven: any, fuelType: string, diameter: number, coatingName: string, pl: string) => {
    if (!oven?.sizes) return oven?.base_price_a || 0;
    const size = oven.sizes.find((s: any) => s.diameter === diameter);
    if (!size) return oven.base_price_a || 0;
    const coating = size.coatings?.find((c: any) => c.name === coatingName) || size.coatings?.[0];
    if (!coating?.prices) return oven.base_price_a || 0;
    
    const priceKey = `list${pl}` as string;
    const prices = coating.prices[priceKey];
    if (!prices) return oven.base_price_a || 0;
    
    if (fuelType === 'Gas') return prices.gas || prices.base || 0;
    if (fuelType === 'Elettrico') return prices.electric || prices.base || 0;
    return prices.base || 0;
  };

  const addBurnerItem = (burner: any) => {
    const newItem: ProformaItem = {
      item_type: 'burner',
      burner_id: burner.id,
      model_name: burner.name,
      custom_description: burner.description,
      image_url: burner.image_url,
      unit_price: burner.price || 0,
      quantity: 1,
      line_total: burner.price || 0,
      sort_order: items.length,
    };
    setItems([...items, newItem]);
  };

  const addCustomItem = () => {
    const newItem: ProformaItem = {
      item_type: 'custom',
      custom_name: 'Prodotto personalizzato',
      unit_price: 0,
      quantity: 1,
      line_total: 0,
      sort_order: items.length,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    
    // Recalculate price when oven config changes
    if (updated[index].item_type === 'oven' && ['fuel_type', 'diameter', 'coating'].includes(field)) {
      const item = updated[index];
      const oven = ovens.find(o => o.model_name === item.model_name);
      if (oven) {
        // If diameter changed, update available coatings
        if (field === 'diameter') {
          const size = oven.sizes?.find((s: any) => s.diameter === value);
          if (size?.coatings?.[0]) {
            item.coating = size.coatings[0].name;
            item.image_url = size.coatings[0].image_url || oven.image_url;
          }
        }
        if (field === 'coating') {
          const size = oven.sizes?.find((s: any) => s.diameter === item.diameter);
          const coat = size?.coatings?.find((c: any) => c.name === value);
          if (coat?.image_url) item.image_url = coat.image_url;
        }
        const price = getOvenPriceFromConfig(oven, item.fuel_type || '', item.diameter || 0, item.coating || '', priceList);
        item.unit_price = price;
        item.line_total = price * item.quantity;
      }
    }
    
    if (field === 'unit_price' || field === 'quantity') {
      updated[index].line_total = updated[index].unit_price * updated[index].quantity;
    }
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalPrice = items.reduce((sum, item) => sum + item.line_total, 0);
  const discountAmount = totalPrice * (discountPercentage / 100);
  const discountedTotal = totalPrice - discountAmount;
  const depositPercentage = paymentOption === 'deposit_5' ? 5 : 50;
  const depositAmount = discountedTotal * (depositPercentage / 100);
  const sym = getCurrencySymbol(currency);

  const handleCreateProforma = async () => {
    if (items.length === 0) {
      toast.error('Aggiungi almeno un prodotto');
      return;
    }
    setSaving(true);
    try {
      const { data: proforma, error: proformaError } = await supabase
        .from('proformas')
        .insert({
          customer_name: customerName || null,
          company_name: companyName || null,
          customer_email: customerEmail || null,
          customer_phone: customerPhone || null,
          vat_number: vatNumber || null,
          notes: notes || null,
          total_price: discountedTotal,
          deposit_percentage: depositPercentage,
          deposit_amount: depositAmount,
          discount_percentage: discountPercentage,
          discount_amount: discountAmount,
          delivery_days: deliveryDays ? parseInt(deliveryDays) : null,
          payment_option: paymentOption,
          language,
          currency,
          price_list: priceList,
          status: 'sent',
        } as any)
        .select()
        .single();

      if (proformaError) throw proformaError;

      const itemsToInsert = items.map((item, idx) => ({
        proforma_id: proforma.id,
        item_type: item.item_type,
        oven_id: item.oven_id || null,
        burner_id: item.burner_id || null,
        custom_name: item.custom_name || null,
        custom_description: item.custom_description || null,
        model_name: item.model_name || null,
        fuel_type: item.fuel_type || null,
        diameter: item.diameter || null,
        coating: item.coating || null,
        image_url: item.image_url || null,
        unit_price: item.unit_price,
        quantity: item.quantity,
        line_total: item.line_total,
        specifications: item.specifications || {},
        sort_order: idx,
      }));

      const { error: itemsError } = await supabase
        .from('proforma_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast.success('Pro-forma creata con successo!');
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error creating proforma:', error);
      toast.error('Errore nella creazione: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBurner = async () => {
    if (!burnerName) {
      toast.error('Inserisci un nome per il bruciatore');
      return;
    }
    try {
      const { error } = await supabase.from('burners').insert({
        name: burnerName,
        description: burnerDescription || null,
        price: parseFloat(burnerPrice) || 0,
        image_url: burnerImageUrl || null,
      });
      if (error) throw error;
      toast.success('Bruciatore aggiunto!');
      setBurnerName('');
      setBurnerDescription('');
      setBurnerPrice('');
      setBurnerImageUrl('');
      setShowBurnerForm(false);
      loadData();
    } catch (error: any) {
      toast.error('Errore: ' + error.message);
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setCompanyName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setVatNumber('');
    setNotes('');
    setDeliveryDays('');
    setPaymentOption('deposit_5');
    setItems([]);
    setLanguage('it');
    setCurrency('EUR');
    setPriceList('A');
    setDiscountPercentage(0);
    setShowCreateForm(false);
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/proforma/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiato!');
  };

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (paymentStatus === 'paid') return <Badge className="bg-green-600">Pagato</Badge>;
    if (status === 'sent') return <Badge className="bg-blue-600">Inviata</Badge>;
    if (status === 'draft') return <Badge variant="secondary">Bozza</Badge>;
    if (status === 'expired') return <Badge variant="destructive">Scaduta</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/erp')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8" /> Pro-Forma
            </h1>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => setShowBurnerForm(true)} className="flex-1 sm:flex-none">
              <Plus className="w-4 h-4 mr-1" /> Bruciatore
            </Button>
            <Button size="sm" onClick={() => setShowCreateForm(true)} className="flex-1 sm:flex-none">
              <Plus className="w-4 h-4 mr-1" /> Nuova
            </Button>
          </div>
        </div>

        {/* Proformas List */}
        {!showCreateForm && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pro-Forma Inviate</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {proformas.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nessuna pro-forma creata ancora</p>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>N°</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Azienda</TableHead>
                          <TableHead>Totale</TableHead>
                          <TableHead>Deposito</TableHead>
                          <TableHead>Lingua</TableHead>
                          <TableHead>Stato</TableHead>
                          <TableHead>Azioni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {proformas.map((p) => {
                          const pSym = getCurrencySymbol((p as any).currency || 'EUR');
                          const lang = LANGUAGES.find(l => l.code === ((p as any).language || 'it'));
                          return (
                            <TableRow key={p.id}>
                              <TableCell className="font-mono text-xs">{p.proforma_number || '-'}</TableCell>
                              <TableCell>{format(new Date(p.created_at), 'dd/MM/yyyy', { locale: itLocale })}</TableCell>
                              <TableCell>{p.customer_name || '-'}</TableCell>
                              <TableCell>{p.company_name || '-'}</TableCell>
                              <TableCell>{pSym}{p.total_price.toLocaleString('it-IT')}</TableCell>
                              <TableCell>{p.deposit_percentage}% ({pSym}{p.deposit_amount.toLocaleString('it-IT')})</TableCell>
                              <TableCell>{lang?.flag || '🇮🇹'}</TableCell>
                              <TableCell>{getStatusBadge(p.status, p.payment_status)}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="ghost" onClick={() => copyLink(p.token)}>
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => window.open(`/proforma/${p.token}`, '_blank')}>
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Mobile cards */}
                  <div className="md:hidden space-y-3 p-3">
                    {proformas.map((p) => {
                      const pSym = getCurrencySymbol((p as any).currency || 'EUR');
                      const lang = LANGUAGES.find(l => l.code === ((p as any).language || 'it'));
                      return (
                        <div key={p.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-mono text-xs text-muted-foreground">{p.proforma_number || '-'}</span>
                              <p className="font-semibold text-sm">{p.customer_name || 'N/A'}</p>
                              {p.company_name && <p className="text-xs text-muted-foreground">{p.company_name}</p>}
                            </div>
                            <div className="text-right">
                              {getStatusBadge(p.status, p.payment_status)}
                              <p className="text-sm font-bold mt-1">{pSym}{p.total_price.toLocaleString('it-IT')}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{format(new Date(p.created_at), 'dd/MM/yyyy')}</span>
                            <span>{lang?.flag} Dep. {p.deposit_percentage}%</span>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => copyLink(p.token)}>
                              <Copy className="w-3 h-3 mr-1" /> Copia Link
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => window.open(`/proforma/${p.token}`, '_blank')}>
                              <ExternalLink className="w-3 h-3 mr-1" /> Apri
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="space-y-4 sm:space-y-6">
            {/* Language, Currency & Price List */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5" /> Lingua, Valuta & Listino
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Lingua documento</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(l => (
                        <SelectItem key={l.code} value={l.code}>{l.flag} {l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Valuta</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.symbol} {c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Listino Prezzi</Label>
                  <Select value={priceList} onValueChange={(v) => {
                    setPriceList(v);
                    // Recalculate all oven prices
                    setItems(prev => prev.map(item => {
                      if (item.item_type !== 'oven') return item;
                      const oven = ovens.find(o => o.model_name === item.model_name);
                      if (!oven) return item;
                      const price = getOvenPriceFromConfig(oven, item.fuel_type || '', item.diameter || 0, item.coating || '', v);
                      return { ...item, unit_price: price, line_total: price * item.quantity };
                    }));
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRICE_LISTS.map(p => (
                        <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Dati Cliente</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Nome Cliente</Label>
                  <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Mario Rossi" />
                </div>
                <div>
                  <Label className="text-xs">Ragione Sociale</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Pizzeria Da Mario SRL" />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="mario@email.com" />
                </div>
                <div>
                  <Label className="text-xs">Telefono</Label>
                  <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+39 333..." />
                </div>
                <div>
                  <Label className="text-xs">P.IVA</Label>
                  <Input value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} placeholder="IT12345678901" />
                </div>
                <div>
                  <Label className="text-xs">Note</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Note aggiuntive..." rows={2} />
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Prodotti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select onValueChange={(val) => addModelItem(val)}>
                    <SelectTrigger className="w-full sm:w-[300px]">
                      <SelectValue placeholder="+ Aggiungi Modello Forno" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueModels.map(oven => (
                        <SelectItem key={oven.id} value={oven.model_name}>
                          {oven.model_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select onValueChange={(val) => {
                    const burner = burners.find(b => b.id === val);
                    if (burner) addBurnerItem(burner);
                  }}>
                    <SelectTrigger className="w-full sm:w-[250px]">
                      <SelectValue placeholder="+ Aggiungi Bruciatore" />
                    </SelectTrigger>
                    <SelectContent>
                      {burners.length === 0 ? (
                        <SelectItem value="none" disabled>Nessun bruciatore</SelectItem>
                      ) : (
                        burners.map(b => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name} - {sym}{b.price}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={addCustomItem} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-1" /> Personalizzato
                  </Button>
                </div>

                <Separator />

                {items.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nessun prodotto aggiunto</p>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, idx) => {
                      const ovenData = item.item_type === 'oven' ? ovens.find(o => o.model_name === item.model_name) : null;
                      const config = ovenData ? getModelConfig(ovenData.model_name) : null;
                      const selectedSize = config?.sizes?.find(s => s.diameter === item.diameter);

                      return (
                        <div key={idx} className="border rounded-lg p-3 space-y-3">
                          <div className="flex items-start gap-3">
                            {item.image_url && (
                              <img src={item.image_url} alt="" className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold text-sm">{item.model_name || item.custom_name}</p>
                                  {item.item_type === 'oven' && (
                                    <p className="text-xs text-muted-foreground">
                                      {item.fuel_type} • Ø{item.diameter}cm • {item.coating}
                                    </p>
                                  )}
                                  {item.custom_description && (
                                    <p className="text-xs text-muted-foreground">{item.custom_description}</p>
                                  )}
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => removeItem(idx)} className="ml-2 flex-shrink-0">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {item.item_type === 'oven' && config && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div>
                                <Label className="text-[10px] text-muted-foreground">Alimentazione</Label>
                                <Select value={item.fuel_type || ''} onValueChange={(v) => updateItem(idx, 'fuel_type', v)}>
                                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {config.fuelTypes.map(f => (
                                      <SelectItem key={f} value={f}>{f}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-[10px] text-muted-foreground">Dimensione</Label>
                                <Select value={String(item.diameter || '')} onValueChange={(v) => updateItem(idx, 'diameter', parseInt(v))}>
                                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {config.sizes.map(s => (
                                      <SelectItem key={s.diameter} value={String(s.diameter)}>Ø {s.diameter}cm</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-[10px] text-muted-foreground">Rivestimento</Label>
                                <Select value={item.coating || ''} onValueChange={(v) => updateItem(idx, 'coating', v)}>
                                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {(selectedSize?.coatings || []).map((c: any) => (
                                      <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-[10px] text-muted-foreground">Prezzo ({sym})</Label>
                                <Input
                                  type="number"
                                  className="h-8 text-xs"
                                  value={item.unit_price}
                                  onChange={(e) => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </div>
                          )}

                          {item.item_type === 'burner' && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-[10px] text-muted-foreground">Prezzo ({sym})</Label>
                                <Input
                                  type="number"
                                  className="h-8 text-xs"
                                  value={item.unit_price}
                                  onChange={(e) => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] text-muted-foreground">Qtà</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  className="h-8 text-xs"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                                />
                              </div>
                            </div>
                          )}

                          {item.item_type === 'custom' && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              <div className="col-span-2 sm:col-span-1">
                                <Label className="text-[10px] text-muted-foreground">Nome</Label>
                                <Input
                                  className="h-8 text-xs"
                                  value={item.custom_name || ''}
                                  onChange={(e) => updateItem(idx, 'custom_name', e.target.value)}
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] text-muted-foreground">Prezzo ({sym})</Label>
                                <Input
                                  type="number"
                                  className="h-8 text-xs"
                                  value={item.unit_price}
                                  onChange={(e) => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] text-muted-foreground">Qtà</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  className="h-8 text-xs"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                                />
                              </div>
                            </div>
                          )}
                          
                          <div className="text-right">
                            <span className="font-bold text-sm">{sym}{item.line_total.toLocaleString('it-IT')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Condizioni di Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">Opzione Pagamento</Label>
                    <Select value={paymentOption} onValueChange={setPaymentOption}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deposit_5">5% deposito (blocca offerta)</SelectItem>
                        <SelectItem value="deposit_50">50% acconto (spedizione rapida)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Giorni consegna (se 50%)</Label>
                    <Input
                      type="number"
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(e.target.value)}
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <Label className="text-xs flex items-center gap-1"><Percent className="w-3 h-3" /> Sconto (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={discountPercentage || ''}
                      onChange={(e) => setDiscountPercentage(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotale</span>
                    <span>{sym}{totalPrice.toLocaleString('it-IT')}</span>
                  </div>
                  {discountPercentage > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Sconto ({discountPercentage}%)</span>
                      <span>-{sym}{discountAmount.toLocaleString('it-IT')}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Totale</span>
                    <span className="text-lg font-bold text-foreground">{sym}{discountedTotal.toLocaleString('it-IT')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Deposito {depositPercentage}%</span>
                    <span className="font-semibold text-foreground">{sym}{depositAmount.toLocaleString('it-IT')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pb-8">
              <Button variant="outline" onClick={resetForm}>Annulla</Button>
              <Button onClick={handleCreateProforma} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Crea Pro-Forma
              </Button>
            </div>
          </div>
        )}

        {/* Add Burner Dialog */}
        <Dialog open={showBurnerForm} onOpenChange={setShowBurnerForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuovo Bruciatore</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input value={burnerName} onChange={(e) => setBurnerName(e.target.value)} placeholder="Bruciatore Gas 2 Fuochi" />
              </div>
              <div>
                <Label>Descrizione</Label>
                <Textarea value={burnerDescription} onChange={(e) => setBurnerDescription(e.target.value)} placeholder="Descrizione..." />
              </div>
              <div>
                <Label>Prezzo (€)</Label>
                <Input type="number" value={burnerPrice} onChange={(e) => setBurnerPrice(e.target.value)} placeholder="500" />
              </div>
              <div>
                <Label>URL Immagine</Label>
                <Input value={burnerImageUrl} onChange={(e) => setBurnerImageUrl(e.target.value)} placeholder="https://..." />
              </div>
              <Button onClick={handleCreateBurner} className="w-full">Salva Bruciatore</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminProforma;
