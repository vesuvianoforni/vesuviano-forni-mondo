// Obiettivi dell'agente Bruno per fase pipeline (tenere allineato a supabase/functions/bruno-agent).
export const BRUNO_OBJECTIVES: Record<string, { goal: string; next: string }> = {
  nuovo: { goal: "Qualificare il lead", next: "Capire progetto, modello, tempi e paese" },
  pre_qualificato: { goal: "Stabilire il contatto", next: "Chiedere quando sentirsi" },
  qualificato: { goal: "Telefonata o offerta", next: "Fissare call con Gennaro oppure inviare l'offerta" },
  trattativa: { goal: "Discutere l'offerta", next: "Call sull'offerta e follow-up fino a risposta" },
  vinto: { goal: "Back-office", next: "Acconto, produzione e consegna" },
  perso: { goal: "Nessuna azione", next: "Bruno non invia follow-up" },
};

export const CHANNELS = {
  whatsapp_api: { label: "WhatsApp Bruno", short: "WA Bruno" },
  wasender: { label: "WhatsApp Gennaro", short: "WA Gennaro" },
  email: { label: "Email", short: "Email" },
  note: { label: "Nota interna", short: "Nota" },
  call: { label: "Telefonata", short: "Call" },
} as const;
export type BrunoChannel = keyof typeof CHANNELS;

export function isBrunoPaused(mode: string | null | undefined, pausedUntil: string | null | undefined, now = new Date()) {
  if (mode === "paused") return true;
  return !!pausedUntil && new Date(pausedUntil) > now;
}

/** Bruno non deve mai scrivere a lead persi. */
export function brunoCanContact(stage: string) {
  return stage !== "perso";
}
