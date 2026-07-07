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
import { Plus, Trash2, Edit, FileText, Loader2, Search, Download, Sparkles, Wand2, PlusCircle } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { generateContractPdf, DEFAULT_CLAUSES, DEFAULT_PAYMENT_TERMS, type ContractClause } from '@/components/erp/contractPdf';

interface Contract {
  id: string;
  client_name: string;
  client_email: string | null;
  client_address: string | null;
  client_vat: string | null;
  offer_number: string | null;
  total_amount: number;
  currency: string;
  payment_terms: string;
  warranty_years: number;
  clauses: ContractClause[];
  status: string;
  signed_at: string | null;
  notes: string | null;
  created_at: string;
}

const ERPContratti = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientVat, setClientVat] = useState('');
  const [offerNumber, setOfferNumber] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [paymentTerms, setPaymentTerms] = useState(DEFAULT_PAYMENT_TERMS);
  const [warrantyYears, setWarrantyYears] = useState<number>(1);
  const [clauses, setClauses] = useState<ContractClause[]>(DEFAULT_CLAUSES);
  const [status, setStatus] = useState<'draft' | 'sent' | 'signed'>('draft');
  const [notes, setNotes] = useState('');

  // AI
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiTargetIndex, setAiTargetIndex] = useState<number | null>(null);

  useEffect(() => { fetchContracts(); }, []);

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
    setOfferNumber(''); setTotalAmount(''); setCurrency('EUR');
    setPaymentTerms(DEFAULT_PAYMENT_TERMS);
    setWarrantyYears(1);
    setClauses(DEFAULT_CLAUSES);
    setStatus('draft'); setNotes('');
    setAiPrompt(''); setAiTargetIndex(null);
  };

  const openCreate = () => { resetForm(); setShowForm(true); };

  const openEdit = (c: Contract) => {
    setEditing(c);
    setClientName(c.client_name);
    setClientEmail(c.client_email || '');
    setClientAddress(c.client_address || '');
    setClientVat(c.client_vat || '');
    setOfferNumber(c.offer_number || '');
    setTotalAmount(c.total_amount?.toString() || '');
    setCurrency(c.currency || 'EUR');
    setPaymentTerms(c.payment_terms || DEFAULT_PAYMENT_TERMS);
    setWarrantyYears(c.warranty_years || 1);
    setClauses(Array.isArray(c.clauses) && c.clauses.length ? c.clauses : DEFAULT_CLAUSES);
    setStatus((c.status as any) || 'draft');
    setNotes(c.notes || '');
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
        total_amount: parseFloat(totalAmount) || 0,
        currency,
        payment_terms: paymentTerms,
        warranty_years: warrantyYears,
        clauses: clauses as any,
        status,
        notes: notes.trim() || null,
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

  const handleDownloadPdf = async (c: Contract) => {
    try {
      const doc = await generateContractPdf({
        ...c,
        clauses: (Array.isArray(c.clauses) && c.clauses.length ? c.clauses : DEFAULT_CLAUSES) as ContractClause[],
      });
      const filename = `Contratto_${c.client_name.replace(/\s+/g, '_')}${c.offer_number ? `_${c.offer_number}` : ''}.pdf`;
      doc.save(filename);
    } catch (e: any) {
      toast.error('Errore PDF: ' + e.message);
    }
  };

  const handlePreviewPdf = async () => {
    try {
      const doc = await generateContractPdf({
        client_name: clientName || 'Cliente',
        client_email: clientEmail, client_address: clientAddress, client_vat: clientVat,
        offer_number: offerNumber,
        total_amount: parseFloat(totalAmount) || 0,
        currency, payment_terms: paymentTerms, warranty_years: warrantyYears,
        clauses,
      });
      window.open(doc.output('bloburl'), '_blank');
    } catch (e: any) {
      toast.error('Errore anteprima: ' + e.message);
    }
  };

  const updateClause = (i: number, field: 'title' | 'content', v: string) => {
    setClauses(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: v } : c));
  };
  const removeClause = (i: number) => setClauses(prev => prev.filter((_, idx) => idx !== i));
  const addBlankClause = () => setClauses(prev => [...prev, { title: 'Nuova clausola', content: '' }]);
  const moveClause = (i: number, dir: -1 | 1) => {
    setClauses(prev => {
      const arr = [...prev];
      const t = i + dir;
      if (t < 0 || t >= arr.length) return arr;
      [arr[i], arr[t]] = [arr[t], arr[i]];
      return arr;
    });
  };

  const callAI = async (action: 'rewrite' | 'add' | 'suggest' | 'improve_all', body: any = {}) => {
    setAiLoading(action);
    try {
      const { data, error } = await supabase.functions.invoke('contract-ai-assist', {
        body: { action, prompt: aiPrompt, ...body },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    } catch (e: any) {
      toast.error('AI: ' + (e.message || 'errore'));
      return null;
    } finally { setAiLoading(null); }
  };

  const aiRewrite = async (i: number) => {
    if (!aiPrompt.trim()) { toast.error('Scrivi un\'istruzione per l\'AI'); return; }
    setAiTargetIndex(i);
    const res = await callAI('rewrite', { clause: clauses[i] });
    if (res?.title && res?.content) {
      updateClause(i, 'title', res.title);
      updateClause(i, 'content', res.content);
      toast.success('Clausola riscritta');
      setAiPrompt('');
    }
    setAiTargetIndex(null);
  };
  const aiAdd = async () => {
    if (!aiPrompt.trim()) { toast.error('Descrivi la clausola da aggiungere'); return; }
    const res = await callAI('add');
    if (res?.title && res?.content) {
      setClauses(prev => [...prev, { title: res.title, content: res.content }]);
      toast.success('Clausola aggiunta');
      setAiPrompt('');
    }
  };
  const aiSuggest = async () => {
    const res = await callAI('suggest');
    if (res?.clauses?.length) {
      setClauses(res.clauses);
      toast.success('Clausole standard generate');
    }
  };
  const aiImproveAll = async () => {
    const res = await callAI('improve_all', { clauses });
    if (res?.clauses?.length) {
      setClauses(res.clauses);
      toast.success('Clausole migliorate');
      setAiPrompt('');
    }
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
      <SEOHead title="ERP Contratti | Vesuviano" description="Gestione contratti clienti." lang="it" noIndex />
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl font-bold text-amber-100">Contratti</h1>
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
                      <div>{c.client_name}</div>
                      {c.client_email && <div className="text-xs text-gray-500">{c.client_email}</div>}
                    </TableCell>
                    <TableCell className="text-gray-300">{c.offer_number || '—'}</TableCell>
                    <TableCell className="text-amber-200 font-medium">
                      {new Intl.NumberFormat('it-IT', { style: 'currency', currency: c.currency || 'EUR' }).format(c.total_amount || 0)}
                    </TableCell>
                    <TableCell className="text-gray-300">{c.warranty_years} {c.warranty_years === 1 ? 'anno' : 'anni'}</TableCell>
                    <TableCell>{statusBadge(c.status)}</TableCell>
                    <TableCell className="text-gray-400 text-sm">{new Date(c.created_at).toLocaleDateString('it-IT')}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
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

        {/* Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="bg-[#1a1a1a] border-amber-900/20 text-amber-100 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Modifica Contratto' : 'Nuovo Contratto'}</DialogTitle>
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

              {/* Economiche */}
              <section className="space-y-3">
                <h3 className="text-amber-400 font-semibold text-sm uppercase tracking-wider">Condizioni Economiche</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-amber-300">N° Offerta</Label>
                    <Input value={offerNumber} onChange={e => setOfferNumber(e.target.value)} placeholder="es. PF-2026-0001" className="bg-[#111] border-amber-900/30" />
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
                </div>
                <div>
                  <Label className="text-amber-300">Modalità di pagamento</Label>
                  <Textarea value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="bg-[#111] border-amber-900/30" rows={3} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                </div>
              </section>

              {/* AI */}
              <section className="space-y-3 border border-purple-900/40 rounded-lg p-4 bg-purple-950/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="text-purple-300 font-semibold text-sm uppercase tracking-wider">Assistente AI Clausole</h3>
                </div>
                <p className="text-xs text-gray-400">Descrivi cosa vuoi modificare o aggiungere: l'AI aggiorna le clausole del contratto.</p>
                <Textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={2}
                  placeholder="Es. 'Estendi la garanzia a 24 mesi'  ·  'Aggiungi clausola di penale per ritardo di pagamento'  ·  'Rendi tutto più formale'"
                  className="bg-[#111] border-purple-900/30 text-amber-100" />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={aiAdd} disabled={aiLoading !== null}
                    className="border-purple-700 text-purple-200 hover:bg-purple-900/30">
                    {aiLoading === 'add' ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <PlusCircle className="w-3 h-3 mr-2" />}
                    Aggiungi clausola AI
                  </Button>
                  <Button size="sm" variant="outline" onClick={aiImproveAll} disabled={aiLoading !== null}
                    className="border-purple-700 text-purple-200 hover:bg-purple-900/30">
                    {aiLoading === 'improve_all' ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Wand2 className="w-3 h-3 mr-2" />}
                    Migliora tutte
                  </Button>
                  <Button size="sm" variant="outline" onClick={aiSuggest} disabled={aiLoading !== null}
                    className="border-purple-700 text-purple-200 hover:bg-purple-900/30">
                    {aiLoading === 'suggest' ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Sparkles className="w-3 h-3 mr-2" />}
                    Rigenera clausole standard
                  </Button>
                </div>
              </section>

              {/* Clausole */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-amber-400 font-semibold text-sm uppercase tracking-wider">Termini e Condizioni ({clauses.length})</h3>
                  <Button size="sm" variant="ghost" onClick={addBlankClause} className="text-amber-300">
                    <Plus className="w-4 h-4 mr-1" /> Aggiungi vuota
                  </Button>
                </div>
                <div className="space-y-3">
                  {clauses.map((cl, i) => (
                    <div key={i} className="border border-amber-900/20 rounded-lg p-3 bg-[#111]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500 font-mono">Art. {i + 1}</span>
                        <Input value={cl.title} onChange={e => updateClause(i, 'title', e.target.value)}
                          className="bg-transparent border-0 text-amber-200 font-semibold px-1 focus-visible:ring-0" />
                        <Button size="sm" variant="ghost" onClick={() => moveClause(i, -1)} className="text-gray-500 h-7 px-2">↑</Button>
                        <Button size="sm" variant="ghost" onClick={() => moveClause(i, 1)} className="text-gray-500 h-7 px-2">↓</Button>
                        <Button size="sm" variant="ghost" onClick={() => aiRewrite(i)} disabled={aiLoading !== null}
                          className="text-purple-400 hover:text-purple-200 h-7" title="Riscrivi con AI">
                          {aiLoading === 'rewrite' && aiTargetIndex === i ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => removeClause(i)} className="text-red-400 h-7">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <Textarea value={cl.content} onChange={e => updateClause(i, 'content', e.target.value)} rows={4}
                        className="bg-[#0a0a0a] border-amber-900/20 text-gray-200 text-sm" />
                    </div>
                  ))}
                </div>
              </section>

              <div>
                <Label className="text-amber-300">Note interne</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="bg-[#111] border-amber-900/30" />
              </div>

              <div className="flex gap-2 sticky bottom-0 bg-[#1a1a1a] pt-3 border-t border-amber-900/20">
                <Button variant="outline" onClick={handlePreviewPdf} className="border-amber-700 text-amber-200">
                  <FileText className="w-4 h-4 mr-2" /> Anteprima PDF
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
