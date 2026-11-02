import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Package, Loader2, Search } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

interface Burner {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  specifications: any;
  created_at: string;
}

const ERPBruciatori = () => {
  const [burners, setBurners] = useState<Burner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Burner | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => { fetchBurners(); }, []);

  const fetchBurners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('burners')
      .select('*')
      .order('name', { ascending: true });
    if (error) toast.error('Errore caricamento bruciatori');
    setBurners(data || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setPrice('');
    setImageUrl('');
    setIsActive(true);
    setShowForm(true);
  };

  const openEdit = (b: Burner) => {
    setEditing(b);
    setName(b.name);
    setDescription(b.description || '');
    setPrice(b.price.toString());
    setImageUrl(b.image_url || '');
    setIsActive(b.is_active);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Inserisci un nome'); return; }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        price: parseFloat(price) || 0,
        image_url: imageUrl.trim() || null,
        is_active: isActive,
      };

      if (editing) {
        const { error } = await supabase.from('burners').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Bruciatore aggiornato');
      } else {
        const { error } = await supabase.from('burners').insert(payload);
        if (error) throw error;
        toast.success('Bruciatore creato');
      }
      setShowForm(false);
      fetchBurners();
    } catch (e: any) {
      toast.error('Errore: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo bruciatore?')) return;
    try {
      const { error } = await supabase.from('burners').delete().eq('id', id);
      if (error) throw error;
      toast.success('Bruciatore eliminato');
      fetchBurners();
    } catch (e: any) {
      toast.error('Errore: ' + e.message);
    }
  };

  const toggleActive = async (b: Burner) => {
    const { error } = await supabase.from('burners').update({ is_active: !b.is_active }).eq('id', b.id);
    if (error) { toast.error('Errore'); return; }
    fetchBurners();
  };

  const filtered = burners.filter(b => {
    if (!searchTerm) return true;
    return b.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (

    <>
      <SEOHead title="ERP Bruciatori | Vesuviano" description="Gestione bruciatori ERP." lang="it" noIndex />
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-7 h-7 text-green-400" />
          <h1 className="text-2xl font-bold text-foreground">Gestione Bruciatori</h1>
          <Badge variant="secondary" className="ml-2">{burners.length}</Badge>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Nuovo Bruciatore
        </Button>
      </div>

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Cerca bruciatore..."
          className="pl-10 bg-card border-border text-foreground"
        />
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-primary">Immagine</TableHead>
                <TableHead className="text-primary">Nome</TableHead>
                <TableHead className="text-primary">Descrizione</TableHead>
                <TableHead className="text-primary">Prezzo</TableHead>
                <TableHead className="text-primary">Stato</TableHead>
                <TableHead className="text-primary">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(b => (
                <TableRow key={b.id} className="border-border hover:bg-muted/60">
                  <TableCell>
                    {b.image_url ? (
                      <img src={b.image_url} alt={b.name} className="w-14 h-14 object-cover rounded-lg" />
                    ) : (
                      <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{b.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">{b.description || '-'}</TableCell>
                  <TableCell className="text-foreground font-medium">€{b.price.toLocaleString('it-IT')}</TableCell>
                  <TableCell>
                    <Badge
                      className={`cursor-pointer ${b.is_active ? 'bg-green-700/30 text-green-300' : 'bg-muted text-muted-foreground'}`}
                      onClick={() => toggleActive(b)}
                    >
                      {b.is_active ? 'Attivo' : 'Inattivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(b)} className="text-primary hover:text-foreground">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(b.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    {searchTerm ? 'Nessun bruciatore trovato' : 'Nessun bruciatore nel catalogo'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifica Bruciatore' : 'Nuovo Bruciatore'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-primary">Nome *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} className="bg-card border-border text-foreground" />
            </div>
            <div>
              <Label className="text-primary">Descrizione</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} className="bg-card border-border text-foreground" />
            </div>
            <div>
              <Label className="text-primary">Prezzo (€)</Label>
              <Input type="number" value={price} onChange={e => setPrice(e.target.value)} className="bg-card border-border text-foreground" />
            </div>
            <div>
              <Label className="text-primary">URL Immagine</Label>
              <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="bg-card border-border text-foreground" />
              {imageUrl && <img src={imageUrl} alt="preview" className="w-20 h-20 object-cover rounded mt-2" />}
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label className="text-primary">Attivo</Label>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary hover:bg-primary/90">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? 'Salva Modifiche' : 'Crea Bruciatore'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};

export default ERPBruciatori;
