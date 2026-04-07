import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Brain, GripVertical } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface KnowledgeEntry {
  id: string;
  category: string;
  title: string;
  content: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: 'azienda', label: '🏭 Azienda' },
  { value: 'prodotti', label: '🔥 Prodotti' },
  { value: 'servizi', label: '🛠️ Servizi' },
  { value: 'caratteristiche', label: '⭐ Caratteristiche' },
  { value: 'contatti', label: '📞 Contatti' },
  { value: 'prezzi', label: '💰 Prezzi & Policy' },
  { value: 'faq', label: '❓ FAQ' },
  { value: 'generale', label: '📋 Generale' },
];

const EmptyForm = { category: 'generale', title: '', content: '', is_active: true };

const ERPKnowledgeBase = () => {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeEntry | null>(null);
  const [form, setForm] = useState(EmptyForm);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from('ai_knowledge_base')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(EmptyForm);
    setDialogOpen(true);
  };

  const openEdit = (entry: KnowledgeEntry) => {
    setEditing(entry);
    setForm({ category: entry.category, title: entry.title, content: entry.content, is_active: entry.is_active });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: 'Compila tutti i campi', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from('ai_knowledge_base')
          .update({ category: form.category, title: form.title, content: form.content, is_active: form.is_active })
          .eq('id', editing.id);
        if (error) throw error;
        toast({ title: 'Voce aggiornata' });
      } else {
        const maxSort = entries.length > 0 ? Math.max(...entries.map(e => e.sort_order)) + 1 : 0;
        const { error } = await supabase
          .from('ai_knowledge_base')
          .insert({ category: form.category, title: form.title, content: form.content, is_active: form.is_active, sort_order: maxSort });
        if (error) throw error;
        toast({ title: 'Voce aggiunta' });
      }
      setDialogOpen(false);
      fetchEntries();
    } catch (err: any) {
      toast({ title: 'Errore', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questa voce dalla knowledge base?')) return;
    const { error } = await supabase.from('ai_knowledge_base').delete().eq('id', id);
    if (error) {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Voce eliminata' });
      fetchEntries();
    }
  };

  const toggleActive = async (entry: KnowledgeEntry) => {
    const { error } = await supabase
      .from('ai_knowledge_base')
      .update({ is_active: !entry.is_active })
      .eq('id', entry.id);
    if (error) {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    } else {
      fetchEntries();
    }
  };

  const filtered = filterCategory === 'all' ? entries : entries.filter(e => e.category === filterCategory);
  const catLabel = (cat: string) => CATEGORIES.find(c => c.value === cat)?.label || cat;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-100 flex items-center gap-2">
            <Brain className="h-6 w-6 text-amber-500" />
            Knowledge Base AI
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Gestisci le informazioni che l'assistente AI utilizza per rispondere ai clienti
          </p>
        </div>
        <Button onClick={openNew} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Aggiungi voce
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a1a] border-amber-900/20">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Totale voci</p>
            <p className="text-2xl font-bold text-amber-100">{entries.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-amber-900/20">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Attive</p>
            <p className="text-2xl font-bold text-green-400">{entries.filter(e => e.is_active).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-amber-900/20">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Disattivate</p>
            <p className="text-2xl font-bold text-gray-500">{entries.filter(e => !e.is_active).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-amber-900/20">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Categorie</p>
            <p className="text-2xl font-bold text-amber-100">{new Set(entries.map(e => e.category)).size}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Filtra:</span>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48 bg-[#1a1a1a] border-amber-900/30 text-amber-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-amber-900/30">
            <SelectItem value="all" className="text-amber-100">Tutte le categorie</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value} className="text-amber-100">{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Entries list */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Caricamento...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Nessuna voce trovata</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <Card key={entry.id} className={`bg-[#1a1a1a] border-amber-900/20 ${!entry.is_active ? 'opacity-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <GripVertical className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-400">
                        {catLabel(entry.category)}
                      </span>
                      <h3 className="font-semibold text-amber-100">{entry.title}</h3>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{entry.content}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch
                      checked={entry.is_active}
                      onCheckedChange={() => toggleActive(entry)}
                      className="data-[state=checked]:bg-green-600"
                    />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(entry)} className="text-gray-400 hover:text-amber-200">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} className="text-gray-400 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-amber-900/30 text-amber-100 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-amber-100">
              {editing ? 'Modifica voce' : 'Nuova voce'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Categoria</label>
              <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="bg-[#0f0f0f] border-amber-900/30 text-amber-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-amber-900/30">
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value} className="text-amber-100">{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Titolo</label>
              <Input
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="es. Tempi di consegna"
                className="bg-[#0f0f0f] border-amber-900/30 text-amber-100"
                maxLength={200}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Contenuto</label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Scrivi le informazioni che l'AI deve conoscere..."
                className="bg-[#0f0f0f] border-amber-900/30 text-amber-100 min-h-[120px]"
                maxLength={2000}
              />
              <p className="text-xs text-gray-600 mt-1">{form.content.length}/2000</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm(f => ({ ...f, is_active: v }))}
                className="data-[state=checked]:bg-green-600"
              />
              <span className="text-sm text-gray-400">Attiva (visibile all'AI)</span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-gray-400">
                Annulla
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
                {saving ? 'Salvataggio...' : editing ? 'Salva modifiche' : 'Aggiungi'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ERPKnowledgeBase;
