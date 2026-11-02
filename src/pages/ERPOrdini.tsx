import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Search, Loader2, Truck, Package, FileText, Eye, Edit, Trash2, ArrowRight, Upload, X, Download, File } from 'lucide-react';
import { format } from 'date-fns';
import SEOHead from '@/components/SEOHead';

const ORDER_STATUSES = [
  { value: 'nuovo', label: 'Nuovo', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { value: 'confermato', label: 'Confermato', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  { value: 'in_produzione', label: 'In Produzione', color: 'bg-primary/10 text-primary border-border' },
  { value: 'pronto_spedizione', label: 'Pronto Spedizione', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { value: 'spedito', label: 'Spedito', color: 'bg-primary/10 text-primary border-border' },
  { value: 'consegnato', label: 'Consegnato', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  { value: 'annullato', label: 'Annullato', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
];

const PAYMENT_STATUSES = [
  { value: 'in_attesa', label: 'In Attesa' },
  { value: 'acconto_pagato', label: 'Acconto Pagato' },
  { value: 'saldato', label: 'Saldato' },
];

type Order = {
  id: string;
  order_number: string;
  proforma_id: string | null;
  customer_name: string | null;
  company_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  billing_address: string | null;
  delivery_address: string | null;
  vat_number: string | null;
  status: string;
  carrier: string | null;
  tracking_number: string | null;
  estimated_delivery: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  total_amount: number;
  deposit_paid: number;
  balance_due: number;
  payment_status: string;
  notes: string | null;
  created_at: string;
};

const emptyOrder = {
  customer_name: '',
  company_name: '',
  customer_email: '',
  customer_phone: '',
  billing_address: '',
  delivery_address: '',
  vat_number: '',
  total_amount: 0,
  deposit_paid: 0,
  balance_due: 0,
  notes: '',
  carrier: '',
  tracking_number: '',
  estimated_delivery: '',
  invoice_number: '',
  invoice_date: '',
  status: 'nuovo',
  payment_status: 'in_attesa',
};

const ERPOrdini = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [proformas, setProformas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState(emptyOrder);
  const [saving, setSaving] = useState(false);
  const [showFromProforma, setShowFromProforma] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<{ name: string; url: string }[]>([]);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => { fetchOrders(); fetchProformas(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error('Errore caricamento ordini');
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  const fetchProformas = async () => {
    const { data } = await supabase
      .from('proformas')
      .select('*')
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false });
    setProformas(data || []);
  };

  // Document handling
  const fetchOrderDocs = async (orderId: string) => {
    const { data, error } = await supabase.storage
      .from('order-documents')
      .list(orderId);
    if (data && !error) {
      setUploadedDocs(data.map(f => ({
        name: f.name,
        url: supabase.storage.from('order-documents').getPublicUrl(`${orderId}/${f.name}`).data.publicUrl,
      })));
    } else {
      setUploadedDocs([]);
    }
  };

  const uploadFilesToOrder = async (orderId: string, files: File[]) => {
    setUploadingDocs(true);
    for (const file of files) {
      const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error } = await supabase.storage
        .from('order-documents')
        .upload(`${orderId}/${safeName}`, file, { upsert: true });
      if (error) toast.error(`Errore upload ${file.name}`);
    }
    setUploadingDocs(false);
    await fetchOrderDocs(orderId);
    setPendingFiles([]);
  };

  const deleteDoc = async (orderId: string, fileName: string) => {
    const { error } = await supabase.storage
      .from('order-documents')
      .remove([`${orderId}/${fileName}`]);
    if (error) toast.error('Errore eliminazione');
    else await fetchOrderDocs(orderId);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    if (selectedOrder) {
      uploadFilesToOrder(selectedOrder.id, files);
    } else {
      setPendingFiles(prev => [...prev, ...files]);
    }
  }, [selectedOrder]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (selectedOrder) {
      uploadFilesToOrder(selectedOrder.id, files);
    } else {
      setPendingFiles(prev => [...prev, ...files]);
    }
    e.target.value = '';
  };

  const removePendingFile = (idx: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreateManual = () => {
    setFormData(emptyOrder);
    setShowFromProforma(false);
    setSelectedOrder(null);
    setPendingFiles([]);
    setUploadedDocs([]);
    setShowCreateModal(true);
  };

  const handleCreateFromProforma = (proforma: any) => {
    setFormData({
      ...emptyOrder,
      customer_name: proforma.customer_name || '',
      company_name: proforma.company_name || '',
      customer_email: proforma.customer_email || '',
      customer_phone: proforma.customer_phone || '',
      billing_address: proforma.billing_address || '',
      vat_number: proforma.vat_number || '',
      total_amount: proforma.total_price || 0,
      deposit_paid: proforma.deposit_amount || 0,
      balance_due: (proforma.total_price || 0) - (proforma.deposit_amount || 0),
      payment_status: proforma.deposit_amount > 0 ? 'acconto_pagato' : 'in_attesa',
      status: 'confermato',
      notes: `Convertito da Pro-Forma #${proforma.token?.substring(0, 8)}`,
    });
    setShowFromProforma(false);
    setShowCreateModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selectedOrder) {
        const { error } = await supabase.from('orders').update({
          customer_name: formData.customer_name || null,
          company_name: formData.company_name || null,
          customer_email: formData.customer_email || null,
          customer_phone: formData.customer_phone || null,
          billing_address: formData.billing_address || null,
          delivery_address: formData.delivery_address || null,
          vat_number: formData.vat_number || null,
          total_amount: formData.total_amount,
          deposit_paid: formData.deposit_paid,
          balance_due: formData.balance_due,
          notes: formData.notes || null,
          carrier: formData.carrier || null,
          tracking_number: formData.tracking_number || null,
          estimated_delivery: formData.estimated_delivery || null,
          invoice_number: formData.invoice_number || null,
          invoice_date: formData.invoice_date || null,
          status: formData.status,
          payment_status: formData.payment_status,
        }).eq('id', selectedOrder.id);
        if (error) throw error;
        toast.success('Ordine aggiornato');
      } else {
        const { data: newOrder, error } = await supabase.from('orders').insert({
          customer_name: formData.customer_name || null,
          company_name: formData.company_name || null,
          customer_email: formData.customer_email || null,
          customer_phone: formData.customer_phone || null,
          billing_address: formData.billing_address || null,
          delivery_address: formData.delivery_address || null,
          vat_number: formData.vat_number || null,
          total_amount: formData.total_amount,
          deposit_paid: formData.deposit_paid,
          balance_due: formData.balance_due,
          notes: formData.notes || null,
          status: formData.status,
          payment_status: formData.payment_status,
        }).select().single();
        if (error) throw error;
        // Upload pending files for the new order
        if (newOrder && pendingFiles.length > 0) {
          await uploadFilesToOrder(newOrder.id, pendingFiles);
        }
        toast.success('Ordine creato');
      }
      setShowCreateModal(false);
      setShowDetailModal(false);
      fetchOrders();
    } catch (e: any) {
      toast.error('Errore: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo ordine?')) return;
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) { toast.error('Errore eliminazione'); return; }
    toast.success('Ordine eliminato');
    fetchOrders();
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setFormData({
      customer_name: order.customer_name || '',
      company_name: order.company_name || '',
      customer_email: order.customer_email || '',
      customer_phone: order.customer_phone || '',
      billing_address: order.billing_address || '',
      delivery_address: order.delivery_address || '',
      vat_number: order.vat_number || '',
      total_amount: order.total_amount,
      deposit_paid: order.deposit_paid,
      balance_due: order.balance_due,
      notes: order.notes || '',
      carrier: order.carrier || '',
      tracking_number: order.tracking_number || '',
      estimated_delivery: order.estimated_delivery || '',
      invoice_number: order.invoice_number || '',
      invoice_date: order.invoice_date || '',
      status: order.status,
      payment_status: order.payment_status,
    });
    setPendingFiles([]);
    fetchOrderDocs(order.id);
    setShowCreateModal(true);
  };

  const getStatusBadge = (status: string) => {
    const s = ORDER_STATUSES.find(st => st.value === status);
    return <Badge variant="outline" className={s?.color || ''}>{s?.label || status}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const colors: Record<string, string> = {
      in_attesa: 'bg-primary/10 text-primary border-border',
      acconto_pagato: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      saldato: 'bg-green-500/20 text-green-300 border-green-500/30',
    };
    const labels: Record<string, string> = { in_attesa: 'In Attesa', acconto_pagato: 'Acconto', saldato: 'Saldato' };
    return <Badge variant="outline" className={colors[status] || ''}>{labels[status] || status}</Badge>;
  };

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      o.order_number?.toLowerCase().includes(s) ||
      o.customer_name?.toLowerCase().includes(s) ||
      o.company_name?.toLowerCase().includes(s) ||
      o.tracking_number?.toLowerCase().includes(s) ||
      o.invoice_number?.toLowerCase().includes(s)
    );
  });

  const stats = {
    total: orders.length,
    inProduzione: orders.filter(o => o.status === 'in_produzione').length,
    daSpedire: orders.filter(o => o.status === 'pronto_spedizione').length,
    saldoDovuto: orders.reduce((sum, o) => sum + (o.balance_due || 0), 0),
  };

  const renderFormFields = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div><Label className="text-muted-foreground">Stato Ordine</Label>
          <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v }))}>
            <SelectTrigger className="bg-card border-border text-foreground"><SelectValue /></SelectTrigger>
            <SelectContent>{ORDER_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label className="text-muted-foreground">Stato Pagamento</Label>
          <Select value={formData.payment_status} onValueChange={v => setFormData(p => ({ ...p, payment_status: v }))}>
            <SelectTrigger className="bg-card border-border text-foreground"><SelectValue /></SelectTrigger>
            <SelectContent>{PAYMENT_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <h3 className="text-primary font-semibold text-sm mt-4">Cliente</h3>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-muted-foreground text-xs">Nome</Label>
          <Input value={formData.customer_name} onChange={e => setFormData(p => ({ ...p, customer_name: e.target.value }))} className="bg-card border-border text-foreground" /></div>
        <div><Label className="text-muted-foreground text-xs">Azienda</Label>
          <Input value={formData.company_name} onChange={e => setFormData(p => ({ ...p, company_name: e.target.value }))} className="bg-card border-border text-foreground" /></div>
        <div><Label className="text-muted-foreground text-xs">Email</Label>
          <Input type="email" value={formData.customer_email} onChange={e => setFormData(p => ({ ...p, customer_email: e.target.value }))} className="bg-card border-border text-foreground" /></div>
        <div><Label className="text-muted-foreground text-xs">Telefono</Label>
          <Input value={formData.customer_phone} onChange={e => setFormData(p => ({ ...p, customer_phone: e.target.value }))} className="bg-card border-border text-foreground" /></div>
        <div><Label className="text-muted-foreground text-xs">P.IVA</Label>
          <Input value={formData.vat_number} onChange={e => setFormData(p => ({ ...p, vat_number: e.target.value }))} className="bg-card border-border text-foreground" /></div>
      </div>

      <h3 className="text-primary font-semibold text-sm mt-4">Indirizzi</h3>
      <div><Label className="text-muted-foreground text-xs">Indirizzo Fatturazione</Label>
        <Input value={formData.billing_address} onChange={e => setFormData(p => ({ ...p, billing_address: e.target.value }))} className="bg-card border-border text-foreground" /></div>
      <div><Label className="text-muted-foreground text-xs">Indirizzo Consegna</Label>
        <Input value={formData.delivery_address} onChange={e => setFormData(p => ({ ...p, delivery_address: e.target.value }))} className="bg-card border-border text-foreground" /></div>

      <h3 className="text-primary font-semibold text-sm mt-4">Importi</h3>
      <div className="grid grid-cols-3 gap-3">
        <div><Label className="text-muted-foreground text-xs">Totale €</Label>
          <Input type="number" value={formData.total_amount} onChange={e => { const v = Number(e.target.value); setFormData(p => ({ ...p, total_amount: v, balance_due: v - p.deposit_paid })); }} className="bg-card border-border text-foreground" /></div>
        <div><Label className="text-muted-foreground text-xs">Acconto €</Label>
          <Input type="number" value={formData.deposit_paid} onChange={e => { const v = Number(e.target.value); setFormData(p => ({ ...p, deposit_paid: v, balance_due: p.total_amount - v })); }} className="bg-card border-border text-foreground" /></div>
        <div><Label className="text-muted-foreground text-xs">Saldo €</Label>
          <Input type="number" value={formData.balance_due} disabled className="bg-card border-border text-muted-foreground" /></div>
      </div>

      <h3 className="text-primary font-semibold text-sm mt-4">Spedizione</h3>
      <div className="grid grid-cols-3 gap-3">
        <div><Label className="text-muted-foreground text-xs">Corriere</Label>
          <Input value={formData.carrier} onChange={e => setFormData(p => ({ ...p, carrier: e.target.value }))} className="bg-card border-border text-foreground" /></div>
        <div><Label className="text-muted-foreground text-xs">Tracking</Label>
          <Input value={formData.tracking_number} onChange={e => setFormData(p => ({ ...p, tracking_number: e.target.value }))} className="bg-card border-border text-foreground" /></div>
        <div><Label className="text-muted-foreground text-xs">Consegna Stimata</Label>
          <Input type="date" value={formData.estimated_delivery} onChange={e => setFormData(p => ({ ...p, estimated_delivery: e.target.value }))} className="bg-card border-border text-foreground" /></div>
      </div>

      <h3 className="text-primary font-semibold text-sm mt-4">Fatturazione</h3>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-muted-foreground text-xs">N. Fattura</Label>
          <Input value={formData.invoice_number} onChange={e => setFormData(p => ({ ...p, invoice_number: e.target.value }))} className="bg-card border-border text-foreground" /></div>
        <div><Label className="text-muted-foreground text-xs">Data Fattura</Label>
          <Input type="date" value={formData.invoice_date} onChange={e => setFormData(p => ({ ...p, invoice_date: e.target.value }))} className="bg-card border-border text-foreground" /></div>
      </div>

      <div><Label className="text-muted-foreground text-xs">Note</Label>
        <Textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} className="bg-card border-border text-foreground" rows={3} /></div>

      {/* Documents Drag & Drop */}
      <h3 className="text-primary font-semibold text-sm mt-4 flex items-center gap-2">
        <FileText className="w-4 h-4" /> Documenti
      </h3>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-border bg-primary/10'
            : 'border-border bg-card hover:border-primary/50'
        }`}
        onClick={() => document.getElementById('order-doc-input')?.click()}
      >
        <input
          id="order-doc-input"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInput}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
        />
        <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
        <p className="text-muted-foreground text-sm">
          {isDragging ? 'Rilascia i file qui' : 'Trascina documenti qui o clicca per caricare'}
        </p>
        <p className="text-muted-foreground text-xs mt-1">PDF, DOC, XLS, immagini, ZIP</p>
        {uploadingDocs && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Pending files (new order) */}
      {pendingFiles.length > 0 && (
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">File in attesa (saranno caricati al salvataggio):</p>
          {pendingFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground bg-card rounded px-3 py-1.5 border border-border">
              <File className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="truncate flex-1">{f.name}</span>
              <span className="text-muted-foreground text-xs">{(f.size / 1024).toFixed(0)} KB</span>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400 hover:text-red-300" onClick={(e) => { e.stopPropagation(); removePendingFile(i); }}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded docs (existing order) */}
      {selectedOrder && uploadedDocs.length > 0 && (
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">Documenti caricati:</p>
          {uploadedDocs.map((doc) => (
            <div key={doc.name} className="flex items-center gap-2 text-sm text-muted-foreground bg-card rounded px-3 py-1.5 border border-border">
              <File className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="truncate flex-1">{doc.name}</span>
              <a href={doc.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-primary hover:text-foreground">
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </a>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400 hover:text-red-300" onClick={(e) => { e.stopPropagation(); deleteDoc(selectedOrder.id, doc.name); }}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (

    <>
      <SEOHead title="ERP Ordini | Vesuviano" description="Gestione ordini ERP." lang="it" noIndex />
      <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Ordini</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowFromProforma(true)} variant="outline" className="border-border text-foreground hover:bg-muted/60">
            <FileText className="w-4 h-4 mr-2" />Da Pro-Forma
          </Button>
          <Button onClick={handleCreateManual} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />Nuovo Ordine
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-muted-foreground text-xs">Totale Ordini</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-muted-foreground text-xs">In Produzione</p>
            <p className="text-2xl font-bold text-primary">{stats.inProduzione}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-muted-foreground text-xs">Da Spedire</p>
            <p className="text-2xl font-bold text-purple-300">{stats.daSpedire}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-muted-foreground text-xs">Saldo Dovuto</p>
            <p className="text-2xl font-bold text-green-300">€{stats.saldoDovuto.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cerca ordine, cliente, tracking..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-card border-border text-foreground" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-card border-border text-foreground"><SelectValue placeholder="Stato" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            {ORDER_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nessun ordine trovato</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">N. Ordine</TableHead>
                  <TableHead className="text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-muted-foreground">Stato</TableHead>
                  <TableHead className="text-muted-foreground">Pagamento</TableHead>
                  <TableHead className="text-muted-foreground text-right">Totale</TableHead>
                  <TableHead className="text-muted-foreground text-right">Saldo</TableHead>
                  <TableHead className="text-muted-foreground">Tracking</TableHead>
                  <TableHead className="text-muted-foreground">Data</TableHead>
                  <TableHead className="text-muted-foreground text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(order => (
                  <TableRow key={order.id} className="border-border hover:bg-muted/60">
                    <TableCell className="text-foreground font-mono text-sm">{order.order_number}</TableCell>
                    <TableCell>
                      <div className="text-foreground text-sm">{order.customer_name || '—'}</div>
                      {order.company_name && <div className="text-muted-foreground text-xs">{order.company_name}</div>}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getPaymentBadge(order.payment_status)}</TableCell>
                    <TableCell className="text-right text-foreground">€{order.total_amount?.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-primary">€{order.balance_due?.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{order.tracking_number || '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{format(new Date(order.created_at), 'dd/MM/yy')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => handleEditOrder(order)} className="text-primary hover:text-foreground hover:bg-muted/60">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(order.id)} className="text-red-400 hover:text-red-200 hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4" />
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

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-card border-border text-foreground max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selectedOrder ? 'Modifica Ordine' : 'Nuovo Ordine'}</DialogTitle>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="border-border text-foreground">Annulla</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {selectedOrder ? 'Aggiorna' : 'Crea Ordine'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* From Proforma Modal */}
      <Dialog open={showFromProforma} onOpenChange={setShowFromProforma}>
        <DialogContent className="bg-card border-border text-foreground max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Converti Pro-Forma in Ordine</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {proformas.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nessuna pro-forma pagata disponibile</p>
            ) : proformas.map(pf => (
              <div key={pf.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:border-primary/50 cursor-pointer" onClick={() => handleCreateFromProforma(pf)}>
                <div>
                  <p className="text-foreground text-sm font-medium">{pf.customer_name || 'N/A'}</p>
                  <p className="text-muted-foreground text-xs">{pf.company_name} · €{pf.total_price?.toLocaleString()}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};

export default ERPOrdini;
