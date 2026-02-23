import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Pencil, Trash2, Eye, Sparkles, Image, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { BlogPost } from '@/hooks/useBlogPosts';

const LANGS = ['it', 'en', 'fr', 'de', 'es'] as const;
const CATEGORIES = ['general', 'guide', 'ricette', 'novita', 'tecnica'];

const emptyPost = (): Partial<BlogPost> => ({
  slug_it: '', slug_en: '', slug_fr: '', slug_de: '', slug_es: '',
  title_it: '', title_en: '', title_fr: '', title_de: '', title_es: '',
  meta_description_it: '', meta_description_en: '', meta_description_fr: '', meta_description_de: '', meta_description_es: '',
  content_it: '', content_en: '', content_fr: '', content_de: '', content_es: '',
  featured_image: '', category: 'general', author: 'Vesuviano', is_published: false,
});

const AdminBlog = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<typeof LANGS[number]>('it');

  // AI generation state
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiTone, setAiTone] = useState('');
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (post: Partial<BlogPost>) => {
      const { id, created_at, updated_at, ...rest } = post as any;
      const payload = {
        ...rest,
        published_at: post.is_published ? (post.published_at || new Date().toISOString()) : null,
      };
      if (id) {
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('blog_posts').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      setIsDialogOpen(false);
      setEditingPost(null);
      toast.success('Articolo salvato!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success('Articolo eliminato');
    },
  });

  const updateField = (field: string, value: string | boolean) => {
    if (!editingPost) return;
    setEditingPost({ ...editingPost, [field]: value });
  };

  const openNew = () => {
    setEditingPost(emptyPost());
    setActiveLang('it');
    setIsDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost({ ...post });
    setActiveLang('it');
    setIsDialogOpen(true);
  };

  const generateArticle = async () => {
    if (!aiTopic.trim()) {
      toast.error('Inserisci un argomento');
      return;
    }
    setIsGeneratingArticle(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-article', {
        body: { topic: aiTopic, keywords: aiKeywords, tone: aiTone },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const article = data.article;
      const newPost = {
        ...emptyPost(),
        ...article,
        author: 'Vesuviano',
        is_published: false,
      };
      setEditingPost(newPost);
      setShowAIDialog(false);
      setIsDialogOpen(true);
      setAiTopic('');
      setAiKeywords('');
      setAiTone('');
      toast.success('Articolo generato! Rivedi e salva.');
    } catch (e: any) {
      toast.error(e?.message || 'Errore nella generazione');
    } finally {
      setIsGeneratingArticle(false);
    }
  };

  const generateCover = async () => {
    if (!editingPost) return;
    const topic = editingPost.title_it || editingPost.title_en || 'pizza oven';
    setIsGeneratingCover(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-cover', {
        body: { topic },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setEditingPost({ ...editingPost, featured_image: data.imageUrl });
      toast.success('Copertina generata!');
    } catch (e: any) {
      toast.error(e?.message || 'Errore nella generazione immagine');
    } finally {
      setIsGeneratingCover(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/configuratore')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Admin
            </Button>
            <h1 className="text-2xl font-bold">Gestione Blog</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAIDialog(true)}>
              <Sparkles className="h-4 w-4 mr-2" /> Genera con AI
            </Button>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Nuovo Articolo</Button>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-card rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3">Titolo</th>
                <th className="text-left p-3">Categoria</th>
                <th className="text-left p-3">Stato</th>
                <th className="text-left p-3">Data</th>
                <th className="text-right p-3">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Caricamento...</td></tr>
              ) : posts?.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Nessun articolo</td></tr>
              ) : posts?.map((post) => (
                <tr key={post.id} className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium">{post.title_it}</td>
                  <td className="p-3">{post.category}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${post.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {post.is_published ? 'Pubblicato' : 'Bozza'}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {post.published_at ? new Date(post.published_at).toLocaleDateString('it') : '-'}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => window.open(`/it/blog/${post.slug_it}`, '_blank')}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(post)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (confirm('Eliminare questo articolo?')) deleteMutation.mutate(post.id);
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Generation Dialog */}
        <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Genera Articolo con AI
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Argomento / Titolo *</Label>
                <Input
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="es. Come scegliere il forno a legna perfetto per la tua pizzeria"
                />
              </div>
              <div>
                <Label>Keyword target (opzionale)</Label>
                <Input
                  value={aiKeywords}
                  onChange={(e) => setAiKeywords(e.target.value)}
                  placeholder="es. forno a legna, pizza napoletana, forno professionale"
                />
              </div>
              <div>
                <Label>Tono (opzionale)</Label>
                <Input
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  placeholder="es. professionale, informativo, coinvolgente"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                L'AI genererà l'articolo completo in tutte e 5 le lingue (IT, EN, FR, DE, ES) con slug SEO, meta description e contenuto ottimizzato.
              </p>
              <Button
                className="w-full"
                onClick={generateArticle}
                disabled={isGeneratingArticle}
              >
                {isGeneratingArticle ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generazione in corso (~30s)...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> Genera Articolo</>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost?.id ? 'Modifica Articolo' : 'Nuovo Articolo'}</DialogTitle>
            </DialogHeader>

            {editingPost && (
              <div className="space-y-6">
                {/* Language tabs */}
                <div className="flex gap-2">
                  {LANGS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setActiveLang(l)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        activeLang === l ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Localized fields */}
                <div className="space-y-4">
                  <div>
                    <Label>Slug ({activeLang.toUpperCase()})</Label>
                    <Input
                      value={(editingPost as any)[`slug_${activeLang}`] || ''}
                      onChange={(e) => updateField(`slug_${activeLang}`, e.target.value)}
                      placeholder="url-friendly-slug"
                    />
                  </div>
                  <div>
                    <Label>Titolo ({activeLang.toUpperCase()})</Label>
                    <Input
                      value={(editingPost as any)[`title_${activeLang}`] || ''}
                      onChange={(e) => updateField(`title_${activeLang}`, e.target.value)}
                      placeholder="Titolo dell'articolo"
                    />
                  </div>
                  <div>
                    <Label>Meta Description ({activeLang.toUpperCase()})</Label>
                    <Textarea
                      value={(editingPost as any)[`meta_description_${activeLang}`] || ''}
                      onChange={(e) => updateField(`meta_description_${activeLang}`, e.target.value)}
                      placeholder="Descrizione SEO (max 160 caratteri)"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Contenuto ({activeLang.toUpperCase()}) — HTML</Label>
                    <Textarea
                      value={(editingPost as any)[`content_${activeLang}`] || ''}
                      onChange={(e) => updateField(`content_${activeLang}`, e.target.value)}
                      placeholder="<h2>Introduzione</h2><p>Il contenuto dell'articolo...</p>"
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Common fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Immagine di copertina</Label>
                    <div className="flex gap-2">
                      <Input
                        value={editingPost.featured_image || ''}
                        onChange={(e) => updateField('featured_image', e.target.value)}
                        placeholder="https://..."
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={generateCover}
                        disabled={isGeneratingCover}
                      >
                        {isGeneratingCover ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <><Image className="h-4 w-4 mr-1" /> AI</>
                        )}
                      </Button>
                    </div>
                    {editingPost.featured_image && (
                      <img src={editingPost.featured_image} alt="Cover preview" className="mt-2 rounded-lg max-h-32 object-cover" />
                    )}
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Select value={editingPost.category || 'general'} onValueChange={(v) => updateField('category', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Autore</Label>
                    <Input
                      value={editingPost.author || ''}
                      onChange={(e) => updateField('author', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <Switch
                      checked={editingPost.is_published || false}
                      onCheckedChange={(v) => updateField('is_published', v)}
                    />
                    <Label>Pubblicato</Label>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => saveMutation.mutate(editingPost)}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? 'Salvataggio...' : 'Salva Articolo'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminBlog;
