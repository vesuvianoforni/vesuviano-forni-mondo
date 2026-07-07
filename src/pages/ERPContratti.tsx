import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, FileText, Loader2, Search, Download, Sparkles, Wand2, Link as LinkIcon, CheckCircle2, Languages, Calculator, User, Euro, FileSignature, CreditCard, Clock, Truck, PackageOpen, Wrench, ShieldCheck, Landmark, StickyNote, X } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { generateContractPdf, type ContractVariableFields, type ContractLanguage } from '@/components/erp/contractPdf';
import SelectOrCustom, { type Preset } from '@/components/erp/SelectOrCustom';


interface Contract {
  id: string;
  client_name: string;
  client_email: string | null;
  client_address: string | null;
  client_vat: string | null;
  offer_number: string | null;
  offer_date: string | null;
  destination: string | null;
  place_signed: string | null;
  total_amount: number;
  currency: string;
  payment_terms: string;
  warranty_years: number;
  variable_fields: ContractVariableFields;
  status: string;
  notes: string | null;
  created_at: string;
  signature_token: string | null;
  client_signature: string | null;
  client_signed_at: string | null;
  language?: string | null;
}

const LANGUAGES: { value: ContractLanguage; label: string; flag: string }[] = [
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
];


const DEFAULT_PAYMENT_TERMS =
  "50% di acconto alla conferma dell'ordine (bonifico bancario), 50% a saldo a merce pronta per la spedizione, previo invio al Cliente di supporto fotografico dei prodotti finiti.";

const DEFAULT_VF: ContractVariableFields = {
  payment_agreements: DEFAULT_PAYMENT_TERMS,
  refund_days: '15',
  shipping_included: 'No, salvo diverso accordo',
  insurance_included: 'Sì, nei limiti della polizza del vettore',
  delivery_responsibility: 'Vettore incaricato',
  unloading_included: 'No — a carico del Cliente',
  internal_handling_included: 'No — a carico del Cliente',
  assembly_included: 'No, salvo diverso accordo scritto',
  installation_included: 'No, salvo diverso accordo scritto',
  startup_included: 'No, salvo diverso accordo scritto',
  training_included: 'No, salvo diverso accordo scritto',
  chimney_responsible: 'Cliente',
  gas_responsible: 'Cliente',
  electric_responsible: 'Cliente',
  masonry_responsible: 'Cliente',
  permits_responsible: 'Cliente',
  dim_tolerance: '± 2 cm',
  color_tolerance: 'Lievi variazioni cromatiche ammesse',
  weight_tolerance: '± 5%',
  balance_due_days: '7 giorni',
  storage_cost: '1,5% del prezzo per mese o frazione',
  warranty_coverage: 'Difetti di fabbricazione dei componenti forniti',
};

type VFKey = keyof ContractVariableFields;

