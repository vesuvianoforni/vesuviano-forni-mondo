import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Copy, Trash2, Upload, Loader2, ExternalLink, FileVideo, X } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

const LANGS = [
  { code: 'en', label: 'Inglese' },
  { code: 'it', label: 'Italiano' },
  { code: 'fr', label: 'Francese' },
  { code: 'de', label: 'Tedesco' },
  { code: 'es', label: 'Spagnolo' },
];

interface Video {
  id: string;
  title: string;
  language: string;
  file_path: string;
  public_url: string;
  size_bytes: number | null;
  created_at: string;
}

const db = supabase as any;

const ERPVideoCommerciali = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('en');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await db.from('commercial_videos').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Errore caricamento video');
    setVideos(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const upload = async () => {
    if (!file || !title.trim()) { toast.error('Inserisci titolo e file'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const slug = title.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
      const path = `commercial/${language}/${Date.now()}-${slug}.${ext}`;
      const { error: upErr } = await supabase.storage.from('videos').upload(path, file, {
        contentType: file.type || 'video/mp4', cacheControl: '31536000',
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('videos').getPublicUrl(path);
      const { data: u } = await supabase.auth.getUser();
      const { error } = await db.from('commercial_videos').insert({
        title: title.trim(), language, file_path: path, public_url: pub.publicUrl,
        size_bytes: file.size, created_by: u.user?.id,
      });
      if (error) throw error;
      toast.success('Video caricato');
      setTitle(''); setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      load();
    } catch (e: any) {
      toast.error('Errore upload: ' + (e?.message || e));
    } finally {
      setUploading(false);
    }
  };

  const remove = async (v: Video) => {
    if (!confirm(`Eliminare "${v.title}"? Il link smetterà di funzionare.`)) return;
    await supabase.storage.from('videos').remove([v.file_path]);
    const { error } = await db.from('commercial_videos').delete().eq('id', v.id);
    if (error) toast.error('Errore eliminazione'); else { toast.success('Eliminato'); load(); }
  };

  const copy = (url: string) => { navigator.clipboard.writeText(url); toast.success('Link copiato'); };

  const shown = filter === 'all' ? videos : videos.filter(v => v.language === filter);
  const langLabel = (c: string) => LANGS.find(l => l.code === c)?.label || c;

  return (
    <>
      <SEOHead title="Video Commerciali | ERP Vesuviano" description="Video commerciali" lang="it" noIndex />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-amber-100">Video Commerciali</h1>
          <p className="text-gray-400 mt-1">Carica i video per lingua e condividi il link pubblico.</p>
        </div>

        <Card className="bg-[#1a1a1a] border-amber-900/20">
          <CardContent className="p-5 grid gap-4 md:grid-cols-[2fr_1fr_2fr_auto] items-end">
            <div>
              <Label className="text-gray-300">Titolo</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Es. Presentazione Real Bosco" />
            </div>
            <div>
              <Label className="text-gray-300">Lingua</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LANGS.map(l => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300">File video</Label>
              <Input ref={fileRef} type="file" accept="video/*" onChange={e => setFile(e.target.files?.[0] || null)} />
            </div>
            <Button onClick={upload} disabled={uploading} className="bg-amber-600 hover:bg-amber-700">
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Carica
            </Button>
          </CardContent>
        </Card>

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">Tutti ({videos.length})</TabsTrigger>
            {LANGS.map(l => (
              <TabsTrigger key={l.code} value={l.code}>
                {l.label} ({videos.filter(v => v.language === l.code).length})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
        ) : shown.length === 0 ? (
          <p className="text-gray-500 text-center py-12">Nessun video caricato.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map(v => (
              <Card key={v.id} className="bg-[#1a1a1a] border-amber-900/20 overflow-hidden">
                <video src={v.public_url} controls preload="metadata" className="w-full aspect-video bg-black" />
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between gap-2">
                    <p className="text-amber-100 font-medium">{v.title}</p>
                    <span className="text-xs text-amber-400 shrink-0">{langLabel(v.language)}</span>
                  </div>
                  <Input readOnly value={v.public_url} onFocus={e => e.target.select()} className="text-xs" />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copy(v.public_url)}><Copy className="w-4 h-4 mr-1" />Copia link</Button>
                    <Button size="sm" variant="outline" asChild><a href={v.public_url} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4" /></a></Button>
                    <Button size="sm" variant="ghost" className="text-red-400 ml-auto" onClick={() => remove(v)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ERPVideoCommerciali;
