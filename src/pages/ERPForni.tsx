import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import EditOvenModal from '@/components/admin/EditOvenModal';
import { AddOvenModal } from '@/components/admin/AddOvenModal';
import { Plus, Trash2, Edit, Search, Flame, Loader2, ChevronDown, ChevronRight, DollarSign, FileText } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

const PRICE_LISTS = [
  { code: 'A', name: 'Listino A' },
  { code: 'B', name: 'Listino B' },
  { code: 'C', name: 'Listino C' },
];

const ERPForni = () => {
  const [ovens, setOvens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOven, setEditingOven] = useState<any>(null);
  const [showAddOven, setShowAddOven] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriceList, setSelectedPriceList] = useState('A');
  const [expandedOven, setExpandedOven] = useState<string | null>(null);

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

  const listKey = `list${selectedPriceList}` as 'listA' | 'listB' | 'listC';

  const getBasePrice = (oven: any) => {
    if (oven.sizes?.length > 0 && oven.sizes[0].coatings?.length > 0) {
      return oven.sizes[0].coatings[0].prices?.[listKey]?.base || 0;
    }
    const key = `base_price_${selectedPriceList.toLowerCase()}`;
    return oven[key] || oven.base_price_a || 0;
  };

  const getPriceRange = (oven: any) => {
    let min = Infinity, max = 0;
    if (oven.sizes?.length > 0) {
      for (const size of oven.sizes) {
        for (const coating of (size.coatings || [])) {
          const base = coating.prices?.[listKey]?.base || 0;
          if (base > 0) {
            min = Math.min(min, base);
            max = Math.max(max, base);
          }
        }
      }
    }
    if (min === Infinity) return null;
    if (min === max) return `€${min.toLocaleString('it-IT')}`;
    return `€${min.toLocaleString('it-IT')} — €${max.toLocaleString('it-IT')}`;
  };

  const getSizesInfo = (oven: any) => {
    if (oven.sizes?.length > 0) {
      return oven.sizes.length === 1
        ? `${oven.sizes[0].diameter}cm`
        : `${oven.sizes.length} taglie`;
    }
    return `${oven.diameter}cm`;
  };

  const formatPrice = (val: number) => val ? `€${val.toLocaleString('it-IT')}` : '—';

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

      <div className="flex items-center gap-4 mb-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cerca per modello o alimentazione..."
            className="pl-10 bg-[#1a1a1a] border-amber-900/20 text-amber-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-amber-400" />
          <Select value={selectedPriceList} onValueChange={setSelectedPriceList}>
            <SelectTrigger className="w-[160px] bg-[#1a1a1a] border-amber-900/20 text-amber-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRICE_LISTS.map(pl => (
                <SelectItem key={pl.code} value={pl.code}>{pl.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-[#1a1a1a] border-amber-900/20">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-amber-900/20">
                <TableHead className="text-amber-400 w-8"></TableHead>
                <TableHead className="text-amber-400">Immagine</TableHead>
                <TableHead className="text-amber-400">Modello</TableHead>
                <TableHead className="text-amber-400">Alimentazione</TableHead>
                <TableHead className="text-amber-400">Taglie</TableHead>
                <TableHead className="text-amber-400">Prezzi ({selectedPriceList})</TableHead>
                <TableHead className="text-amber-400">Stato</TableHead>
                <TableHead className="text-amber-400">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(oven => {
                const isExpanded = expandedOven === oven.id;
                const priceRange = getPriceRange(oven);
                return (
                  <React.Fragment key={oven.id}>
                    <TableRow className="border-amber-900/10 hover:bg-amber-900/5 cursor-pointer" onClick={() => setExpandedOven(isExpanded ? null : oven.id)}>
                      <TableCell className="px-2">
                        {oven.sizes?.length > 0 && oven.sizes.some((s: any) => s.coatings?.length > 0) ? (
                          isExpanded ? <ChevronDown className="w-4 h-4 text-amber-400" /> : <ChevronRight className="w-4 h-4 text-gray-500" />
                        ) : null}
                      </TableCell>
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
                      <TableCell className="text-amber-200 font-medium">
                        {priceRange || formatPrice(getBasePrice(oven))}
                      </TableCell>
                      <TableCell>
                        <Badge className={oven.is_active ? 'bg-green-700/30 text-green-300' : 'bg-gray-700/30 text-gray-400'}>
                          {oven.is_active ? 'Attivo' : 'Inattivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <Button size="sm" variant="ghost" onClick={() => setEditingOven(oven)} className="text-amber-400 hover:text-amber-200">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(oven.id)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded price details */}
                    {isExpanded && oven.sizes?.map((size: any, sIdx: number) => (
                      <React.Fragment key={`size-${sIdx}`}>
                        <TableRow className="bg-amber-900/5 border-amber-900/10">
                          <TableCell></TableCell>
                          <TableCell colSpan={7} className="py-2">
                            <div className="text-amber-300 font-semibold text-sm mb-2">
                              Ø {size.diameter}cm — {size.pizza_capacity} pizze
                              {size.can_be_built_on_site && <Badge className="ml-2 bg-blue-700/20 text-blue-300 text-xs">Costruibile sul posto</Badge>}
                              {size.passage_space_cm && <span className="ml-2 text-gray-400 text-xs font-normal">Passaggio: {size.passage_space_cm}cm</span>}
                              {(size.datasheet_url || size.datasheet_urls) && (
                                <span className="ml-2 inline-flex items-center gap-1 text-blue-400 text-xs font-normal">
                                  <FileText className="w-3 h-3" /> 
                                  {(() => {
                                    const urls = size.datasheet_urls || {};
                                    const langs = ['it', 'en', 'fr', 'de', 'es'].filter(l => urls[l] || (l === 'it' && size.datasheet_url));
                                    return langs.map(l => (
                                      <a key={l} href={urls[l] || size.datasheet_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 uppercase underline">
                                        {l}
                                      </a>
                                    ));
                                  })()}
                                </span>
                              )}
                            </div>
                            {size.coatings?.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-gray-400 text-xs">
                                      <th className="text-left py-1 pr-4">Rivestimento</th>
                                      <th className="text-right py-1 px-2">Base</th>
                                      <th className="text-right py-1 px-2">Gas</th>
                                      <th className="text-right py-1 px-2">Elettrico</th>
                                      {size.can_be_built_on_site && <th className="text-right py-1 px-2">Sul Posto</th>}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {size.coatings.map((c: any, cIdx: number) => {
                                      const p = c.prices?.[listKey] || {};
                                      return (

    <>
      <SEOHead title="ERP Forni | Vesuviano" description="Gestione forni ERP." lang="it" noIndex />
      <tr key={cIdx} className="border-t border-amber-900/10">
                                          <td className="py-1.5 pr-4 text-amber-100 flex items-center gap-2">
                                            {c.image_url && <img src={c.image_url} alt={c.name} className="w-8 h-8 rounded object-cover" />}
                                            {c.name}
                                          </td>
                                          <td className="text-right py-1.5 px-2 text-amber-200 font-medium">{formatPrice(p.base)}</td>
                                          <td className="text-right py-1.5 px-2 text-amber-200">{formatPrice(p.gas)}</td>
                                          <td className="text-right py-1.5 px-2 text-amber-200">{formatPrice(p.electric)}</td>
                                          {size.can_be_built_on_site && <td className="text-right py-1.5 px-2 text-amber-200">{formatPrice(p.onSite)}</td>}
                                        </tr>
    </>
  );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-gray-500 text-xs">Nessun rivestimento configurato</p>
                            )}
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-gray-500">
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
