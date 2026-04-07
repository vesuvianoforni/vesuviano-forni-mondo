import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

const SUPABASE_URL = "https://lgueucxznbqgvhpjzurf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndWV1Y3h6bmJxZ3ZocGp6dXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MDE5ODEsImV4cCI6MjA2NDM3Nzk4MX0.JH9wcGcoyPKQqWT1ExYLRJyg1Jz_8iXezfmeZ9oyZzE";
const CHAT_URL = `${SUPABASE_URL}/functions/v1/vesuviano-chat`;

type Msg = { role: "user" | "assistant"; content: string };

const CONTACT_TRIGGER = "Lascia i tuoi dati";

const WELCOME_MESSAGES: Record<string, string> = {
  it: "Ciao! 👋 Sono l'assistente Vesuviano. Come posso aiutarti? Chiedimi dei nostri forni, tempi di consegna, o qualsiasi altra cosa!",
  en: "Hello! 👋 I'm the Vesuviano assistant. How can I help you? Ask me about our ovens, delivery times, or anything else!",
  fr: "Bonjour! 👋 Je suis l'assistant Vesuviano. Comment puis-je vous aider? Posez-moi des questions sur nos fours!",
  de: "Hallo! 👋 Ich bin der Vesuviano-Assistent. Wie kann ich Ihnen helfen? Fragen Sie mich über unsere Öfen!",
  es: "¡Hola! 👋 Soy el asistente de Vesuviano. ¿Cómo puedo ayudarte? ¡Pregúntame sobre nuestros hornos!",
};

function ContactForm({ onSubmitted }: { onSubmitted: (name: string) => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() && !form.phone.trim()) return;
    setSubmitting(true);
    try {
      await supabase.from("website_leads").insert({
        first_name: form.name.split(" ")[0] || "-",
        last_name: form.name.split(" ").slice(1).join(" ") || "-",
        email: form.email || null,
        phone: form.phone || null,
        form_type: "ai_chat",
        notes: "Contatto generato dall'assistente AI del sito.",
      });
      onSubmitted(form.name.split(" ")[0] || "");
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-vesuviano-50 border border-vesuviano-200 rounded-xl p-3 space-y-2 my-1">
      <p className="text-xs font-medium text-stone-700">📋 Lascia i tuoi dati per essere ricontattato:</p>
      <input
        placeholder="Nome e Cognome"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        className="w-full text-sm rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:ring-1 focus:ring-vesuviano-500"
        maxLength={100}
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        className="w-full text-sm rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:ring-1 focus:ring-vesuviano-500"
        maxLength={255}
      />
      <input
        type="tel"
        placeholder="Telefono"
        value={form.phone}
        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        className="w-full text-sm rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:ring-1 focus:ring-vesuviano-500"
        maxLength={20}
      />
      <Button type="submit" size="sm" className="w-full bg-vesuviano-500 hover:bg-vesuviano-600 text-white" disabled={submitting}>
        {submitting ? "Invio..." : "Invia i miei dati"}
      </Button>
    </form>
  );
}

export default function AIChatWidget() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.substring(0, 2) || "it";
  
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: WELCOME_MESSAGES[currentLang] || WELCOME_MESSAGES.it },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [contactFormShown, setContactFormShown] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [showWhatsAppCta, setShowWhatsAppCta] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-open after 15 seconds
  useEffect(() => {
    if (hasAutoOpened) return;
    const timer = setTimeout(() => {
      setOpen(true);
      setHasAutoOpened(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [hasAutoOpened]);

  // Hide pulse when opened
  useEffect(() => {
    if (open) setShowPulse(false);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, contactFormShown]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Detect contact trigger
  useEffect(() => {
    if (contactSubmitted) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "assistant" && lastMsg.content.includes(CONTACT_TRIGGER)) {
      setContactFormShown(true);
    }
  }, [messages, contactSubmitted]);

  const handleContactSubmitted = (name: string) => {
    setContactSubmitted(true);
    setContactFormShown(false);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: `Grazie ${name}! 🎉 Un nostro esperto ti contatterà al più presto.` },
    ]);
    setShowWhatsAppCta(true);
  };

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;
      const userMsg: Msg = { role: "user", content: text.trim() };
      const allMessages = [...messages, userMsg];
      setMessages(allMessages);
      setInput("");
      setIsLoading(true);

      let assistantSoFar = "";

      const upsertAssistant = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && prev.length > allMessages.length) {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
            );
          }
          return [...prev.slice(0, allMessages.length), { role: "assistant", content: assistantSoFar }];
        });
      };

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({ messages: allMessages }),
        });

        if (!resp.ok || !resp.body) throw new Error("Stream failed");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) upsertAssistant(content);
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }
      } catch {
        upsertAssistant("Mi dispiace, si è verificato un errore. Riprova o contattaci al 081 19231684.");
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  const renderMessageContent = (msg: Msg) => {
    const displayContent = msg.content.replace(CONTACT_TRIGGER, "").trim();
    if (msg.role === "assistant") {
      return (
        <div className="prose prose-sm max-w-none [&_p]:m-0">
          <ReactMarkdown>{displayContent || msg.content}</ReactMarkdown>
        </div>
      );
    }
    return msg.content;
  };

  return (
    <>
      {/* Desktop floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-vesuviano-500 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center hover:scale-105 hidden md:flex"
        aria-label="Apri assistente AI"
      >
        {showPulse && !open && (
          <span className="absolute inset-0 rounded-full bg-vesuviano-500 animate-ping opacity-30" />
        )}
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Mobile AI icon - positioned above ContactBar */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full bg-vesuviano-500 text-white shadow-lg flex items-center justify-center md:hidden"
        aria-label="Apri assistente AI"
      >
        {showPulse && !open && (
          <span className="absolute inset-0 rounded-full bg-vesuviano-500 animate-ping opacity-30" />
        )}
        {open ? <X className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-4 md:bottom-24 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-md bg-white border border-stone-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "min(500px, calc(100vh - 10rem))" }}
        >
          {/* Header */}
          <div className="bg-vesuviano-500 text-white px-4 py-3 flex items-center gap-3">
            <img 
              src="/lovable-uploads/vesuviano-logo-bianco.png" 
              alt="Vesuviano" 
              className="h-6 w-auto"
            />
            <div>
              <p className="font-semibold text-sm">Assistente Vesuviano</p>
              <p className="text-xs opacity-80">Consulenza forni AI</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto hover:opacity-70">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-vesuviano-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-vesuviano-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-vesuviano-500 text-white rounded-br-md"
                      : "bg-stone-100 text-stone-800 rounded-bl-md"
                  }`}
                >
                  {renderMessageContent(msg)}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-vesuviano-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-vesuviano-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Inline contact form */}
            {contactFormShown && !contactSubmitted && (
              <ContactForm onSubmitted={handleContactSubmitted} />
            )}

            {/* WhatsApp CTA */}
            {showWhatsAppCta && (
              <a
                href="https://wa.link/a2959l"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[#1da851] transition-colors my-1 w-fit"
              >
                <MessageCircle className="w-4 h-4" />
                Scrivici su WhatsApp
              </a>
            )}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-vesuviano-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-vesuviano-600" />
                </div>
                <div className="bg-stone-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-stone-200 px-3 py-2 flex gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Scrivi il tuo messaggio..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              disabled={!input.trim() || isLoading}
              className="h-8 w-8 text-vesuviano-500 hover:text-vesuviano-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
