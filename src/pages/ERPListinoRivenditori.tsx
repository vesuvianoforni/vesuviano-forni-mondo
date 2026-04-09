import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { DollarSign, Save, Loader2, Search, ChevronDown, ChevronRight, Flame, Download, Globe } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const pdfTranslations: Record<string, Record<string, string>> = {
  it: {
    title: 'Listino Rivenditori',
    subtitle: 'Prezzi riservati — Non divulgare',
    badge: 'RISERVATO',
    updated: 'Aggiornato al',
    confidential: '⚠️ DOCUMENTO RISERVATO — SOLO PER RIVENDITORI AUTORIZZATI',
    size: 'Taglia',
    coating: 'Rivestimento',
    base: 'Base (Legna/Gas)',
    gas: 'Gas',
    electric: 'Elettrico',
    onSite: 'Sul Posto',
    pizzas: 'pizze',
    print: '⬇ Stampa / Salva PDF',
    footer1: 'Vesuviano Forni Napoletani — www.vesuvianoforni.com — info@vesuvianoforni.com',
    footer2: 'Tutti i prezzi sono IVA esclusa. Prezzi soggetti a variazione senza preavviso.',
    success: 'Listino generato! Usa "Salva come PDF" nella finestra di stampa.',
    noData: 'Nessun prezzo rivenditore configurato. Inserisci almeno un prezzo prima di generare il PDF.',
    popupBlocked: 'Popup bloccato. Consenti i popup per scaricare il PDF.',
  },
  en: {
    title: 'Reseller Price List',
    subtitle: 'Reserved prices — Do not disclose',
    badge: 'CONFIDENTIAL',
    updated: 'Updated on',
    confidential: '⚠️ CONFIDENTIAL DOCUMENT — AUTHORIZED RESELLERS ONLY',
    size: 'Size',
    coating: 'Coating',
    base: 'Base (Wood/Gas)',
    gas: 'Gas',
    electric: 'Electric',
    onSite: 'On Site',
    pizzas: 'pizzas',
    print: '⬇ Print / Save PDF',
    footer1: 'Vesuviano Neapolitan Ovens — www.vesuvianoforni.com — info@vesuvianoforni.com',
    footer2: 'All prices are VAT excluded. Prices subject to change without notice.',
    success: 'Price list generated! Use "Save as PDF" in the print dialog.',
    noData: 'No reseller prices configured. Enter at least one price before generating the PDF.',
    popupBlocked: 'Popup blocked. Allow popups to download the PDF.',
  },
  fr: {
    title: 'Tarif Revendeurs',
    subtitle: 'Prix réservés — Ne pas divulguer',
    badge: 'CONFIDENTIEL',
    updated: 'Mis à jour le',
    confidential: '⚠️ DOCUMENT CONFIDENTIEL — REVENDEURS AUTORISÉS UNIQUEMENT',
    size: 'Taille',
    coating: 'Revêtement',
    base: 'Base (Bois/Gaz)',
    gas: 'Gaz',
    electric: 'Électrique',
    onSite: 'Sur Place',
    pizzas: 'pizzas',
    print: '⬇ Imprimer / Enregistrer PDF',
    footer1: 'Vesuviano Fours Napolitains — www.vesuvianoforni.com — info@vesuvianoforni.com',
    footer2: 'Tous les prix sont hors TVA. Prix susceptibles de modification sans préavis.',
    success: 'Tarif généré ! Utilisez "Enregistrer en PDF" dans la fenêtre d\'impression.',
    noData: 'Aucun prix revendeur configuré. Saisissez au moins un prix avant de générer le PDF.',
    popupBlocked: 'Popup bloqué. Autorisez les popups pour télécharger le PDF.',
  },
  es: {
    title: 'Lista de Precios Distribuidores',
    subtitle: 'Precios reservados — No divulgar',
    badge: 'CONFIDENCIAL',
    updated: 'Actualizado el',
    confidential: '⚠️ DOCUMENTO CONFIDENCIAL — SOLO PARA DISTRIBUIDORES AUTORIZADOS',
    size: 'Tamaño',
    coating: 'Revestimiento',
    base: 'Base (Leña/Gas)',
    gas: 'Gas',
    electric: 'Eléctrico',
    onSite: 'En Sitio',
    pizzas: 'pizzas',
    print: '⬇ Imprimir / Guardar PDF',
    footer1: 'Vesuviano Hornos Napolitanos — www.vesuvianoforni.com — info@vesuvianoforni.com',
    footer2: 'Todos los precios son sin IVA. Precios sujetos a cambio sin previo aviso.',
    success: '¡Lista generada! Usa "Guardar como PDF" en la ventana de impresión.',
    noData: 'No hay precios de distribuidor configurados. Ingrese al menos un precio antes de generar el PDF.',
    popupBlocked: 'Popup bloqueado. Permite los popups para descargar el PDF.',
  },
};

