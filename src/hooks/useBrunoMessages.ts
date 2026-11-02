import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BrunoMessageData } from "@/components/erp/BrunoMessage";
import type { BrunoChannel } from "@/lib/brunoObjectives";
import { BRUNO_MESSAGE_PAGE_SIZE, compareMessageKeys, mergeMessagePages, unpackMessagePage, type MessageKey } from "@/lib/brunoMessagePaging";

export function useBrunoMessages(leadId: string, filter: "all" | BrunoChannel) {
  const [messages, setMessages] = useState<BrunoMessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [olderError, setOlderError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const scope = `${leadId}:${filter}`;
  const activeScope = useRef(scope);
  activeScope.current = scope;
  const generation = useRef(0);
  const cursor = useRef<MessageKey | null>(null);
  const olderBusy = useRef(false);

  const readPage = useCallback(async (before: MessageKey | null) => {
    const { data, error } = await supabase.rpc("bruno_message_page", {
      p_lead_id: leadId, p_channel: filter === "all" ? undefined : filter,
      p_before_at: before?.created_at, p_before_id: before?.id,
      p_limit: BRUNO_MESSAGE_PAGE_SIZE + 1,
    });
    if (error) throw error;
    return unpackMessagePage((data ?? []) as BrunoMessageData[]);
  }, [leadId, filter]);

  const refreshCounts = useCallback(async (isCurrent: () => boolean) => {
    const { data, error } = await supabase.rpc("bruno_message_summaries", { p_lead_ids: [leadId] });
    if (!isCurrent()) return;
    if (error) { setCounts(null); return; }
    const summary = data?.[0];
    setCounts({ ...((summary?.channel_counts ?? {}) as Record<string, number>), all: Number(summary?.message_count ?? 0) });
  }, [leadId]);

  const reload = useCallback(async () => {
    const request = ++generation.current;
    const isCurrent = () => activeScope.current === scope && request === generation.current;
    setLoading(true); setError(null); setOlderError(null); cursor.current = null; olderBusy.current = false; setLoadingOlder(false);
    try {
      const page = await readPage(null);
      if (!isCurrent()) return;
      setMessages(page.messages); cursor.current = page.cursor; setHasMore(page.hasMore);
    } catch { if (isCurrent()) setError("Impossibile caricare le comunicazioni."); }
    finally { if (isCurrent()) setLoading(false); }
  }, [scope, readPage]);

  // Refresh only a bounded recent page after send/reconnect; never discard loaded history.
  const refresh = useCallback(async () => {
    const request = generation.current;
    const isCurrent = () => activeScope.current === scope && request === generation.current;
    try {
      const page = await readPage(null);
      if (!isCurrent()) return;
      setMessages(current => mergeMessagePages(current, page.messages));
      await refreshCounts(isCurrent);
    } catch { /* The existing timeline remains intact; realtime or manual retry can recover. */ }
  }, [scope, readPage, refreshCounts]);

  const loadOlder = useCallback(async (beforeMerge?: () => void) => {
    if (olderBusy.current || !cursor.current || !hasMore || loading) return;
    olderBusy.current = true; setLoadingOlder(true); setOlderError(null);
    const request = generation.current;
    const isCurrent = () => activeScope.current === scope && request === generation.current;
    try {
      const page = await readPage(cursor.current);
      if (!isCurrent()) return;
      beforeMerge?.();
      setMessages(current => mergeMessagePages(page.messages, current));
      cursor.current = page.cursor; setHasMore(page.hasMore);
    } catch { if (isCurrent()) setOlderError("Impossibile caricare i messaggi precedenti. Riprova."); }
    finally { if (isCurrent()) { olderBusy.current = false; setLoadingOlder(false); } }
  }, [scope, readPage, hasMore, loading]);

  useEffect(() => {
    setMessages([]); setCounts(null); setHasMore(false);
    void reload();
    let active = true;
    const isCurrent = () => active && activeScope.current === scope;
    void refreshCounts(isCurrent);
    let countTimer: ReturnType<typeof setTimeout> | undefined;
    const subscription = supabase.channel(`bruno-page-${leadId}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "crm_messages", filter: `lead_id=eq.${leadId}` }, (payload) => {
        if (!isCurrent()) return;
        if (payload.eventType === "DELETE") {
          const id = payload.old?.id;
          if (typeof id === "string") setMessages(current => current.filter(m => m.id !== id));
        } else {
          const message = payload.new as BrunoMessageData & { lead_id?: string };
          if (message.id && message.lead_id === leadId) {
            setMessages(current => {
              const belongs = filter === "all" || message.channel === filter;
              if (!belongs) return current.filter(m => m.id !== message.id);
              // Backfilled older events remain available through the history cursor.
              const alreadyLoaded = current.some(m => m.id === message.id);
              if (!alreadyLoaded && current[0] && compareMessageKeys(message, current[0]) < 0) return current;
              return mergeMessagePages(current, [message]);
            });
          }
        }
        clearTimeout(countTimer);
        countTimer = setTimeout(() => { void refreshCounts(isCurrent); }, 250);
      }).subscribe();
    return () => { active = false; generation.current += 1; clearTimeout(countTimer); void supabase.removeChannel(subscription); };
  }, [leadId, filter, scope, reload, refreshCounts]);

  return { messages, loading, loadingOlder, hasMore, error, olderError, counts, loadOlder, reload, refresh };
}