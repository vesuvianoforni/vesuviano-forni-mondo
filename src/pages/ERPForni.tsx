import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import EditOvenModal from '@/components/admin/EditOvenModal';
import { AddOvenModal } from '@/components/admin/AddOvenModal';
import { Plus, Trash2, Edit, Search, Flame, Loader2 } from 'lucide-react';

const ERPForni = () => {
  const [ovens, setOvens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOven, setEditingOven] = useState<any>(null);
  const [showAddOven, setShowAddOven] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchOvens(); }, []);

  const fetchOvens = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('configurator_ovens')
      .select('*')
      .order('model_name', { ascending: true });
    if (error) toast.error('Errore caricamento forni');
    setOvens(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo forno?')) return;
    try {
      await supabase.from('configurator_quotes').delete().eq('oven_id', id);
      const { error } = await supabase.from('configurator_ovens').delete().eq('id', id);
      if (error) throw error;
      toast.success('Forno eliminato');
      fetchOvens();
    } catch (e: any) {
      toast.error('Errore: ' + e.message);
    }
  };

  const filtered = ovens.filter(o => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return o.model_name?.toLowerCase().includes(s) || o.fuel_type?.join(' ').toLowerCase().includes(s);
  });

  const getBasePrice = (oven: any) => {
    if (oven.sizes?.length > 0 && oven.sizes[0].coatings?.length > 0) {
      return oven.sizes[0].coatings[0].prices?.listA?.base || 0;
    }
    return oven.base_price_a || 0;
  };

  const getSizesInfo = (oven: any) => {
    if (oven.sizes?.length > 0) {
      return oven.sizes.length === 1
        ? `${oven.sizes[0].diameter}cm`
        : `${oven.sizes.length} taglie`;
    }
    return `${oven.diameter}cm`;
  };

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
          <Flame className="w-7 h-7 text-orange-400" />
          <h1 className="text-2xl font-bold text-amber-100">Gestione Forni</h1>
          <Badge variant="secondary" className="ml-2">{ovens.length}</Badge>
        </div>
        <Button onClick={() => setShowAddOven(true)} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="w-4 h-4 mr-2" /> Nuovo Forno
        </Button>
      </div>

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Cerca per modello o alimentazione..."
          className="pl-10 bg-[#1a1a1a] border-amber-900/20 text-amber-100"
        />
      </div>

      <Card className="bg-[#1a1a1a] border-amber-900/20">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-amber-900/20">
                <TableHead className="text-amber-400">Immagine</TableHead>
                <TableHead className="text-amber-400">Modello</TableHead>
                <TableHead className="text-amber-400">Alimentazione</TableHead>
                <TableHead className="text-amber-400">Taglie</TableHead>
                <TableHead className="text-amber-400">Prezzo Base</TableHead>
                <TableHead className="text-amber-400">Stato</TableHead>
                <TableHead className="text-amber-400">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(oven => (
                <TableRow key={oven.id} className="border-amber-900/10 hover:bg-amber-900/5">
                  <TableCell>
                    {oven.image_url && (
                      <img src={oven.image_url} alt={oven.model_name} className="w-14 h-14 object-cover rounded-lg" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-amber-100">{oven.model_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(oven.fuel_type) ? oven.fuel_type.filter(Boolean).map((f: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs border-amber-700/30 text-amber-200">{f}</Badge>
                      )) : <span className="text-gray-500">-</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-amber-200">{getSizesInfo(oven)}</TableCell>
                  <TableCell className="text-amber-200 font-medium">€{getBasePrice(oven).toLocaleString('it-IT')}</TableCell>
                  <TableCell>
                    <Badge className={oven.is_active ? 'bg-green-700/30 text-green-300' : 'bg-gray-700/30 text-gray-400'}>
                      {oven.is_active ? 'Attivo' : 'Inattivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditingOven(oven)} className="text-amber-400 hover:text-amber-200">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(oven.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    {searchTerm ? 'Nessun forno trovato' : 'Nessun forno nel catalogo'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditOvenModal
        oven={editingOven}
        open={!!editingOven}
        onClose={() => setEditingOven(null)}
        onUpdate={fetchOvens}
      />
      <AddOvenModal
        open={showAddOven}
        onClose={() => setShowAddOven(false)}
        onSuccess={fetchOvens}
      />
    </div>
  );
};

export default ERPForni;
