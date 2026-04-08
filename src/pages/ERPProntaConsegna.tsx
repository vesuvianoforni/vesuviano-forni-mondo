import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Search, PackageCheck, Loader2, Upload, ShoppingCart, X, Image } from 'lucide-react';

interface ReadyToShipOven {
  id: string;
  oven_id: string | null;
  model_name: string;
  custom_title: string | null;
  diameter: number;
  coating: string | null;
  fuel_type: string | null;
  description: string | null;
  list_price: number;
  sale_price: number | null;
  images: string[];
  is_sold: boolean;
  sold_at: string | null;
  created_at: string;
}

const ERPProntaConsegna = () => {
  const [items, setItems] = useState<ReadyToShipOven[]>([]);
  const [ovens, setOvens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<ReadyToShipOven | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: rts }, { data: ovensData }] = await Promise.all([
      supabase.from('ready_to_ship_ovens').select('*').order('created_at', { ascending: false }),
      supabase.from('configurator_ovens').select('*').eq('is_active', true).order('model_name'),
    ]);
    setItems((rts as ReadyToShipOven[]) || []);
    setOvens(ovensData || []);
    setLoading(false);
  };

  const toggleSold = async (item: ReadyToShipOven) => {
    const newSold = !item.is_sold;
    const { error } = await supabase.from('ready_to_ship_ovens').update({
      is_sold: newSold,
      sold_at: newSold ? new Date().toISOString() : null,
    }).eq('id', item.id);
    if (error) { toast.error('Errore'); return; }
    toast.success(newSold ? 'Segnato come venduto' : 'Rimesso in vendita');
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo forno pronta consegna?')) return;
    const { error } = await supabase.from('ready_to_ship_ovens').delete().eq('id', id);
    if (error) { toast.error('Errore'); return; }
    toast.success('Eliminato');
    fetchAll();
  };

  const filtered = items.filter(i => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return i.model_name.toLowerCase().includes(s) || i.coating?.toLowerCase().includes(s) || i.fuel_type?.toLowerCase().includes(s);
  });

  const formatPrice = (val: number | null) => val ? `€${val.toLocaleString('it-IT')}` : '—';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <PackageCheck className="w-7 h-7 text-green-400" />
          <h1 className="text-2xl font-bold text-amber-100">Pronta Consegna</h1>
          <Badge variant="secondary" className="ml-2">{items.length}</Badge>
          <Badge className="bg-green-700/30 text-green-300 ml-1">{items.filter(i => !i.is_sold).length} disponibili</Badge>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="w-4 h-4 mr-2" /> Aggiungi Forno
        </Button>
      </div>

      <div className="relative max-w-md mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Cerca per modello, rivestimento..."
          className="pl-10 bg-[#1a1a1a] border-amber-900/20 text-amber-100"
        />
      </div>

      <Card className="bg-[#1a1a1a] border-amber-900/20">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-amber-900/20">
                <TableHead className="text-amber-400">Foto</TableHead>
                <TableHead className="text-amber-400">Modello</TableHead>
                <TableHead className="text-amber-400">Diametro</TableHead>
                <TableHead className="text-amber-400">Rivestimento</TableHead>
                <TableHead className="text-amber-400">Alimentazione</TableHead>
                <TableHead className="text-amber-400">Prezzo Listino</TableHead>
                <TableHead className="text-amber-400">Prezzo Scontato</TableHead>
                <TableHead className="text-amber-400">Stato</TableHead>
                <TableHead className="text-amber-400">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => (
                <TableRow key={item.id} className="border-amber-900/10 hover:bg-amber-900/5">
                  <TableCell>
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.model_name} className="w-14 h-14 object-cover rounded-lg" />
                    ) : (
                      <div className="w-14 h-14 bg-amber-900/10 rounded-lg flex items-center justify-center">
                        <Image className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-amber-100">{item.model_name}</TableCell>
                  <TableCell className="text-amber-200">{item.diameter}cm</TableCell>
                  <TableCell className="text-amber-200">{item.coating || '—'}</TableCell>
                  <TableCell className="text-amber-200">{item.fuel_type || '—'}</TableCell>
                  <TableCell className="text-amber-200">{formatPrice(item.list_price)}</TableCell>
                  <TableCell className="text-green-300 font-medium">
                    {item.sale_price ? formatPrice(item.sale_price) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`cursor-pointer ${item.is_sold ? 'bg-red-700/30 text-red-300' : 'bg-green-700/30 text-green-300'}`}
                      onClick={() => toggleSold(item)}
                    >
                      {item.is_sold ? 'Venduto' : 'Disponibile'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(item)} className="text-amber-400 hover:text-amber-200">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                    {searchTerm ? 'Nessun risultato' : 'Nessun forno pronta consegna'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddEditModal
        open={showAdd || !!editing}
        item={editing}
        ovens={ovens}
        onClose={() => { setShowAdd(false); setEditing(null); }}
        onSaved={fetchAll}
      />
    </div>
  );
};