type FieldDef = { key: VFKey; label: string; type?: 'text' | 'textarea' | 'date' | 'number'; presetKey?: string };
const FIELD_GROUPS: { title: string; fields: FieldDef[] }[] = [
  {
    title: 'Riferimento & Cliente',
    fields: [
      { key: 'offer_number', label: 'N° offerta / preventivo' },
      { key: 'offer_date', label: 'Data offerta', type: 'date' },
      { key: 'destination', label: 'Destinazione merce' },
      { key: 'place_signed', label: 'Luogo firma' },
    ],
  },
  {
    title: 'Pagamento & Rimborsi',
    fields: [
      { key: 'payment_agreements', label: 'Accordi di pagamento', type: 'textarea', presetKey: 'payment_terms' },
      { key: 'refund_days', label: 'Giorni lavorativi per rimborso' },
      { key: 'balance_due_days', label: 'Termine saldo da merce pronta' },
      { key: 'storage_cost', label: 'Costo deposito' },
    ],
  },
  {
    title: 'Coordinate Bancarie',
    fields: [
      { key: 'bank_details' as VFKey, label: 'Coordinate bancarie per bonifico', type: 'textarea', presetKey: 'bank_account' },
    ],
  },
  {
    title: 'Tempi (calcolo automatico)',
    fields: [
      { key: 'production_days', label: 'Giorni di produzione', type: 'number', presetKey: 'production_days' },
      { key: 'shipping_days', label: 'Giorni di spedizione', type: 'number', presetKey: 'shipping_days' },
      { key: 'ready_date', label: 'Data merce pronta (auto)', type: 'date' },
      { key: 'ship_date', label: 'Data spedizione (auto)', type: 'date' },
      { key: 'delivery_estimate', label: 'Consegna stimata (auto)' },
      { key: 'work_time', label: 'Tempi di lavorazione (testo libero)' },
      { key: 'production_time', label: 'Tempi di produzione (testo libero)' },
    ],
  },
  {
    title: 'Spedizione & Trasporto',
    fields: [
      { key: 'shipping_method', label: 'Modalità di spedizione', presetKey: 'shipping_terms' },
      { key: 'carrier', label: 'Corriere / vettore' },
      { key: 'shipping_included', label: 'Trasporto incluso nel prezzo' },
      { key: 'insurance_included', label: 'Assicurazione inclusa' },
      { key: 'delivery_responsibility', label: 'Responsabilità della consegna' },
      { key: 'incoterms', label: 'Incoterms / resa', presetKey: 'shipping_terms' },
    ],
  },
  {
    title: 'Scarico & Logistica',
    fields: [
      { key: 'unloading_included', label: 'Scarico incluso' },
      { key: 'internal_handling_included', label: 'Movimentazione interna inclusa' },
      { key: 'unloading_means', label: 'Mezzi necessari allo scarico' },
      { key: 'unloading_responsible', label: 'Responsabile scarico' },
      { key: 'handling_responsible', label: 'Responsabile movimentazione interna' },
      { key: 'logistics_notes', label: 'Note logistiche', type: 'textarea' },
    ],
  },
  {
    title: 'Installazione & Predisposizioni',
    fields: [
      { key: 'assembly_included', label: 'Montaggio incluso', presetKey: 'installation' },
      { key: 'installation_included', label: 'Installazione inclusa', presetKey: 'installation' },
      { key: 'startup_included', label: 'Primo avviamento incluso' },
      { key: 'training_included', label: "Formazione all'uso inclusa" },
      { key: 'chimney_responsible', label: 'Responsabile canna fumaria' },
      { key: 'gas_responsible', label: 'Responsabile allaccio gas' },
      { key: 'electric_responsible', label: 'Responsabile allaccio elettrico' },
      { key: 'masonry_responsible', label: 'Responsabile opere murarie' },
      { key: 'permits_responsible', label: 'Responsabile permessi' },
    ],
  },
  {
    title: 'Tolleranze & Garanzia',
    fields: [
      { key: 'dim_tolerance', label: 'Tolleranza dimensionale' },
      { key: 'color_tolerance', label: 'Tolleranza colore/finitura' },
      { key: 'weight_tolerance', label: 'Tolleranza peso' },
      { key: 'warranty_duration', label: 'Durata garanzia (override)', presetKey: 'warranty' },
      { key: 'warranty_coverage', label: 'Copertura garanzia', type: 'textarea', presetKey: 'warranty' },
      { key: 'warranty_exclusions', label: 'Esclusioni particolari garanzia', type: 'textarea' },
    ],
  },
];

