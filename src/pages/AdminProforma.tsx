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
import { Plus, Trash2, ArrowLeft, FileText, Copy, ExternalLink, Send, Eye, Edit, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

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
  valid_until: string | null;
  created_at: string;
}

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

  // Burner form state
  const [burnerName, setBurnerName] = useState('');
  const [burnerDescription, setBurnerDescription] = useState('');
  const [burnerPrice, setBurnerPrice] = useState('');
  const [burnerImageUrl, setBurnerImageUrl] = useState('');

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/admin/login');
      return;
    }
  };

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

  const addOvenItem = (oven: any) => {
    const newItem: ProformaItem = {
      item_type: 'oven',
      oven_id: oven.id,
      model_name: oven.model_name,
      fuel_type: oven.fuel_type?.[0] || '',
      diameter: oven.diameter,
      coating: '',
      image_url: oven.image_url,
      unit_price: oven.base_price_a || 0,
      quantity: 1,
      line_total: oven.base_price_a || 0,
      sort_order: items.length,
    };
    setItems([...items, newItem]);
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
    if (field === 'unit_price' || field === 'quantity') {
      updated[index].line_total = updated[index].unit_price * updated[index].quantity;
    }
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalPrice = items.reduce((sum, item) => sum + item.line_total, 0);
  const depositPercentage = paymentOption === 'deposit_5' ? 5 : 50;
  const depositAmount = totalPrice * (depositPercentage / 100);

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
          total_price: totalPrice,
          deposit_percentage: depositPercentage,
          deposit_amount: depositAmount,
          delivery_days: deliveryDays ? parseInt(deliveryDays) : null,
          payment_option: paymentOption,
          status: 'sent',
        })
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/configuratore')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Indietro
            </Button>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-8 h-8" /> Pro-Forma
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowBurnerForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> Nuovo Bruciatore
            </Button>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> Nuova Pro-Forma
            </Button>
          </div>
        </div>

        {/* Proformas List */}
        {!showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Pro-Forma Inviate</CardTitle>
            </CardHeader>
            <CardContent>
              {proformas.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nessuna pro-forma creata ancora</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Azienda</TableHead>
                      <TableHead>Totale</TableHead>
                      <TableHead>Deposito</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proformas.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{format(new Date(p.created_at), 'dd/MM/yyyy', { locale: it })}</TableCell>
                        <TableCell>{p.customer_name || '-'}</TableCell>
                        <TableCell>{p.company_name || '-'}</TableCell>
                        <TableCell>€{p.total_price.toLocaleString('it-IT')}</TableCell>
                        <TableCell>{p.deposit_percentage}% (€{p.deposit_amount.toLocaleString('it-IT')})</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dati Cliente</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome Cliente</Label>
                  <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Mario Rossi" />
                </div>
                <div>
                  <Label>Ragione Sociale (opzionale)</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Pizzeria Da Mario SRL" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="mario@email.com" />
                </div>
                <div>
                  <Label>Telefono</Label>
                  <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+39 333..." />
                </div>
                <div>
                  <Label>P.IVA (opzionale)</Label>
                  <Input value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} placeholder="IT12345678901" />
                </div>
                <div>
                  <Label>Note</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Note aggiuntive..." />
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <CardTitle>Prodotti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Select onValueChange={(val) => {
                    const oven = ovens.find(o => o.id === val);
                    if (oven) addOvenItem(oven);
                  }}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="+ Aggiungi Forno" />
                    </SelectTrigger>
                    <SelectContent>
                      {ovens.map(o => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.model_name} - Ø{o.diameter}cm
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select onValueChange={(val) => {
                    const burner = burners.find(b => b.id === val);
                    if (burner) addBurnerItem(burner);
                  }}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="+ Aggiungi Bruciatore" />
                    </SelectTrigger>
                    <SelectContent>
                      {burners.length === 0 ? (
                        <SelectItem value="none" disabled>Nessun bruciatore disponibile</SelectItem>
                      ) : (
                        burners.map(b => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name} - €{b.price}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={addCustomItem}>
                    <Plus className="w-4 h-4 mr-2" /> Prodotto Personalizzato
                  </Button>
                </div>

                <Separator />

                {items.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nessun prodotto aggiunto</p>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div key={idx} className="border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start">
                        {item.image_url && (
                          <img src={item.image_url} alt="" className="w-20 h-20 object-cover rounded" />
                        )}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Nome</Label>
                            <Input
                              value={item.model_name || item.custom_name || ''}
                              onChange={(e) => updateItem(idx, item.item_type === 'custom' ? 'custom_name' : 'model_name', e.target.value)}
                            />
                          </div>
                          {item.item_type === 'oven' && (
                            <>
                              <div>
                                <Label className="text-xs text-muted-foreground">Alimentazione</Label>
                                <Select value={item.fuel_type || ''} onValueChange={(v) => updateItem(idx, 'fuel_type', v)}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Legna">Legna</SelectItem>
                                    <SelectItem value="Gas">Gas</SelectItem>
                                    <SelectItem value="Elettrico">Elettrico</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Rivestimento</Label>
                                <Input value={item.coating || ''} onChange={(e) => updateItem(idx, 'coating', e.target.value)} placeholder="Es. Mosaico Nero" />
                              </div>
                            </>
                          )}
                          <div>
                            <Label className="text-xs text-muted-foreground">Prezzo unitario (€)</Label>
                            <Input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Quantità</Label>
                            <Input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold whitespace-nowrap">€{item.line_total.toLocaleString('it-IT')}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeItem(idx)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Condizioni di Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Opzione Pagamento</Label>
                  <Select value={paymentOption} onValueChange={setPaymentOption}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit_5">5% deposito (blocca offerta)</SelectItem>
                      <SelectItem value="deposit_50">50% acconto (spedizione rapida)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Giorni per consegna (se 50%)</Label>
                  <Input
                    type="number"
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(e.target.value)}
                    placeholder="Es. 30"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <div className="text-sm text-muted-foreground">Totale: <span className="text-lg font-bold text-foreground">€{totalPrice.toLocaleString('it-IT')}</span></div>
                  <div className="text-sm text-muted-foreground">Deposito {depositPercentage}%: <span className="font-semibold text-foreground">€{depositAmount.toLocaleString('it-IT')}</span></div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
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
                <Label>URL Immagine (opzionale)</Label>
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
