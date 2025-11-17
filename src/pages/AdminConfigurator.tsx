import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import InitConfiguratorData from '@/components/InitConfiguratorData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Euro, Clock } from 'lucide-react';

interface ConfiguratorOven {
  id: string;
  name: string;
  category: string;
  image_url: string;
  base_price: number;
  delivery_time_weeks: number;
  diameters: any;
  is_active: boolean;
  description: string | null;
}

interface ConfiguratorOption {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string | null;
  is_active: boolean;
}

interface ConfiguratorQuote {
  id: string;
  oven_id: string;
  diameter: string;
  has_installation: boolean;
  has_gas: boolean;
  total_price: number;
  delivery_time_weeks: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

const AdminConfigurator = () => {
  const [ovens, setOvens] = useState<ConfiguratorOven[]>([]);
  const [options, setOptions] = useState<ConfiguratorOption[]>([]);
  const [quotes, setQuotes] = useState<ConfiguratorQuote[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Oven form
  const [showOvenModal, setShowOvenModal] = useState(false);
  const [editingOven, setEditingOven] = useState<ConfiguratorOven | null>(null);
  const [ovenName, setOvenName] = useState('');
  const [ovenCategory, setOvenCategory] = useState('');
  const [ovenImageUrl, setOvenImageUrl] = useState('');
  const [ovenBasePrice, setOvenBasePrice] = useState('');
  const [ovenDeliveryTime, setOvenDeliveryTime] = useState('');
  const [ovenDiameters, setOvenDiameters] = useState('');
  const [ovenDescription, setOvenDescription] = useState('');
  const [ovenIsActive, setOvenIsActive] = useState(true);
  
  // Option form
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [editingOption, setEditingOption] = useState<ConfiguratorOption | null>(null);
  const [optionName, setOptionName] = useState('');
  const [optionType, setOptionType] = useState('');
  const [optionPrice, setOptionPrice] = useState('');
  const [optionDescription, setOptionDescription] = useState('');
  const [optionIsActive, setOptionIsActive] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ovensResult, optionsResult, quotesResult] = await Promise.all([
        supabase.from('configurator_ovens').select('*').order('created_at', { ascending: false }),
        supabase.from('configurator_options').select('*').order('created_at', { ascending: false }),
        supabase.from('configurator_quotes').select('*').order('created_at', { ascending: false })
      ]);

      if (ovensResult.error) throw ovensResult.error;
      if (optionsResult.error) throw optionsResult.error;
      if (quotesResult.error) throw quotesResult.error;

      setOvens(ovensResult.data || []);
      setOptions(optionsResult.data || []);
      setQuotes(quotesResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const resetOvenForm = () => {
    setEditingOven(null);
    setOvenName('');
    setOvenCategory('');
    setOvenImageUrl('');
    setOvenBasePrice('');
    setOvenDeliveryTime('');
    setOvenDiameters('');
    setOvenDescription('');
    setOvenIsActive(true);
  };

  const resetOptionForm = () => {
    setEditingOption(null);
    setOptionName('');
    setOptionType('');
    setOptionPrice('');
    setOptionDescription('');
    setOptionIsActive(true);
  };

  const handleEditOven = (oven: ConfiguratorOven) => {
    setEditingOven(oven);
    setOvenName(oven.name);
    setOvenCategory(oven.category);
    setOvenImageUrl(oven.image_url);
    setOvenBasePrice(oven.base_price.toString());
    setOvenDeliveryTime(oven.delivery_time_weeks.toString());
    setOvenDiameters(oven.diameters.join(', '));
    setOvenDescription(oven.description || '');
    setOvenIsActive(oven.is_active);
    setShowOvenModal(true);
  };

  const handleSaveOven = async () => {
    if (!ovenName || !ovenCategory || !ovenImageUrl || !ovenBasePrice || !ovenDeliveryTime || !ovenDiameters) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    const diametersArray = ovenDiameters.split(',').map(d => d.trim()).filter(d => d);
    
    const ovenData = {
      name: ovenName,
      category: ovenCategory,
      image_url: ovenImageUrl,
      base_price: parseFloat(ovenBasePrice),
      delivery_time_weeks: parseInt(ovenDeliveryTime),
      diameters: diametersArray,
      description: ovenDescription || null,
      is_active: ovenIsActive
    };

    try {
      if (editingOven) {
        const { error } = await supabase
          .from('configurator_ovens')
          .update(ovenData)
          .eq('id', editingOven.id);
        if (error) throw error;
        toast.success('Forno aggiornato con successo');
      } else {
        const { error } = await supabase
          .from('configurator_ovens')
          .insert(ovenData);
        if (error) throw error;
        toast.success('Forno aggiunto con successo');
      }
      
      setShowOvenModal(false);
      resetOvenForm();
      fetchData();
    } catch (error) {
      console.error('Error saving oven:', error);
      toast.error('Errore nel salvataggio del forno');
    }
  };

  const handleDeleteOven = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo forno?')) return;
    
    try {
      const { error } = await supabase
        .from('configurator_ovens')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Forno eliminato con successo');
      fetchData();
    } catch (error) {
      console.error('Error deleting oven:', error);
      toast.error('Errore nell\'eliminazione del forno');
    }
  };

  const handleEditOption = (option: ConfiguratorOption) => {
    setEditingOption(option);
    setOptionName(option.name);
    setOptionType(option.type);
    setOptionPrice(option.price.toString());
    setOptionDescription(option.description || '');
    setOptionIsActive(option.is_active);
    setShowOptionModal(true);
  };

  const handleSaveOption = async () => {
    if (!optionName || !optionType || !optionPrice) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    const optionData = {
      name: optionName,
      type: optionType,
      price: parseFloat(optionPrice),
      description: optionDescription || null,
      is_active: optionIsActive
    };

    try {
      if (editingOption) {
        const { error } = await supabase
          .from('configurator_options')
          .update(optionData)
          .eq('id', editingOption.id);
        if (error) throw error;
        toast.success('Opzione aggiornata con successo');
      } else {
        const { error } = await supabase
          .from('configurator_options')
          .insert(optionData);
        if (error) throw error;
        toast.success('Opzione aggiunta con successo');
      }
      
      setShowOptionModal(false);
      resetOptionForm();
      fetchData();
    } catch (error) {
      console.error('Error saving option:', error);
      toast.error('Errore nel salvataggio dell\'opzione');
    }
  };

  const handleDeleteOption = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa opzione?')) return;
    
    try {
      const { error } = await supabase
        .from('configurator_options')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Opzione eliminata con successo');
      fetchData();
    } catch (error) {
      console.error('Error deleting option:', error);
      toast.error('Errore nell\'eliminazione dell\'opzione');
    }
  };