const addDays = (isoDate: string, days: number): string => {
  const d = new Date(isoDate + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};


const ERPContratti = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [saving, setSaving] = useState(false);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientVat, setClientVat] = useState('');
  const [offerNumber, setOfferNumber] = useState('');
  const [offerDate, setOfferDate] = useState('');
  const [destination, setDestination] = useState('');
  const [placeSigned, setPlaceSigned] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [warrantyYears, setWarrantyYears] = useState<number>(1);
  const [vf, setVf] = useState<ContractVariableFields>(DEFAULT_VF);
  const [status, setStatus] = useState<'draft' | 'sent' | 'signed'>('draft');
  const [notes, setNotes] = useState('');
  const [language, setLanguage] = useState<ContractLanguage>('it');
  const [presets, setPresets] = useState<Record<string, Preset[]>>({});

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('cliente');

  useEffect(() => { fetchContracts(); fetchPresets(); }, []);

  // ===== Dynamic date computation: offer_date + production_days => ready_date; + shipping_days => ship/delivery
  useEffect(() => {
    if (!offerDate) return;
    const pDays = parseInt(vf.production_days || '', 10);
    const sDays = parseInt(vf.shipping_days || '', 10);
    const patch: Partial<ContractVariableFields> = {};
    if (!isNaN(pDays) && pDays > 0) {
      patch.ready_date = addDays(offerDate, pDays);
      patch.ship_date = addDays(offerDate, pDays + 2);
      if (!isNaN(sDays) && sDays > 0) {
        const delivery = addDays(offerDate, pDays + 2 + sDays);
        patch.delivery_estimate = `${delivery} (≈ ${pDays + 2 + sDays} giorni dall'ordine)`;
      }
    }
    if (Object.keys(patch).length > 0) {
      setVf(prev => {
        const changed = Object.keys(patch).some(k => (prev as any)[k] !== (patch as any)[k]);
        return changed ? { ...prev, ...patch } : prev;
      });
    }
  }, [offerDate, vf.production_days, vf.shipping_days]);

  const fetchPresets = async () => {
    const { data, error } = await supabase
      .from('contract_field_presets')
      .select('id, field_key, value, label')
      .order('sort_order', { ascending: true });
    if (error) { console.warn('presets:', error); return; }
    const grouped: Record<string, Preset[]> = {};
    (data || []).forEach((row: any) => {
      grouped[row.field_key] = grouped[row.field_key] || [];
      grouped[row.field_key].push({ id: row.id, value: row.value, label: row.label });
    });
    setPresets(grouped);
  };


  const fetchContracts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error('Errore caricamento contratti');
    setContracts((data as any) || []);
    setLoading(false);
  };

  const resetForm = () => {
    setEditing(null);
    setClientName(''); setClientEmail(''); setClientAddress(''); setClientVat('');
    setOfferNumber(''); setOfferDate(''); setDestination(''); setPlaceSigned('');
    setTotalAmount(''); setCurrency('EUR');
    setWarrantyYears(1);
    setVf(DEFAULT_VF);
    setStatus('draft'); setNotes('');
    setLanguage('it');
    setAiPrompt('');

  };

  const openCreate = () => { resetForm(); setShowForm(true); };

  const openEdit = (c: Contract) => {
    setEditing(c);
    setClientName(c.client_name);
    setClientEmail(c.client_email || '');
    setClientAddress(c.client_address || '');
    setClientVat(c.client_vat || '');
    setOfferNumber(c.offer_number || '');
    setOfferDate(c.offer_date || '');
    setDestination(c.destination || '');
    setPlaceSigned(c.place_signed || '');
    setTotalAmount(c.total_amount?.toString() || '');
    setCurrency(c.currency || 'EUR');
    setWarrantyYears(c.warranty_years || 1);
    setVf({ ...DEFAULT_VF, ...(c.variable_fields || {}) });
    setStatus((c.status as any) || 'draft');
    setNotes(c.notes || '');
    setLanguage(((c as any).language as ContractLanguage) || 'it');
    setShowForm(true);
  };


  const handleSave = async () => {
    if (!clientName.trim()) { toast.error('Inserisci il nome cliente'); return; }
    setSaving(true);
    try {
      const payload = {
        client_name: clientName.trim(),
        client_email: clientEmail.trim() || null,
        client_address: clientAddress.trim() || null,
        client_vat: clientVat.trim() || null,
        offer_number: offerNumber.trim() || null,
        offer_date: offerDate || null,
        destination: destination.trim() || null,
        place_signed: placeSigned.trim() || null,
        total_amount: parseFloat(totalAmount) || 0,
        currency,
        payment_terms: vf.payment_agreements || DEFAULT_PAYMENT_TERMS,
        warranty_years: warrantyYears,
        variable_fields: vf as any,
        status,
        notes: notes.trim() || null,
        language,
      };

      if (editing) {
        const { error } = await supabase.from('contracts').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Contratto aggiornato');
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const { error } = await supabase.from('contracts').insert({ ...payload, created_by: userData.user?.id });
        if (error) throw error;
        toast.success('Contratto creato');
      }
      setShowForm(false);
      fetchContracts();
    } catch (e: any) {
      toast.error('Errore: ' + e.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo contratto?')) return;
    const { error } = await supabase.from('contracts').delete().eq('id', id);
    if (error) toast.error('Errore: ' + error.message);
    else { toast.success('Eliminato'); fetchContracts(); }
  };

  const buildContractData = (c?: Contract) => c ? ({
    ...c,
    variable_fields: c.variable_fields || {},
    language: ((c as any).language as ContractLanguage) || 'it',
  }) : ({
    client_name: clientName || 'Cliente',
    client_email: clientEmail,
    client_address: clientAddress,
    client_vat: clientVat,
    offer_number: offerNumber,
    offer_date: offerDate,
    destination,
    place_signed: placeSigned,
    total_amount: parseFloat(totalAmount) || 0,
    currency,
    payment_terms: vf.payment_agreements || DEFAULT_PAYMENT_TERMS,
    warranty_years: warrantyYears,
    variable_fields: vf,
    language,
  });

  const copySignLink = async (c: Contract) => {
    if (!c.signature_token) { toast.error('Token firma mancante'); return; }
    const url = `${window.location.origin}/contratto/${c.signature_token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link firma copiato negli appunti');
    } catch {
      window.prompt('Copia il link:', url);
    }
  };

  const handleDownloadPdf = async (c: Contract) => {
    setPdfLoading(true);
    try {
      const doc = await generateContractPdf(buildContractData(c) as any);
      const lang = ((c as any).language as ContractLanguage) || 'it';
      const filename = `CGV_${lang.toUpperCase()}_${c.client_name.replace(/\s+/g, '_')}${c.offer_number ? `_${c.offer_number}` : ''}.pdf`;
      doc.save(filename);
    } catch (e: any) {
      toast.error('Errore PDF: ' + e.message);
    } finally { setPdfLoading(false); }
  };

  const handlePreviewPdf = async () => {
    setPdfLoading(true);
    try {
      if (language !== 'it') toast.info('Traduzione AI in corso… può richiedere qualche secondo');
      const doc = await generateContractPdf(buildContractData() as any);
      window.open(doc.output('bloburl'), '_blank');
    } catch (e: any) {
      toast.error('Errore anteprima: ' + e.message);
    } finally { setPdfLoading(false); }
  };


  const setField = (k: VFKey, v: string) => setVf(prev => ({ ...prev, [k]: v }));

  const aiFillFields = async () => {
    if (!aiPrompt.trim()) { toast.error("Descrivi cosa vuoi impostare"); return; }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('contract-ai-assist', {
        body: {
          action: 'fill_fields',
          prompt: aiPrompt,
          current_fields: vf,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.fields && typeof data.fields === 'object') {
        setVf(prev => ({ ...prev, ...data.fields }));
        toast.success('Campi aggiornati dall\'AI');
        setAiPrompt('');
      } else {
        toast.error('AI: nessun campo restituito');
      }
    } catch (e: any) {
      toast.error('AI: ' + (e.message || 'errore'));
    } finally { setAiLoading(false); }
  };

  const filtered = contracts.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.client_name.toLowerCase().includes(s)
      || (c.offer_number || '').toLowerCase().includes(s)
      || (c.client_email || '').toLowerCase().includes(s);
  });

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      draft: 'bg-gray-700/30 text-gray-300',
      sent: 'bg-blue-700/30 text-blue-300',
      signed: 'bg-green-700/30 text-green-300',
    };
    const lbl: Record<string, string> = { draft: 'Bozza', sent: 'Inviato', signed: 'Firmato' };
    return <Badge className={map[s] || map.draft}>{lbl[s] || s}</Badge>;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  return (
    <>
      <SEOHead title="ERP Contratti | Vesuviano" description="Gestione Condizioni Generali di Vendita per cliente." lang="it" noIndex />
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl font-bold text-amber-100">Contratti · CGV</h1>
            <Badge variant="secondary" className="ml-2">{contracts.length}</Badge>
          </div>
          <Button onClick={openCreate} className="bg-amber-600 hover:bg-amber-700">
            <Plus className="w-4 h-4 mr-2" /> Nuovo Contratto
          </Button>
        </div>

        <div className="mb-4 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca per cliente, offerta, email..."
            className="pl-10 bg-[#1a1a1a] border-amber-900/20 text-amber-100" />
        </div>

        <Card className="bg-[#1a1a1a] border-amber-900/20">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-amber-900/20">
                  <TableHead className="text-amber-400">Cliente</TableHead>
                  <TableHead className="text-amber-400">Offerta</TableHead>
                  <TableHead className="text-amber-400">Importo</TableHead>
                  <TableHead className="text-amber-400">Garanzia</TableHead>
                  <TableHead className="text-amber-400">Stato</TableHead>
                  <TableHead className="text-amber-400">Data</TableHead>
                  <TableHead className="text-amber-400 text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.id} className="border-amber-900/10 hover:bg-amber-900/5">
                    <TableCell className="font-medium text-amber-100">
                      <div className="flex items-center gap-2">
                        <span>{c.client_name}</span>
                        <span className="text-xs">{LANGUAGES.find(l => l.value === (c.language || 'it'))?.flag}</span>
                      </div>
                      {c.client_email && <div className="text-xs text-gray-500">{c.client_email}</div>}
                    </TableCell>

                    <TableCell className="text-gray-300">{c.offer_number || '—'}</TableCell>
                    <TableCell className="text-amber-200 font-medium">
                      {new Intl.NumberFormat('it-IT', { style: 'currency', currency: c.currency || 'EUR' }).format(c.total_amount || 0)}
                    </TableCell>
                    <TableCell className="text-gray-300">{c.warranty_years} {c.warranty_years === 1 ? 'anno' : 'anni'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {statusBadge(c.status)}
                        {c.client_signature && <CheckCircle2 className="w-4 h-4 text-green-400" aria-label="Firmato dal cliente" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">{new Date(c.created_at).toLocaleDateString('it-IT')}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => copySignLink(c)} className="text-purple-300 hover:text-purple-200" title="Copia link firma cliente">
                          <LinkIcon className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDownloadPdf(c)} className="text-blue-400 hover:text-blue-200" title="Scarica PDF">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openEdit(c)} className="text-amber-400 hover:text-amber-200">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    {search ? 'Nessun contratto trovato' : 'Nessun contratto ancora creato'}
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="bg-[#1a1a1a] border-amber-900/20 text-amber-100 max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Modifica Contratto CGV' : 'Nuovo Contratto CGV'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Cliente */}
              <section className="space-y-3">
                <h3 className="text-amber-400 font-semibold text-sm uppercase tracking-wider">Dati Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-amber-300">Nome / Ragione Sociale *</Label>
                    <Input value={clientName} onChange={e => setClientName(e.target.value)} className="bg-[#111] border-amber-900/30" />
                  </div>
                  <div>
                    <Label className="text-amber-300">P.IVA / C.F.</Label>
                    <Input value={clientVat} onChange={e => setClientVat(e.target.value)} className="bg-[#111] border-amber-900/30" />
                  </div>
                  <div>
                    <Label className="text-amber-300">Email</Label>
                    <Input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="bg-[#111] border-amber-900/30" />
                  </div>
                  <div>
                    <Label className="text-amber-300">Indirizzo</Label>
                    <Input value={clientAddress} onChange={e => setClientAddress(e.target.value)} className="bg-[#111] border-amber-900/30" />
                  </div>
                </div>
              </section>

              {/* Economiche base */}
              <section className="space-y-3">
                <h3 className="text-amber-400 font-semibold text-sm uppercase tracking-wider">Economiche</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-amber-300">N° Offerta</Label>
                    <Input value={offerNumber} onChange={e => setOfferNumber(e.target.value)} placeholder="PF-2026-0001" className="bg-[#111] border-amber-900/30" />
                  </div>
                  <div>
                    <Label className="text-amber-300">Importo</Label>
                    <Input type="number" step="0.01" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} className="bg-[#111] border-amber-900/30" />
                  </div>
                  <div>
                    <Label className="text-amber-300">Valuta</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="bg-[#111] border-amber-900/30"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR €</SelectItem>
                        <SelectItem value="GBP">GBP £</SelectItem>
                        <SelectItem value="USD">USD $</SelectItem>
                        <SelectItem value="CHF">CHF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-amber-300">Garanzia</Label>
                    <Select value={String(warrantyYears)} onValueChange={v => setWarrantyYears(parseInt(v))}>
                      <SelectTrigger className="bg-[#111] border-amber-900/30"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 anno (standard)</SelectItem>
                        <SelectItem value="2">2 anni (esteso)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-amber-300">Stato</Label>
                    <Select value={status} onValueChange={v => setStatus(v as any)}>
                      <SelectTrigger className="bg-[#111] border-amber-900/30"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Bozza</SelectItem>
                        <SelectItem value="sent">Inviato</SelectItem>
                        <SelectItem value="signed">Firmato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-amber-300 flex items-center gap-1">
                      <Languages className="w-3.5 h-3.5" /> Lingua del contratto
                    </Label>
                    <Select value={language} onValueChange={(v) => setLanguage(v as ContractLanguage)}>
                      <SelectTrigger className="bg-[#111] border-amber-900/30"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(l => (
                          <SelectItem key={l.value} value={l.value}>{l.flag} {l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {language !== 'it' && (
                      <p className="text-[10px] text-purple-300/70 mt-1">
                        Il PDF verrà tradotto via AI (IT è il testo giuridico master).
                      </p>
                    )}
                  </div>
                </div>
              </section>


              {/* AI */}
              <section className="space-y-3 border border-purple-900/40 rounded-lg p-4 bg-purple-950/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="text-purple-300 font-semibold text-sm uppercase tracking-wider">Assistente AI · Compila campi variabili</h3>
                </div>
                <p className="text-xs text-gray-400">Descrivi in linguaggio naturale le condizioni: l'AI popola i campi variabili qui sotto.</p>
                <Textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={2}
                  placeholder="Es. 'Consegna in Francia entro 60 giorni, trasporto incluso, installazione a carico Vesuviano, garanzia 24 mesi'"
                  className="bg-[#111] border-purple-900/30 text-amber-100" />
                <Button size="sm" onClick={aiFillFields} disabled={aiLoading}
                  className="bg-purple-700 hover:bg-purple-600 text-white">
                  {aiLoading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Wand2 className="w-3 h-3 mr-2" />}
                  Applica ai campi
                </Button>
              </section>

              {/* Campi variabili raggruppati */}
              {FIELD_GROUPS.map(group => (
                <section key={group.title} className="space-y-3">
                  <h3 className="text-amber-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                    {group.title.includes('automatico') && <Calculator className="w-4 h-4 text-green-400" />}
                    {group.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.fields.map(f => {
                      const isTop = ['offer_number','offer_date','destination','place_signed'].includes(f.key);
                      const value = isTop ? (
                        f.key === 'offer_number' ? offerNumber :
                        f.key === 'offer_date' ? offerDate :
                        f.key === 'destination' ? destination :
                        placeSigned
                      ) : ((vf as any)[f.key] || '');
                      const setter = (v: string) => {
                        if (f.key === 'offer_number') setOfferNumber(v);
                        else if (f.key === 'offer_date') setOfferDate(v);
                        else if (f.key === 'destination') setDestination(v);
                        else if (f.key === 'place_signed') setPlaceSigned(v);
                        else setField(f.key, v);
                      };
                      const fieldPresets = f.presetKey ? (presets[f.presetKey] || []) : [];
                      return (
                        <div key={f.key} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
                          <Label className="text-amber-300 text-xs">{f.label}</Label>
                          {fieldPresets.length > 0 || f.type === 'textarea' ? (
                            <SelectOrCustom
                              fieldKey={f.presetKey || f.key}
                              value={value}
                              onChange={setter}
                              presets={fieldPresets}
                              type={f.type as any}
                              onPresetAdded={(p) => setPresets(prev => ({
                                ...prev,
                                [f.presetKey || f.key]: [...(prev[f.presetKey || f.key] || []), p],
                              }))}
                            />
                          ) : (
                            <Input type={f.type || 'text'} value={value} onChange={e => setter(e.target.value)}
                              className="bg-[#111] border-amber-900/30" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}


              <div>
                <Label className="text-amber-300">Note interne</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="bg-[#111] border-amber-900/30" />
              </div>

              <div className="flex gap-2 sticky bottom-0 bg-[#1a1a1a] pt-3 border-t border-amber-900/20">
                <Button variant="outline" onClick={handlePreviewPdf} disabled={pdfLoading} className="border-amber-700 text-amber-200">
                  {pdfLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                  Anteprima PDF ({language.toUpperCase()})
                </Button>

                <div className="flex-1" />
                <Button variant="ghost" onClick={() => setShowForm(false)}>Annulla</Button>
                <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editing ? 'Salva modifiche' : 'Crea contratto'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default ERPContratti;
