import { differenceInCalendarDays, format, formatDistanceStrict, isSameDay } from "date-fns";
import { it } from "date-fns/locale";

export interface LeadIdentity {
  id: string;
  email?: string | null;
  phone?: string | null;
  website_lead_id?: string | null;
}

export interface LeadInteraction {
  at: string;
  kind: "form" | "chat" | "email" | "configurator" | "feedback";
  email?: string | null;
  phone?: string | null;
  websiteLeadId?: string | null;
}

export const interactionLabels: Record<LeadInteraction["kind"], string> = {
  form: "Richiesta dal sito", chat: "Conversazione chat", email: "Email inviata",
  configurator: "Attività configuratore", feedback: "Feedback cliente",
};

export const activityLabels: Record<string, string> = {
  call: "Chiamata", email: "Email", meeting: "Incontro", whatsapp: "WhatsApp",
  demo: "Demo", follow_up: "Follow-up", quote: "Preventivo",
};

export function validDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function activityTiming(value?: string | null, now = new Date()) {
  const date = validDate(value);
  if (!date) return { state: "unscheduled", label: "Da pianificare", date: null } as const;
  const days = differenceInCalendarDays(date, now);
  const time = format(date, "HH:mm");
  if (date.getTime() < now.getTime()) {
    return { state: "overdue", label: days === 0 ? `Scaduta oggi · ${time}` : `Scaduta da ${Math.abs(days)} ${Math.abs(days) === 1 ? "giorno" : "giorni"}`, date } as const;
  }
  if (days === 0) return { state: "today", label: `Oggi · ${time}`, date } as const;
  if (days === 1) return { state: "future", label: `Domani · ${time}`, date } as const;
  return { state: "future", label: `Tra ${days} giorni · ${time}`, date } as const;
}

export function interactionRelativeTime(value: string, now = new Date()) {
  const date = validDate(value);
  if (!date) return "Data non disponibile";
  // Activity data can be slightly ahead of the browser clock; don't claim a future contact.
  if (date.getTime() >= now.getTime()) return "Adesso";
  if (isSameDay(date, now)) return `Oggi · ${format(date, "HH:mm")}`;
  if (differenceInCalendarDays(now, date) === 1) return `Ieri · ${format(date, "HH:mm")}`;
  // formatDistance with an explicit reference date keeps relative labels deterministic.
  return relativeDistance(date, now);
}

function relativeDistance(date: Date, now: Date) {
  return formatDistanceStrict(date, now, { addSuffix: true, locale: it });
}

export function exactActivityDate(value: string) {
  const date = validDate(value);
  return date ? format(date, "dd/MM/yyyy HH:mm") : "";
}

function emailKey(value?: string | null) { return value?.trim().toLowerCase() || ""; }
function phoneKey(value?: string | null) {
  const digits = value?.replace(/\D/g, "") || "";
  const normalized = digits.startsWith("00") ? digits.slice(2) : digits;
  return normalized.length >= 7 ? normalized : "";
}

export function latestInteractions(leads: LeadIdentity[], interactions: LeadInteraction[]) {
  const byEmail = new Map<string, LeadInteraction>();
  const byPhone = new Map<string, LeadInteraction>();
  const byWebsiteLead = new Map<string, LeadInteraction>();
  const keepNewest = (map: Map<string, LeadInteraction>, key: string, event: LeadInteraction) => {
    if (!key || !validDate(event.at)) return;
    const previous = map.get(key);
    if (!previous || new Date(event.at).getTime() > new Date(previous.at).getTime()) map.set(key, event);
  };
  for (const event of interactions) {
    keepNewest(byEmail, emailKey(event.email), event);
    keepNewest(byPhone, phoneKey(event.phone), event);
    keepNewest(byWebsiteLead, event.websiteLeadId || "", event);
  }
  return Object.fromEntries(leads.map(lead => {
    const candidates = [byEmail.get(emailKey(lead.email)), byPhone.get(phoneKey(lead.phone)), byWebsiteLead.get(lead.website_lead_id || "")]
      .filter((event): event is LeadInteraction => Boolean(event))
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    return [lead.id, candidates[0] ?? null];
  })) as Record<string, LeadInteraction | null>;
}