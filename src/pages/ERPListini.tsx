import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { DollarSign, Save, Loader2, Search, ChevronDown, ChevronRight, Flame } from 'lucide-react';

type PriceListCode = 'A' | 'B' | 'C';
type PriceField = 'base' | 'gas' | 'electric' | 'onSite';

const PRICE_LISTS: { code: PriceListCode; name: string }[] = [
  { code: 'A', name: 'Listino A' },
  { code: 'B', name: 'Listino B' },
  { code: 'C', name: 'Listino C' },
];

const ERPListini = () => {
  const [ovens, setOvens] = useState<any[]>([]);
  const [burners, setBurners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOven, setExpandedOven] = useState<string | null>(null);
  const [editedPrices, setEditedPrices] = useState<Record<string, any>>({});
  const [editedBurnerPrices, setEditedBurnerPrices] = useState<Record<string, number>>({});

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [ovensRes, burnersRes] = await Promise.all([
      supabase.from('configurator_ovens').select('*').order('model_name', { ascending: true }),
      supabase.from('burners').select('*').eq('is_active', true).order('name'),
    ]);
    if (ovensRes.error) toast.error('Errore caricamento forni');
    if (burnersRes.error) toast.error('Errore caricamento bruciatori');
    setOvens(ovensRes.data || []);
    setBurners(burnersRes.data || []);
    setLoading(false);
  };

  const handlePriceChange = (ovenId: string, sizeIdx: number, coatingIdx: number, list: PriceListCode, field: PriceField, value: string) => {
    const key = `${ovenId}`;
    const current = editedPrices[key] || {};
    const sizeKey = `s${sizeIdx}_c${coatingIdx}_${list}_${field}`;
    setEditedPrices(prev => ({
      ...prev,
      [key]: { ...current, [sizeKey]: value === '' ? '' : Number(value) }
    }));
  };

  const handleBurnerPriceChange = (burnerId: string, value: string) => {
    setEditedBurnerPrices(prev => ({
      ...prev,
      [burnerId]: value === '' ? 0 : Number(value),
    }));
  };

  const saveOvenPrices = async (oven: any) => {
    const changes = editedPrices[oven.id];
    if (!changes || Object.keys(changes).length === 0) {
      toast.info('Nessuna modifica da salvare');
      return;
    }

    setSaving(oven.id);
    try {
      const updatedSizes = JSON.parse(JSON.stringify(oven.sizes || []));

      for (const [key, value] of Object.entries(changes)) {
        const match = key.match(/^s(\d+)_c(\d+)_([ABC])_(\w+)$/);
        if (!match) continue;
        const [, sIdx, cIdx, list, field] = match;
        const listKey = `list${list}`;
        if (updatedSizes[+sIdx]?.coatings?.[+cIdx]) {
          if (!updatedSizes[+sIdx].coatings[+cIdx].prices) {
            updatedSizes[+sIdx].coatings[+cIdx].prices = {};
          }
          if (!updatedSizes[+sIdx].coatings[+cIdx].prices[listKey]) {
            updatedSizes[+sIdx].coatings[+cIdx].prices[listKey] = {};
          }
          updatedSizes[+sIdx].coatings[+cIdx].prices[listKey][field] = value;
        }
      }

      const { error } = await supabase
        .from('configurator_ovens')
        .update({ sizes: updatedSizes })
        .eq('id', oven.id);

      if (error) throw error;

      // Update local state
      setOvens(prev => prev.map(o => o.id === oven.id ? { ...o, sizes: updatedSizes } : o));
      setEditedPrices(prev => { const n = { ...prev }; delete n[oven.id]; return n; });
      toast.success(`Prezzi ${oven.model_name} salvati`);
    } catch (e: any) {
      toast.error('Errore salvataggio: ' + e.message);
    } finally {
      setSaving(null);
    }
  };

  const saveBurnerPrice = async (burner: any) => {
    if (editedBurnerPrices[burner.id] === undefined) {
      toast.info('Nessuna modifica');
      return;
    }
    setSaving(burner.id);
    try {
      const { error } = await supabase
        .from('burners')
        .update({ price: editedBurnerPrices[burner.id] })
        .eq('id', burner.id);
      if (error) throw error;
      setBurners(prev => prev.map(b => b.id === burner.id ? { ...b, price: editedBurnerPrices[burner.id] } : b));
      setEditedBurnerPrices(prev => { const n = { ...prev }; delete n[burner.id]; return n; });
      toast.success(`Prezzo ${burner.name} salvato`);
    } catch (e: any) {
      toast.error('Errore: ' + e.message);
    } finally {
      setSaving(null);
    }
  };

  const filtered = ovens.filter(o => {
    if (!searchTerm) return true;
    return o.model_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getVal = (ovenId: string, sizeIdx: number, coatingIdx: number, list: PriceListCode, field: PriceField, originalVal: number) => {
    const key = `s${sizeIdx}_c${coatingIdx}_${list}_${field}`;
    const edited = editedPrices[ovenId]?.[key];
    return edited !== undefined ? edited : (originalVal || '');
  };

  const hasChanges = (ovenId: string) => {
    const c = editedPrices[ovenId];
    return c && Object.keys(c).length > 0;
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
          <DollarSign className="w-7 h-7 text-amber-400" />
          <h1 className="text-2xl font-bold text-amber-100">Gestione Listini</h1>
          <Badge variant="secondary" className="ml-2">{ovens.length} forni</Badge>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cerca modello..."
            className="pl-10 bg-[#1a1a1a] border-amber-900/20 text-amber-100"
          />
        </div>
      </div>

      {/* Forni Prices */}
      <h2 className="text-lg font-semibold text-amber-200 mb-3 flex items-center gap-2">
        <Flame className="w-5 h-5" /> Forni
      </h2>

      <div className="space-y-3 mb-10">
        {filtered.map(oven => {
          const isExpanded = expandedOven === oven.id;
          const hasSizes = oven.sizes?.length > 0 && oven.sizes.some((s: any) => s.coatings?.length > 0);

          return (
            <Card key={oven.id} className="bg-[#1a1a1a] border-amber-900/20">
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-amber-900/5 transition-colors"
                onClick={() => setExpandedOven(isExpanded ? null : oven.id)}
              >
                <div className="flex items-center gap-3">
                  {hasSizes ? (
                    isExpanded ? <ChevronDown className="w-4 h-4 text-amber-400" /> : <ChevronRight className="w-4 h-4 text-gray-500" />
                  ) : <div className="w-4" />}
                  {oven.image_url && (
                    <img src={oven.image_url} alt={oven.model_name} className="w-10 h-10 object-cover rounded-lg" />
                  )}
                  <div>
                    <span className="font-medium text-amber-100">{oven.model_name}</span>
                    <div className="flex gap-1 mt-0.5">
                      {Array.isArray(oven.fuel_type) && oven.fuel_type.filter(Boolean).map((f: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-[10px] border-amber-700/30 text-amber-300 py-0">{f}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasChanges(oven.id) && (
                    <Button
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); saveOvenPrices(oven); }}
                      disabled={saving === oven.id}
                      className="bg-amber-600 hover:bg-amber-700 text-xs"
                    >
                      {saving === oven.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                      Salva
                    </Button>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {oven.sizes?.length || 0} taglie
                  </Badge>
                </div>
              </div>

              {isExpanded && hasSizes && (
                <CardContent className="pt-0 pb-4 px-4">
                  {oven.sizes.map((size: any, sIdx: number) => (
                    <div key={sIdx} className="mb-4 last:mb-0">
                      <div className="text-amber-300 font-semibold text-sm mb-2 flex items-center gap-2">
                        Ø {size.diameter}cm — {size.pizza_capacity} pizze
                        {size.can_be_built_on_site && <Badge className="bg-blue-700/20 text-blue-300 text-[10px]">Sul posto</Badge>}
                      </div>

                      {size.coatings?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-gray-400 text-xs border-b border-amber-900/10">
                                <th className="text-left py-1.5 pr-3 w-40">Rivestimento</th>
                                {PRICE_LISTS.map(pl => (
                                  <th key={pl.code} colSpan={size.can_be_built_on_site ? 4 : 3} className="text-center py-1.5 px-1 border-l border-amber-900/10">
                                    {pl.name}
                                  </th>
                                ))}
                              </tr>
                              <tr className="text-gray-500 text-[10px] uppercase tracking-wider">
                                <th></th>
                                {PRICE_LISTS.map(pl => (
                                  <React.Fragment key={pl.code}>
                                    <th className="text-center py-1 px-1 border-l border-amber-900/10">Base</th>
                                    <th className="text-center py-1 px-1">Gas</th>
                                    <th className="text-center py-1 px-1">Elett.</th>
                                    {size.can_be_built_on_site && <th className="text-center py-1 px-1">Posto</th>}
                                  </React.Fragment>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {size.coatings.map((c: any, cIdx: number) => (
                                <tr key={cIdx} className="border-t border-amber-900/10">
                                  <td className="py-1.5 pr-3 text-amber-100 flex items-center gap-2">
                                    {c.image_url && <img src={c.image_url} alt={c.name} className="w-7 h-7 rounded object-cover flex-shrink-0" />}
                                    <span className="truncate text-xs">{c.name}</span>
                                  </td>
                                  {PRICE_LISTS.map(pl => {
                                    const prices = c.prices?.[`list${pl.code}`] || {};
                                    const fields: PriceField[] = size.can_be_built_on_site
                                      ? ['base', 'gas', 'electric', 'onSite']
                                      : ['base', 'gas', 'electric'];
                                    return (
                                      <React.Fragment key={pl.code}>
                                        {fields.map((field, fIdx) => (
                                          <td key={field} className={`py-1 px-0.5 ${fIdx === 0 ? 'border-l border-amber-900/10' : ''}`}>
                                            <Input
                                              type="number"
                                              value={getVal(oven.id, sIdx, cIdx, pl.code, field, prices[field])}
                                              onChange={(e) => handlePriceChange(oven.id, sIdx, cIdx, pl.code, field, e.target.value)}
                                              className="h-7 text-xs text-center bg-[#111] border-amber-900/15 text-amber-100 w-[72px] px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                              placeholder="—"
                                            />
                                          </td>
                                        ))}
                                      </React.Fragment>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs">Nessun rivestimento configurato</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center py-12 text-gray-500">
            {searchTerm ? 'Nessun forno trovato' : 'Nessun forno nel catalogo'}
          </p>
        )}
      </div>

      {/* Bruciatori Prices */}
      {burners.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-amber-200 mb-3 flex items-center gap-2">
            <Flame className="w-5 h-5" /> Bruciatori
          </h2>
          <Card className="bg-[#1a1a1a] border-amber-900/20">
            <CardContent className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs border-b border-amber-900/10">
                    <th className="text-left py-2">Bruciatore</th>
                    <th className="text-center py-2 w-32">Prezzo (€)</th>
                    <th className="w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {burners.map(b => (
                    <tr key={b.id} className="border-t border-amber-900/10">
                      <td className="py-2 text-amber-100 flex items-center gap-2">
                        {b.image_url && <img src={b.image_url} alt={b.name} className="w-8 h-8 rounded object-cover" />}
                        {b.name}
                      </td>
                      <td className="py-2 text-center">
                        <Input
                          type="number"
                          value={editedBurnerPrices[b.id] !== undefined ? editedBurnerPrices[b.id] : b.price}
                          onChange={(e) => handleBurnerPriceChange(b.id, e.target.value)}
                          className="h-7 text-xs text-center bg-[#111] border-amber-900/15 text-amber-100 w-24 mx-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </td>
                      <td className="py-2 text-right">
                        {editedBurnerPrices[b.id] !== undefined && (
                          <Button size="sm" onClick={() => saveBurnerPrice(b)} disabled={saving === b.id} className="bg-amber-600 hover:bg-amber-700 text-xs h-7">
                            {saving === b.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ERPListini;
