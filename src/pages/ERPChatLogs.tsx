import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Search, User, Clock, Globe, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import SEOHead from '@/components/SEOHead';

type ChatConversation = {
  id: string;
  visitor_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  visitor_phone: string | null;
  messages: { role: string; content: string }[];
  lang: string;
  page_url: string | null;
  started_at: string;
  last_message_at: string;
  message_count: number;
};

export default function ERPChatLogs() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ChatConversation | null>(null);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("last_message_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as unknown as ChatConversation[];
    },
    refetchInterval: 15000,
  });

  const filtered = conversations.filter((c) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      (c.visitor_name || "").toLowerCase().includes(s) ||
      (c.visitor_email || "").toLowerCase().includes(s) ||
      (c.visitor_phone || "").toLowerCase().includes(s) ||
      c.messages.some((m) => m.content.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-amber-500" />
          Chat AI - Log Conversazioni
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Tutte le conversazioni dell'assistente AI sul sito ({conversations.length} totali)
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Cerca per nome, email, telefono o contenuto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[#1a1a1a] border-amber-900/20 text-white"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* List */}
        <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {isLoading && <p className="text-gray-500 text-sm">Caricamento...</p>}
          {filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelected(conv)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selected?.id === conv.id
                  ? "bg-amber-900/30 border-amber-600"
                  : "bg-[#1a1a1a] border-amber-900/20 hover:border-amber-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-amber-100 font-medium text-sm truncate">
                  {conv.visitor_name || "Visitatore anonimo"}
                </span>
                <Badge variant="outline" className="text-xs border-amber-900/40 text-amber-400">
                  {conv.lang.toUpperCase()}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 space-y-0.5">
                {conv.visitor_email && <p>{conv.visitor_email}</p>}
                {conv.visitor_phone && <p>{conv.visitor_phone}</p>}
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {format(new Date(conv.last_message_at), "dd/MM/yy HH:mm", { locale: it })}
                  <span>• {conv.message_count} msg</span>
                </div>
              </div>
            </button>
          ))}
          {!isLoading && filtered.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">Nessuna conversazione trovata</p>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2 bg-[#1a1a1a] border border-amber-900/20 rounded-lg overflow-hidden">
          {selected ? (
            <>
              <div className="p-4 border-b border-amber-900/20 bg-[#141414]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-900/30 flex items-center justify-center">
                    <User className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-amber-100 font-semibold">
                      {selected.visitor_name || "Visitatore anonimo"}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {selected.visitor_email && <span>{selected.visitor_email}</span>}
                      {selected.visitor_phone && <span>{selected.visitor_phone}</span>}
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {selected.lang.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                {selected.page_url && (
                  <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    {selected.page_url}
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-1">
                  Inizio: {format(new Date(selected.started_at), "dd/MM/yyyy HH:mm:ss", { locale: it })}
                </p>
              </div>
              <div className="p-4 space-y-3 max-h-[55vh] overflow-y-auto">
                {(selected.messages || []).map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.role === "user"
                          ? "bg-amber-600 text-white rounded-br-md"
                          : "bg-[#252525] text-gray-300 rounded-bl-md"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] text-gray-600">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Seleziona una conversazione</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
