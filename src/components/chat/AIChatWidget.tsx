import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = "https://lgueucxznbqgvhpjzurf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndWV1Y3h6bmJxZ3ZocGp6dXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MDE5ODEsImV4cCI6MjA2NDM3Nzk4MX0.JH9wcGcoyPKQqWT1ExYLRJyg1Jz_8iXezfmeZ9oyZzE";
const CHAT_URL = `${SUPABASE_URL}/functions/v1/vesuviano-chat`;
const VISITOR_ID_KEY = "vesuviano_visitor_id";
const VISITOR_NAME_KEY = "vesuviano_visitor_name";
const VISITOR_SUBMITTED_KEY = "vesuviano_contact_submitted";

function getOrCreateVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

type Msg = { role: "user" | "assistant"; content: string };

function getBrowserLang(): string {
  const nav = navigator.language || (navigator as any).userLanguage || "it";
  const short = nav.substring(0, 2).toLowerCase();
  const supported = ["it", "en", "fr", "de", "es"];
  return supported.includes(short) ? short : "en";
}

const WELCOME_MESSAGES: Record<string, string> = {
  it: "Ciao! 👋 Sono l'assistente Vesuviano. Come posso aiutarti? Chiedimi dei nostri forni, tempi di consegna, o qualsiasi altra cosa!",
  en: "Hello! 👋 I'm the Vesuviano assistant. How can I help you? Ask me about our ovens, delivery times, or anything else!",
  fr: "Bonjour! 👋 Je suis l'assistant Vesuviano. Comment puis-je vous aider? Posez-moi des questions sur nos fours!",
  de: "Hallo! 👋 Ich bin der Vesuviano-Assistent. Wie kann ich Ihnen helfen? Fragen Sie mich über unsere Öfen!",
  es: "¡Hola! 👋 Soy el asistente de Vesuviano. ¿Cómo puedo ayudarte? ¡Pregúntame sobre nuestros hornos!",
};

const INTRO_MESSAGES: Record<string, string> = {
  it: "Prima di risponderti, avrei bisogno cortesemente di queste informazioni. Presentiamoci! 😊",
  en: "Before I answer, I'd kindly need some information. Let's introduce ourselves! 😊",
  fr: "Avant de vous répondre, j'aurais besoin de quelques informations. Faisons connaissance ! 😊",
  de: "Bevor ich antworte, bräuchte ich bitte einige Informationen. Stellen wir uns vor! 😊",
  es: "Antes de responder, necesitaría amablemente esta información. ¡Presentémonos! 😊",
};

const FORM_LABELS: Record<string, { title: string; name: string; email: string; phone: string; submit: string; submitting: string }> = {
  it: { title: "📋 Lascia i tuoi dati per essere ricontattato:", name: "Nome e Cognome", email: "Email", phone: "Telefono", submit: "Invia i miei dati", submitting: "Invio..." },
  en: { title: "📋 Leave your details and we'll get back to you:", name: "Full Name", email: "Email", phone: "Phone", submit: "Send my details", submitting: "Sending..." },
  fr: { title: "📋 Laissez vos coordonnées, nous vous recontacterons :", name: "Nom complet", email: "Email", phone: "Téléphone", submit: "Envoyer mes données", submitting: "Envoi..." },
  de: { title: "📋 Hinterlassen Sie Ihre Daten, wir melden uns bei Ihnen:", name: "Vollständiger Name", email: "E-Mail", phone: "Telefon", submit: "Meine Daten senden", submitting: "Senden..." },
  es: { title: "📋 Deja tus datos y te contactaremos:", name: "Nombre completo", email: "Email", phone: "Teléfono", submit: "Enviar mis datos", submitting: "Enviando..." },
};

const THANK_YOU: Record<string, string> = {
  it: "Grazie! 🎉 Ora rispondo alla tua domanda...",
  en: "Thank you! 🎉 Now let me answer your question...",
  fr: "Merci ! 🎉 Maintenant, laissez-moi répondre à votre question...",
  de: "Danke! 🎉 Jetzt beantworte ich Ihre Frage...",
  es: "¡Gracias! 🎉 Ahora respondo a tu pregunta...",
};