const ERPListinoRivenditori = () => {
  const [ovens, setOvens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOven, setExpandedOven] = useState<string | null>(null);
  const [editedPrices, setEditedPrices] = useState<Record<string, any>>({});
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('configurator_ovens')
      .select('*')
      .eq('is_active', true)
      .order('model_name', { ascending: true });
    if (error) toast.error('Errore caricamento forni');
    setOvens(data || []);
    setLoading(false);
  };

  const handlePriceChange = (ovenId: string, sizeIdx: number, coatingIdx: number, field: string, value: string) => {
    const sizeKey = `s${sizeIdx}_c${coatingIdx}_${field}`;
    setEditedPrices(prev => ({
      ...prev,
      [ovenId]: { ...(prev[ovenId] || {}), [sizeKey]: value === '' ? '' : Number(value) }
    }));
  };

  const getResellerPrice = (oven: any, sizeIdx: number, coatingIdx: number, field: string) => {
    const editKey = `s${sizeIdx}_c${coatingIdx}_${field}`;
    if (editedPrices[oven.id]?.[editKey] !== undefined) return editedPrices[oven.id][editKey];
    return oven.sizes?.[sizeIdx]?.coatings?.[coatingIdx]?.prices?.listReseller?.[field] || 0;
  };

  const hasEdits = (ovenId: string) => editedPrices[ovenId] && Object.keys(editedPrices[ovenId]).length > 0;

  const saveOvenPrices = async (oven: any) => {
    if (!hasEdits(oven.id)) return;
    setSaving(oven.id);
    try {
      const sizes = JSON.parse(JSON.stringify(oven.sizes || []));
      const edits = editedPrices[oven.id];

      for (const [key, val] of Object.entries(edits)) {
        const match = key.match(/^s(\d+)_c(\d+)_(.+)$/);
        if (!match) continue;
        const [, sIdx, cIdx, field] = match;
        const size = sizes[Number(sIdx)];
        if (!size) continue;
        const coating = size.coatings?.[Number(cIdx)];
        if (!coating) continue;
        if (!coating.prices) coating.prices = {};
        if (!coating.prices.listReseller) coating.prices.listReseller = { base: 0, gas: 0, electric: 0, onSite: 0 };
        coating.prices.listReseller[field] = Number(val) || 0;
      }

      const { error } = await supabase
        .from('configurator_ovens')
        .update({ sizes })
        .eq('id', oven.id);

      if (error) throw error;
      toast.success(`Prezzi rivenditori salvati per ${oven.model_name}`);
      setEditedPrices(prev => { const n = { ...prev }; delete n[oven.id]; return n; });
      fetchData();
    } catch (e: any) {
      toast.error('Errore salvataggio: ' + e.message);
    }
    setSaving(null);
  };

  const formatPrice = (val: number | string) => {
    if (val === '' || val === undefined || val === null) return '';
    const n = Number(val);
    return n ? `€${n.toLocaleString('it-IT')}` : '—';
  };

  const filtered = ovens.filter(o => {
    if (!searchTerm) return true;
    return o.model_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const generatePDF = useCallback(async (lang: string = 'it') => {
    const t = pdfTranslations[lang] || pdfTranslations.it;
    const dateLocale = lang === 'it' ? 'it-IT' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-GB';
    setGeneratingPdf(true);
    try {
      // Build data for PDF
      const pdfData: any[] = [];
      for (const oven of ovens) {
        if (!oven.sizes?.length) continue;
        const ovenEntry: any = {
          model_name: oven.model_name,
          image_url: oven.image_url,
          fuel_type: oven.fuel_type,
          sizes: []
        };
        for (const size of oven.sizes) {
          const sizeEntry: any = {
            diameter: size.diameter,
            pizza_capacity: size.pizza_capacity,
            coatings: []
          };
          for (const coating of (size.coatings || [])) {
            const resellerPrices = coating.prices?.listReseller || {};
            if (resellerPrices.base || resellerPrices.gas || resellerPrices.electric || resellerPrices.onSite) {
              sizeEntry.coatings.push({
                name: coating.name,
                base: resellerPrices.base || 0,
                gas: resellerPrices.gas || 0,
                electric: resellerPrices.electric || 0,
                onSite: resellerPrices.onSite || 0,
              });
            }
          }
          if (sizeEntry.coatings.length > 0) {
            ovenEntry.sizes.push(sizeEntry);
          }
        }
        if (ovenEntry.sizes.length > 0) {
          pdfData.push(ovenEntry);
        }
      }

      if (pdfData.length === 0) {
        toast.error(t.noData);
        setGeneratingPdf(false);
        return;
      }

      // Generate PDF using html2canvas approach with printable HTML
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error(t.popupBlocked);
        setGeneratingPdf(false);
        return;
      }

      const today = new Date().toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric' });

      let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${t.title} - Vesuviano</title>
      <style>
        @media print { @page { size: A4 landscape; margin: 15mm; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 20px; background: white; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 3px solid #d97706; }
        .header h1 { font-size: 24px; color: #92400e; }
        .header .date { color: #666; font-size: 13px; }
        .header .badge { background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        .model { margin-bottom: 25px; page-break-inside: avoid; }
        .model-header { background: #fffbeb; padding: 10px 15px; border-radius: 8px 8px 0 0; border: 1px solid #fde68a; display: flex; align-items: center; gap: 12px; }
        .model-header h2 { font-size: 16px; color: #78350f; }
        .model-header .fuel { font-size: 11px; color: #92400e; background: #fef3c7; padding: 2px 8px; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #f59e0b; color: white; padding: 8px 10px; text-align: left; font-weight: 600; }
        th:not(:first-child):not(:nth-child(2)) { text-align: right; }
        td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; }
        td:not(:first-child):not(:nth-child(2)) { text-align: right; font-variant-numeric: tabular-nums; }
        tr:nth-child(even) { background: #fefce8; }
        .size-row { background: #f3f4f6 !important; font-weight: 600; }
        .footer { margin-top: 30px; text-align: center; color: #9ca3af; font-size: 11px; border-top: 1px solid #e5e7eb; padding-top: 10px; }
        .confidential { color: #dc2626; font-weight: 600; font-size: 12px; text-align: center; margin-bottom: 20px; }
        .no-print { margin-bottom: 20px; }
        @media print { .no-print { display: none; } }
      </style></head><body>
      <div class="no-print"><button onclick="window.print()" style="padding:10px 24px;background:#d97706;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">${t.print}</button></div>
      <div class="header">
        <div>
          <h1>🔥 Vesuviano — ${t.title}</h1>
          <p style="color:#666;font-size:13px;margin-top:4px;">${t.subtitle}</p>
        </div>
        <div style="text-align:right;">
          <span class="badge">${t.badge}</span>
          <p class="date" style="margin-top:6px;">${t.updated} ${today}</p>
        </div>
      </div>
      <p class="confidential">${t.confidential}</p>`;

      for (const oven of pdfData) {
        html += `<div class="model">
          <div class="model-header">
            <h2>${oven.model_name}</h2>
            ${(oven.fuel_type || []).map((f: string) => `<span class="fuel">${f}</span>`).join('')}
          </div>
          <table>
            <thead><tr>
              <th>${t.size}</th>
              <th>${t.coating}</th>
              <th>${t.base}</th>
              <th>${t.gas}</th>
              <th>${t.electric}</th>
              <th>${t.onSite}</th>
            </tr></thead><tbody>`;

        for (const size of oven.sizes) {
          for (let i = 0; i < size.coatings.length; i++) {
            const c = size.coatings[i];
            html += `<tr>
              ${i === 0 ? `<td rowspan="${size.coatings.length}" style="font-weight:600;vertical-align:top;">Ø ${size.diameter}cm<br><span style="font-weight:400;font-size:11px;color:#666;">${size.pizza_capacity} ${t.pizzas}</span></td>` : ''}
              <td>${c.name}</td>
              <td>${c.base ? `€${Number(c.base).toLocaleString(dateLocale)}` : '—'}</td>
              <td>${c.gas ? `€${Number(c.gas).toLocaleString(dateLocale)}` : '—'}</td>
              <td>${c.electric ? `€${Number(c.electric).toLocaleString(dateLocale)}` : '—'}</td>
              <td>${c.onSite ? `€${Number(c.onSite).toLocaleString(dateLocale)}` : '—'}</td>
            </tr>`;
          }
        }

        html += `</tbody></table></div>`;
      }

      html += `<div class="footer">
        <p>${t.footer1}</p>
        <p>${t.footer2}</p>
      </div></body></html>`;

      printWindow.document.write(html);
      printWindow.document.close();
      toast.success(t.success);
    } catch (e: any) {
      toast.error('Errore generazione: ' + e.message);
    }
    setGeneratingPdf(false);
  }, [ovens]);

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
          <DollarSign className="w-7 h-7 text-orange-400" />
          <h1 className="text-2xl font-bold text-amber-100">Listino Rivenditori</h1>
          <Badge variant="secondary" className="ml-2 bg-amber-700/20 text-amber-300">Riservato</Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={generatingPdf} className="bg-amber-600 hover:bg-amber-700">
              {generatingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Scarica PDF
              <Globe className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => generatePDF('it')}>🇮🇹 Italiano</DropdownMenuItem>
            <DropdownMenuItem onClick={() => generatePDF('en')}>🇬🇧 English</DropdownMenuItem>
            <DropdownMenuItem onClick={() => generatePDF('fr')}>🇫🇷 Français</DropdownMenuItem>
            <DropdownMenuItem onClick={() => generatePDF('es')}>🇪🇸 Español</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cerca per modello..."
            className="pl-10 bg-[#1a1a1a] border-amber-900/20 text-amber-100"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(oven => {
          const isExpanded = expandedOven === oven.id;
          const hasSizes = oven.sizes?.length > 0 && oven.sizes.some((s: any) => s.coatings?.length > 0);
          
          return (
            <Card key={oven.id} className="bg-[#1a1a1a] border-amber-900/20">
              <CardContent className="p-0">
                {/* Oven header */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-amber-900/5 transition-colors"
                  onClick={() => setExpandedOven(isExpanded ? null : oven.id)}
                >
                  <div className="flex-shrink-0">
                    {hasSizes ? (
                      isExpanded ? <ChevronDown className="w-5 h-5 text-amber-400" /> : <ChevronRight className="w-5 h-5 text-gray-500" />
                    ) : <div className="w-5" />}
                  </div>
                  {oven.image_url && (
                    <img src={oven.image_url} alt={oven.model_name} className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-100">{oven.model_name}</h3>
                    <div className="flex gap-1 mt-1">
                      {Array.isArray(oven.fuel_type) && oven.fuel_type.filter(Boolean).map((f: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs border-amber-700/30 text-amber-200">{f}</Badge>
                      ))}
                    </div>
                  </div>
                  {hasEdits(oven.id) && (
                    <Button
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); saveOvenPrices(oven); }}
                      disabled={saving === oven.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {saving === oven.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                      Salva
                    </Button>
                  )}
                </div>

                {/* Expanded sizes/coatings prices */}
                {isExpanded && oven.sizes?.map((size: any, sIdx: number) => (
                  <div key={sIdx} className="border-t border-amber-900/10 px-4 py-3 bg-amber-900/5">
                    <div className="text-amber-300 font-semibold text-sm mb-3">
                      Ø {size.diameter}cm — {size.pizza_capacity} pizze
                      {size.can_be_built_on_site && <Badge className="ml-2 bg-blue-700/20 text-blue-300 text-xs">Costruibile sul posto</Badge>}
                    </div>
                    {size.coatings?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-gray-400 text-xs">
                              <th className="text-left py-1 pr-4">Rivestimento</th>
                              <th className="text-right py-1 px-2">Listino A (rif.)</th>
                              <th className="text-right py-1 px-2">Base Rivend.</th>
                              <th className="text-right py-1 px-2">Gas Rivend.</th>
                              <th className="text-right py-1 px-2">Elettrico Rivend.</th>
                              {size.can_be_built_on_site && <th className="text-right py-1 px-2">Sul Posto Rivend.</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {size.coatings.map((c: any, cIdx: number) => {
                              const listAPrice = c.prices?.listA?.base || 0;
                              return (
                                <tr key={cIdx} className="border-t border-amber-900/10">
                                  <td className="py-2 pr-4 text-amber-100 flex items-center gap-2">
                                    {c.image_url && <img src={c.image_url} alt={c.name} className="w-8 h-8 rounded object-cover" />}
                                    {c.name}
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-400 text-xs">
                                    {listAPrice ? `€${listAPrice.toLocaleString('it-IT')}` : '—'}
                                  </td>
                                  <td className="text-right py-2 px-1">
                                    <Input
                                      type="number"
                                      value={getResellerPrice(oven, sIdx, cIdx, 'base')}
                                      onChange={e => handlePriceChange(oven.id, sIdx, cIdx, 'base', e.target.value)}
                                      className="w-24 h-8 text-right bg-[#111] border-amber-900/20 text-amber-100 text-xs ml-auto"
                                    />
                                  </td>
                                  <td className="text-right py-2 px-1">
                                    <Input
                                      type="number"
                                      value={getResellerPrice(oven, sIdx, cIdx, 'gas')}
                                      onChange={e => handlePriceChange(oven.id, sIdx, cIdx, 'gas', e.target.value)}
                                      className="w-24 h-8 text-right bg-[#111] border-amber-900/20 text-amber-100 text-xs ml-auto"
                                    />
                                  </td>
                                  <td className="text-right py-2 px-1">
                                    <Input
                                      type="number"
                                      value={getResellerPrice(oven, sIdx, cIdx, 'electric')}
                                      onChange={e => handlePriceChange(oven.id, sIdx, cIdx, 'electric', e.target.value)}
                                      className="w-24 h-8 text-right bg-[#111] border-amber-900/20 text-amber-100 text-xs ml-auto"
                                    />
                                  </td>
                                  {size.can_be_built_on_site && (
                                    <td className="text-right py-2 px-1">
                                      <Input
                                        type="number"
                                        value={getResellerPrice(oven, sIdx, cIdx, 'onSite')}
                                        onChange={e => handlePriceChange(oven.id, sIdx, cIdx, 'onSite', e.target.value)}
                                        className="w-24 h-8 text-right bg-[#111] border-amber-900/20 text-amber-100 text-xs ml-auto"
                                      />
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-xs">Nessun rivestimento configurato</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'Nessun forno trovato' : 'Nessun forno nel catalogo'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ERPListinoRivenditori;