// --- Add/Edit Modal ---
interface AddEditModalProps {
  open: boolean;
  item: ReadyToShipOven | null;
  ovens: any[];
  onClose: () => void;
  onSaved: () => void;
}

const AddEditModal = ({ open, item, ovens, onClose, onSaved }: AddEditModalProps) => {
  const [form, setForm] = useState({
    model_name: '',
    oven_id: '' as string,
    diameter: 0,
    coating: '',
    fuel_type: '',
    description: '',
    list_price: 0,
    sale_price: null as number | null,
    images: [] as string[],
    delivery_price: 0,
    delivery_description: '',
  });
  const [uploading, setUploading] = useState(false);

  const isEditing = !!item;

  useEffect(() => {
    if (item) {
      setForm({
        model_name: item.model_name,
        oven_id: item.oven_id || '',
        diameter: item.diameter,
        coating: item.coating || '',
        fuel_type: item.fuel_type || '',
        description: item.description || '',
        list_price: item.list_price,
        sale_price: item.sale_price,
        images: item.images || [],
        delivery_price: (item as any).delivery_price || 0,
        delivery_description: (item as any).delivery_description || '',
      });
    } else {
      setForm({ model_name: '', oven_id: '', diameter: 0, coating: '', fuel_type: '', description: '', list_price: 0, sale_price: null, images: [], delivery_price: 0, delivery_description: '' });
    }
  }, [item, open]);

  // Get unique model names from ovens
  const modelNames = [...new Set(ovens.map(o => o.model_name))];

  // When a model is selected, get available sizes
  const selectedOvens = ovens.filter(o => o.model_name === form.model_name);
  const availableSizes = selectedOvens.length > 0 && selectedOvens[0].sizes?.length > 0
    ? selectedOvens[0].sizes
    : [];

  const selectedSize = availableSizes.find((s: any) => s.diameter === form.diameter);
  const availableCoatings = selectedSize?.coatings || [];

  const handleModelChange = (modelName: string) => {
    const oven = ovens.find(o => o.model_name === modelName);
    setForm(prev => ({
      ...prev,
      model_name: modelName,
      oven_id: oven?.id || '',
      diameter: 0,
      coating: '',
      fuel_type: oven?.fuel_type?.[0] || '',
    }));
  };

  const handleSizeChange = (diameter: string) => {
    setForm(prev => ({ ...prev, diameter: parseInt(diameter), coating: '' }));
  };

  const handleCoatingChange = (coatingName: string) => {
    const coating = availableCoatings.find((c: any) => c.name === coatingName);
    setForm(prev => ({
      ...prev,
      coating: coatingName,
      list_price: coating?.prices?.listA?.base || prev.list_price,
    }));
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `rts_${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('oven-gallery').upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('oven-gallery').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadImage(file);
        urls.push(url);
      }
      setForm(prev => ({ ...prev, images: [...prev.images, ...urls] }));
      toast.success(`${urls.length} foto caricate`);
    } catch {
      toast.error('Errore nel caricamento');
    }
    setUploading(false);
  };

  const removeImage = (idx: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.model_name || !form.diameter) {
      toast.error('Inserisci modello e dimensione');
      return;
    }

    const payload = {
      model_name: form.model_name,
      oven_id: form.oven_id || null,
      diameter: form.diameter,
      coating: form.coating || null,
      fuel_type: form.fuel_type || null,
      description: form.description || null,
      list_price: form.list_price,
      sale_price: form.sale_price,
      images: form.images,
      delivery_price: form.delivery_price || 0,
      delivery_description: form.delivery_description || null,
    };

    try {
      if (isEditing && item) {
        const { error } = await supabase.from('ready_to_ship_ovens').update(payload).eq('id', item.id);
        if (error) throw error;
        toast.success('Aggiornato');
      } else {
        const { error } = await supabase.from('ready_to_ship_ovens').insert(payload);
        if (error) throw error;
        toast.success('Forno pronta consegna aggiunto');
      }
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error('Errore: ' + e.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifica Pronta Consegna' : 'Aggiungi Pronta Consegna'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Model selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Modello *</Label>
              <Select value={form.model_name} onValueChange={handleModelChange}>
                <SelectTrigger><SelectValue placeholder="Seleziona modello" /></SelectTrigger>
                <SelectContent>
                  {modelNames.map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Alimentazione</Label>
              <Select value={form.fuel_type} onValueChange={v => setForm(prev => ({ ...prev, fuel_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                <SelectContent>
                  {selectedOvens[0]?.fuel_type?.map((ft: string) => (
                    <SelectItem key={ft} value={ft}>{ft}</SelectItem>
                  )) || <SelectItem value="Legna">Legna</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Size + Coating */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Dimensione *</Label>
              <Select value={form.diameter ? String(form.diameter) : ''} onValueChange={handleSizeChange}>
                <SelectTrigger><SelectValue placeholder="Seleziona dimensione" /></SelectTrigger>
                <SelectContent>
                  {availableSizes.map((s: any) => (
                    <SelectItem key={s.diameter} value={String(s.diameter)}>Ø {s.diameter}cm</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rivestimento</Label>
              <Select value={form.coating} onValueChange={handleCoatingChange}>
                <SelectTrigger><SelectValue placeholder="Seleziona rivestimento" /></SelectTrigger>
                <SelectContent>
                  {availableCoatings.map((c: any) => (
                    <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prezzo di Listino (€)</Label>
              <Input
                type="number"
                value={form.list_price || ''}
                onChange={e => setForm(prev => ({ ...prev, list_price: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label>Prezzo Scontato (€) <span className="text-xs text-muted-foreground">opzionale</span></Label>
              <Input
                type="number"
                value={form.sale_price ?? ''}
                onChange={e => setForm(prev => ({ ...prev, sale_price: e.target.value ? parseFloat(e.target.value) : null }))}
              />
            </div>
          </div>

          {/* Delivery */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prezzo Consegna (€)</Label>
              <Input
                type="number"
                value={form.delivery_price || ''}
                onChange={e => setForm(prev => ({ ...prev, delivery_price: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Descrizione Consegna</Label>
              <Input
                value={form.delivery_description}
                onChange={e => setForm(prev => ({ ...prev, delivery_description: e.target.value }))}
                placeholder="es. Consegna in tutta Italia"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>Descrizione</Label>
            <Textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              placeholder="Note, condizioni, dettagli..."
            />
          </div>

          {/* Images */}
          <div>
            <Label className="flex items-center gap-1 mb-2"><Image className="w-4 h-4" /> Foto del forno</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.images.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-border" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div
              className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => document.getElementById('rts-img-upload')?.click()}
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" /> Carica foto (anche multiple)
                </div>
              )}
            </div>
            <input id="rts-img-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1 bg-amber-600 hover:bg-amber-700">
              {isEditing ? 'Salva Modifiche' : 'Aggiungi'}
            </Button>
            <Button variant="outline" onClick={onClose}>Annulla</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ERPProntaConsegna;
