import { isBrunoPaused } from "./brunoObjectives";

/** Giorni entro cui Bruno deve tornare a scrivere, per fase pipeline. */
export const BRUNO_FOLLOWUP_DAYS: Record<string, number> = {
  nuovo: 2,
  pre_qualificato: 2,
  qualificato: 3,
  trattativa: 3,
  vinto: 7,
  perso: 0,
};

export const DEFAULT_FOLLOWUP_DAYS = 3;

export interface BrunoQueueInput {
  stage: string;
  brunoMode?: string | null;
  brunoPausedUntil?: string | null;
  /** Ultimo contatto reale (sito, chat, email o messaggio registrato). */
  lastContactAt?: string | null;
  nextActivityAt?: string | null;
  createdAt: string;
  now?: Date;
}

export interface BrunoQueueReason {
  severity: "overdue" | "due";
  label: string;
}

const DAY = 86_400_000;

function daysBetween(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / DAY);
}

function valid(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function brunoFollowupDays(stage: string) {
  return BRUNO_FOLLOWUP_DAYS[stage] ?? DEFAULT_FOLLOWUP_DAYS;
}

/** Perche' Bruno dovrebbe scrivere adesso a questo lead (null = nessun motivo). */
export function brunoQueueReason(input: BrunoQueueInput): BrunoQueueReason | null {
  const now = input.now ?? new Date();
  if (input.stage === "perso") return null;
  if (isBrunoPaused(input.brunoMode, input.brunoPausedUntil, now)) return null;

  const next = valid(input.nextActivityAt);
  if (next && next.getTime() <= now.getTime()) return { severity: "overdue", label: "Attività in ritardo" };

  const last = valid(input.lastContactAt);
  if (last) {
    const idle = Math.max(0, daysBetween(last, now));
    return idle >= brunoFollowupDays(input.stage)
      ? { severity: "due", label: `Nessun contatto da ${idle} ${idle === 1 ? "giorno" : "giorni"}` }
      : null;
  }

  const created = valid(input.createdAt);
  if (created && daysBetween(created, now) >= 1) return { severity: "due", label: "Mai contattato" };
  return null;
}