const WELCOME_BACK: Record<string, string> = {
  it: "Bentornato! 👋 Come posso aiutarti oggi?",
  en: "Welcome back! 👋 How can I help you today?",
  fr: "Content de vous revoir ! 👋 Comment puis-je vous aider ?",
  de: "Willkommen zurück! 👋 Wie kann ich Ihnen heute helfen?",
  es: "¡Bienvenido de nuevo! 👋 ¿Cómo puedo ayudarte hoy?",
};

function ContactForm({ onSubmitted, lang }: { onSubmitted: (name: string, email?: string, phone?: string) => void; lang: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const labels = FORM_LABELS[lang] || FORM_LABELS.en;

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
      onSubmitted(form.name.split(" ")[0] || "", form.email || undefined, form.phone || undefined);
    } catch {
      onSubmitted(form.name.split(" ")[0] || "", form.email || undefined, form.phone || undefined);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-vesuviano-50 border border-vesuviano-200 rounded-xl p-3 space-y-2 my-1">
      <p className="text-xs font-medium text-stone-700">{labels.title}</p>
      <input
        placeholder={labels.name}
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        className="w-full text-base md:text-sm rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:ring-1 focus:ring-vesuviano-500"
        maxLength={100}
      />
      <input
        type="email"
        placeholder={labels.email}
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        className="w-full text-base md:text-sm rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:ring-1 focus:ring-vesuviano-500"
        maxLength={255}
      />
      <input
        type="tel"
        placeholder={labels.phone}
        value={form.phone}
        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        className="w-full text-base md:text-sm rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:ring-1 focus:ring-vesuviano-500"
        maxLength={20}
      />
      <Button type="submit" size="sm" className="w-full bg-vesuviano-500 hover:bg-vesuviano-600 text-white" disabled={submitting}>
        {submitting ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}

export default function AIChatWidget() {
  const [lang] = useState(getBrowserLang);
  const [visitorId] = useState(getOrCreateVisitorId);
  const [open, setOpen] = useState(false);

  // Detect returning visitor (even without name)
  const savedName = localStorage.getItem(VISITOR_NAME_KEY);
  const hasSubmittedBefore = localStorage.getItem(VISITOR_SUBMITTED_KEY) === "true";
  const isReturning = hasSubmittedBefore;

  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: isReturning
        ? savedName
          ? (WELCOME_BACK[lang] || WELCOME_BACK.en).replace("!", ` ${savedName}!`)
          : (WELCOME_BACK[lang] || WELCOME_BACK.en)
        : (WELCOME_MESSAGES[lang] || WELCOME_MESSAGES.en),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [contactFormShown, setContactFormShown] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(isReturning);
  const [showWhatsAppCta, setShowWhatsAppCta] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save conversation to DB
  const saveConversation = useCallback(async (msgs: Msg[], contactInfo?: { name?: string; email?: string; phone?: string }) => {
    const payload: Record<string, unknown> = {
      visitor_id: visitorId,
      messages: msgs,
      lang,
      page_url: window.location.pathname,
      last_message_at: new Date().toISOString(),
      message_count: msgs.length,
    };
    if (contactInfo) {
      if (contactInfo.name) payload.visitor_name = contactInfo.name;
      if (contactInfo.email) payload.visitor_email = contactInfo.email;
      if (contactInfo.phone) payload.visitor_phone = contactInfo.phone;
    }

    try {
      if (conversationIdRef.current) {
        const { error } = await supabase.from("chat_conversations").update(payload).eq("id", conversationIdRef.current);
        if (error) console.error("Chat save update error:", error);
      } else {
        const { data, error } = await supabase.from("chat_conversations").insert(payload as any).select("id").single();
        if (error) console.error("Chat save insert error:", error);
        if (data) conversationIdRef.current = data.id;
      }
    } catch (e) { console.error("Chat save exception:", e); }
  }, [visitorId, lang]);

  const [showMobileBubble, setShowMobileBubble] = useState(false);

  useEffect(() => {
    if (hasAutoOpened) return;
    const isMobile = window.innerWidth < 768;
    const timer = setTimeout(() => {
      if (isMobile) {
        setShowMobileBubble(true);
        setHasAutoOpened(true);
      } else {
        setOpen(true);
        setHasAutoOpened(true);
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [hasAutoOpened]);

  useEffect(() => {
    if (open) setShowPulse(false);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, contactFormShown]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const callAI = useCallback(
    async (allMessages: Msg[]) => {
      setIsLoading(true);
      let assistantSoFar = "";

      const upsertAssistant = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && assistantSoFar.startsWith(last.content.slice(0, 10))) {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
            );
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({ messages: allMessages, lang }),
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
        // Save conversation after AI response
        setMessages((prev) => { saveConversation(prev); return prev; });
      }
    },
    [lang, saveConversation]
  );

  const handleContactSubmitted = useCallback((name: string, email?: string, phone?: string) => {
    setContactSubmitted(true);
    setContactFormShown(false);
    // Remember the visitor
    if (name) localStorage.setItem(VISITOR_NAME_KEY, name);
    localStorage.setItem(VISITOR_SUBMITTED_KEY, "true");
    const thankYou = THANK_YOU[lang] || THANK_YOU.en;
    const nameMsg = name ? thankYou.replace("!", ` ${name}!`) : thankYou;
    setMessages((prev) => {
      const updated = [...prev, { role: "assistant" as const, content: nameMsg }];
      saveConversation(updated, { name, email, phone });
      return updated;
    });
    setShowWhatsAppCta(true);
    // Send pending message to AI after a short delay
    setPendingMessage((pending) => {
      if (pending) {
        setTimeout(() => {
          setMessages((prev) => {
            callAI(prev);
            return prev;
          });
        }, 800);
      }
      return null;
    });
  }, [lang, callAI, saveConversation]);

  const send = useCallback(
    (text: string) => {
      if (!text.trim() || isLoading) return;
      const userMsg: Msg = { role: "user", content: text.trim() };
      setInput("");

      if (!contactSubmitted) {
        const introMsg = INTRO_MESSAGES[lang] || INTRO_MESSAGES.en;
        setMessages((prev) => {
          const updated = [...prev, userMsg, { role: "assistant" as const, content: introMsg }];
          saveConversation(updated);
          return updated;
        });
        setContactFormShown(true);
        setPendingMessage(text.trim());
      } else {
        setMessages((prev) => {
          const updated = [...prev, userMsg];
          saveConversation(updated);
          callAI(updated);
          return updated;
        });
      }
    },
    [isLoading, contactSubmitted, lang, callAI, saveConversation]
  );

  const renderMessageContent = (msg: Msg) => {
    if (msg.role === "assistant") {
      return (
        <div className="prose prose-sm max-w-none [&_p]:m-0">
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
      );
    }
    return msg.content;
  };

  return (
    <>
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

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full bg-vesuviano-500 text-white shadow-lg flex items-center justify-center md:hidden"
        aria-label="Apri assistente AI"
      >
        {showPulse && !open && (
          <span className="absolute inset-0 rounded-full bg-vesuviano-500 animate-ping opacity-30" />
        )}
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-4 md:bottom-24 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-md bg-white border border-stone-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden transform-gpu"
          style={{ height: "min(500px, calc(100dvh - 10rem))" }}
        >
          <div className="bg-vesuviano-500 text-white px-4 py-3 flex items-center gap-3">
            <img src="/lovable-uploads/vesuviano-logo-bianco.png" alt="Vesuviano" className="h-6 w-auto" />
            <div>
              <p className="font-semibold text-sm">Assistente Vesuviano</p>
              <p className="text-xs opacity-80">AI Oven Consultant</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto hover:opacity-70">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-vesuviano-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-vesuviano-600" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === "user" ? "bg-vesuviano-500 text-white rounded-br-md" : "bg-stone-100 text-stone-800 rounded-bl-md"}`}>
                  {renderMessageContent(msg)}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-vesuviano-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-vesuviano-600" />
                  </div>
                )}
              </div>
            ))}

            {contactFormShown && !contactSubmitted && (
              <ContactForm onSubmitted={handleContactSubmitted} lang={lang} />
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
              placeholder={lang === "it" ? "Scrivi il tuo messaggio..." : lang === "fr" ? "Écrivez votre message..." : lang === "de" ? "Schreiben Sie Ihre Nachricht..." : lang === "es" ? "Escribe tu mensaje..." : "Type your message..."}
              className="flex-1 bg-transparent text-base md:text-sm outline-none placeholder:text-stone-400"
              disabled={isLoading || (contactFormShown && !contactSubmitted)}
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              disabled={!input.trim() || isLoading || (contactFormShown && !contactSubmitted)}
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