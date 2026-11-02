import { AlertCircle, Bot, Mail, MessageCircle, Phone, StickyNote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CHANNELS, type BrunoChannel } from "@/lib/brunoObjectives";
import { cn } from "@/lib/utils";

export interface BrunoMessageData {
  id: string; channel: BrunoChannel; direction: string; sender: string; subject: string | null;
  body: string; status: string; ai_generated: boolean; error: string | null; created_at: string;
  metadata?: { recording_url?: string | null; duration_seconds?: number } | null;
}

const icons = { whatsapp_api: Bot, wasender: MessageCircle, email: Mail, note: StickyNote, call: Phone };

export function BrunoMessage({ message, customerName, showDate }: { message: BrunoMessageData; customerName: string; showDate: boolean }) {
  const Icon = icons[message.channel] ?? StickyNote;
  const incoming = message.direction === "inbound";
  const internal = message.direction === "internal";
  const date = new Date(message.created_at);
  const author = internal ? "Nota interna" : incoming ? customerName : message.channel === "wasender" ? "Gennaro" : message.channel === "whatsapp_api" ? "Bruno" : CHANNELS[message.channel]?.short;
  return (
    <>
      {showDate && <div className="flex justify-center py-3"><span className="rounded-md border bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground">{date.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}</span></div>}
      <div className={cn("flex min-w-0", internal ? "justify-center" : incoming ? "justify-start" : "justify-end")}>
        <article className={cn("min-w-0 max-w-[92%] rounded-lg border px-3.5 py-3 text-sm [overflow-wrap:anywhere] sm:max-w-[min(85%,42rem)]", internal ? "border-dashed bg-background" : incoming ? "bg-card" : "border-primary/15 bg-primary/10")}>
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            <Icon className="h-3 w-3 shrink-0" /><span className="font-semibold text-foreground">{author}</span>
            {message.channel !== "wasender" && !internal && <span>· {CHANNELS[message.channel]?.short}</span>}
            {message.ai_generated && <Badge variant="outline" className="h-4 px-1 text-[10px]">AI</Badge>}
          </div>
          {message.subject && <p className="mb-1 font-semibold">{message.subject}</p>}
          <p className="whitespace-pre-wrap break-words leading-relaxed">{message.body}</p>
          {message.channel === "call" && message.metadata?.recording_url?.startsWith("http") && <audio controls preload="none" src={message.metadata.recording_url} className="mt-2 h-8 w-full" aria-label="Registrazione chiamata" />}
          <div className="mt-2 text-right text-[10px] text-muted-foreground"><time dateTime={message.created_at} title={date.toLocaleString("it-IT")}>{date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}</time>{message.status === "failed" && <span className="ml-2 text-destructive">Non inviato</span>}</div>
          {message.error && <p className="mt-1 flex items-start gap-1 text-[11px] text-destructive"><AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />{message.error}</p>}
        </article>
      </div>
    </>
  );
}