  const handleUpdateQuoteStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('configurator_quotes')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      toast.success('Status aggiornato');
      fetchData();
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('Errore nell\'aggiornamento');
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
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Gestione Configuratore</h1>

        {ovens.length === 0 && (
          <InitConfiguratorData />
        )}

        <Tabs defaultValue="ovens">
          <TabsList className="mb-6">
            <TabsTrigger value="ovens">Forni</TabsTrigger>
            <TabsTrigger value="options">Opzioni</TabsTrigger>
            <TabsTrigger value="quotes">Preventivi</TabsTrigger>
          </TabsList>

          {/* OVENS TAB */}
          <TabsContent value="ovens">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Forni Configurabili</CardTitle>
                    <CardDescription>Gestisci i modelli di forni disponibili nel configuratore</CardDescription>
                  </div>
                  <Dialog open={showOvenModal} onOpenChange={(open) => {
                    setShowOvenModal(open);
                    if (!open) resetOvenForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Aggiungi Forno
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingOven ? 'Modifica Forno' : 'Aggiungi Forno'}</DialogTitle>
                        <DialogDescription>Inserisci i dettagli del forno</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Nome Forno *</Label>
                          <Input value={ovenName} onChange={(e) => setOvenName(e.target.value)} />
                        </div>
                        <div>
                          <Label>Categoria *</Label>
                          <Input value={ovenCategory} onChange={(e) => setOvenCategory(e.target.value)} placeholder="es: Tradizionale, Gas, Rotativo" />
                        </div>
                        <div>
                          <Label>URL Immagine *</Label>
                          <Input value={ovenImageUrl} onChange={(e) => setOvenImageUrl(e.target.value)} placeholder="/lovable-uploads/..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Prezzo Base (€) *</Label>
                            <Input type="number" value={ovenBasePrice} onChange={(e) => setOvenBasePrice(e.target.value)} />
                          </div>
                          <div>
                            <Label>Tempo Consegna (settimane) *</Label>
                            <Input type="number" value={ovenDeliveryTime} onChange={(e) => setOvenDeliveryTime(e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <Label>Diametri Disponibili * (separati da virgola)</Label>
                          <Input value={ovenDiameters} onChange={(e) => setOvenDiameters(e.target.value)} placeholder="80cm, 100cm, 120cm" />
                        </div>
                        <div>
                          <Label>Descrizione</Label>
                          <Textarea value={ovenDescription} onChange={(e) => setOvenDescription(e.target.value)} rows={3} />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="oven-active" checked={ovenIsActive} onCheckedChange={(checked) => setOvenIsActive(checked as boolean)} />
                          <Label htmlFor="oven-active">Attivo</Label>
                        </div>
                        <Button onClick={handleSaveOven} className="w-full">
                          {editingOven ? 'Aggiorna' : 'Aggiungi'} Forno
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Prezzo Base</TableHead>
                      <TableHead>Consegna</TableHead>
                      <TableHead>Diametri</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ovens.map((oven) => (
                      <TableRow key={oven.id}>
                        <TableCell className="font-medium">{oven.name}</TableCell>
                        <TableCell>{oven.category}</TableCell>
                        <TableCell>€{oven.base_price}</TableCell>
                        <TableCell>{oven.delivery_time_weeks} sett.</TableCell>
                        <TableCell>{oven.diameters.join(', ')}</TableCell>
                        <TableCell>
                          <Badge variant={oven.is_active ? 'default' : 'secondary'}>
                            {oven.is_active ? 'Attivo' : 'Inattivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditOven(oven)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteOven(oven.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OPTIONS TAB */}
          <TabsContent value="options">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Opzioni Aggiuntive</CardTitle>
                    <CardDescription>Gestisci le opzioni come montaggio e conversione a gas</CardDescription>
                  </div>
                  <Dialog open={showOptionModal} onOpenChange={(open) => {
                    setShowOptionModal(open);
                    if (!open) resetOptionForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Aggiungi Opzione
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingOption ? 'Modifica Opzione' : 'Aggiungi Opzione'}</DialogTitle>
                        <DialogDescription>Inserisci i dettagli dell'opzione</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Nome Opzione *</Label>
                          <Input value={optionName} onChange={(e) => setOptionName(e.target.value)} />
                        </div>
                        <div>
                          <Label>Tipo *</Label>
                          <Select value={optionType} onValueChange={setOptionType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="installation">Montaggio</SelectItem>
                              <SelectItem value="gas">Conversione Gas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Prezzo (€) *</Label>
                          <Input type="number" value={optionPrice} onChange={(e) => setOptionPrice(e.target.value)} />
                        </div>
                        <div>
                          <Label>Descrizione</Label>
                          <Textarea value={optionDescription} onChange={(e) => setOptionDescription(e.target.value)} rows={2} />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="option-active" checked={optionIsActive} onCheckedChange={(checked) => setOptionIsActive(checked as boolean)} />
                          <Label htmlFor="option-active">Attivo</Label>
                        </div>
                        <Button onClick={handleSaveOption} className="w-full">
                          {editingOption ? 'Aggiorna' : 'Aggiungi'} Opzione
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Prezzo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {options.map((option) => (
                      <TableRow key={option.id}>
                        <TableCell className="font-medium">{option.name}</TableCell>
                        <TableCell>{option.type}</TableCell>
                        <TableCell>€{option.price}</TableCell>
                        <TableCell>
                          <Badge variant={option.is_active ? 'default' : 'secondary'}>
                            {option.is_active ? 'Attivo' : 'Inattivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditOption(option)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteOption(option.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QUOTES TAB */}
          <TabsContent value="quotes">
            <Card>
              <CardHeader>
                <CardTitle>Preventivi Ricevuti</CardTitle>
                <CardDescription>Visualizza e gestisci i preventivi richiesti dai clienti</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Contatti</TableHead>
                      <TableHead>Configurazione</TableHead>
                      <TableHead>Totale</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell>{new Date(quote.created_at).toLocaleDateString('it-IT')}</TableCell>
                        <TableCell>{quote.customer_name || 'N/A'}</TableCell>
                        <TableCell className="text-sm">
                          {quote.customer_email && <div>{quote.customer_email}</div>}
                          {quote.customer_phone && <div>{quote.customer_phone}</div>}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>Diametro: {quote.diameter}</div>
                          {quote.has_installation && <div>+ Montaggio</div>}
                          {quote.has_gas && <div>+ Gas</div>}
                        </TableCell>
                        <TableCell className="font-bold">€{quote.total_price}</TableCell>
                        <TableCell>
                          <Select value={quote.status} onValueChange={(status) => handleUpdateQuoteStatus(quote.id, status)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">In Attesa</SelectItem>
                              <SelectItem value="sent">Inviato</SelectItem>
                              <SelectItem value="accepted">Accettato</SelectItem>
                              <SelectItem value="rejected">Rifiutato</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminConfigurator;