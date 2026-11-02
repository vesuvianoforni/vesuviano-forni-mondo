import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { loadThreads, newThread, type BrunoThread } from '@/lib/brunoThreads';
import { decodeMarioMessages, mergeMarioThreads, type MarioThread } from '@/lib/marioThreads';

export function useMarioThreads() {
  const [threads, setThreads] = useState<MarioThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const live = useRef(true);
  const request = useRef(0);

  const reload = useCallback(async () => {
    const generation = ++request.current;
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Accedi per ritrovare le conversazioni di Mario.');
      const legacy = loadThreads('mario-agent-threads').filter(t => t.messages?.length && /^[0-9a-f-]{36}$/i.test(t.id));
      if (legacy.length) {
        const { error: importError } = await supabase.from('outreach_chat_threads').upsert(legacy.map(t => ({
          id: t.id, user_id: user.id, title: t.title.slice(0, 120) || 'Conversazione recuperata',
          messages: decodeMarioMessages(t.messages).map(m => ({ ...m })), updated_at: t.updatedAt,
        })), { onConflict: 'id', ignoreDuplicates: true });
        if (importError) throw new Error('Non riesco a salvare le vecchie chat. Lo storico nel browser è ancora conservato.');
      }
      const remote: MarioThread[] = [];
      for (let offset = 0; ; offset += 100) {
        const { data, error: readError } = await supabase.from('outreach_chat_threads').select('*')
          .eq('user_id', user.id).is('archived_at', null).order('updated_at', { ascending: false }).order('id').range(offset, offset + 99);
        if (readError) throw new Error('Non riesco a caricare le chat salvate. Riprova senza avviare di nuovo la ricerca.');
        for (const row of data ?? []) remote.push({ id: row.id, title: row.title, updatedAt: row.updated_at, messages: decodeMarioMessages(row.messages), status: row.status });
        if ((data?.length ?? 0) < 100) break;
      }
      if (!live.current || generation !== request.current) return;
      setThreads(prev => {
        const drafts = prev.filter(t => !t.messages.length && !remote.some(r => r.id === t.id));
        const result = mergeMarioThreads(remote, drafts);
        return result.length ? result : [newThread()];
      });
      setError('');
    } catch (e) {
      if (live.current && generation === request.current) setError((e as Error).message);
    } finally {
      if (live.current && generation === request.current) setLoading(false);
    }
  }, []);

  useEffect(() => { live.current = true; void reload(); return () => { live.current = false; request.current++; }; }, [reload]);
  useEffect(() => {
    if (!threads.some(t => t.status === 'running')) return;
    const timer = window.setInterval(() => void reload(), 4000);
    return () => window.clearInterval(timer);
  }, [threads, reload]);

  const updateThread = useCallback((t: BrunoThread) => {
    setThreads(prev => [t, ...prev.filter(x => x.id !== t.id)]);
  }, []);
  const createThread = () => {
    const t = newThread(); setThreads(prev => [t, ...prev.filter(x => x.messages.length)]); return t;
  };
  const archiveThread = async (id: string) => {
    const { error: archiveError } = await supabase.from('outreach_chat_threads').update({ archived_at: new Date().toISOString() }).eq('id', id);
    if (archiveError) { setError('La conversazione non è stata archiviata.'); return; }
    setThreads(prev => { const next = prev.filter(t => t.id !== id); return next.length ? next : [newThread()]; });
  };
  return { threads, loading, error, reload, updateThread, createThread, archiveThread };
}