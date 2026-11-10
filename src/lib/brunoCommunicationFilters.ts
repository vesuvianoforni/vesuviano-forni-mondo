import type { BrunoChannel } from "./brunoObjectives";

export type BrunoCommunicationFilter = "all" | BrunoChannel;
export type CommunicationSection = "all" | "chat" | "mail";

export const BRUNO_COMMUNICATION_FILTERS = [
  "all", "email", "wasender", "whatsapp_api", "whatsapp_uk", "call", "note",
] as const satisfies readonly BrunoCommunicationFilter[];

export function parseBrunoCommunicationFilter(value: string | null): BrunoCommunicationFilter {
  return BRUNO_COMMUNICATION_FILTERS.find((filter) => filter === value) ?? "all";
}

export function communicationCount(counts: Record<string, number> | undefined, filter: BrunoCommunicationFilter, total: number) {
  return filter === "all" ? total : Number(counts?.[filter] ?? 0);
}

export function matchesCommunicationFilter(counts: Record<string, number> | undefined, filter: BrunoCommunicationFilter) {
  return filter === "all" || communicationCount(counts, filter, 0) > 0;
}

export function sectionFilters(section: CommunicationSection): readonly BrunoCommunicationFilter[] {
  if (section === "mail") return ["email"];
  return section === "chat" ? BRUNO_COMMUNICATION_FILTERS.filter(filter => filter !== "email") : BRUNO_COMMUNICATION_FILTERS;
}

export function sectionFilter(section: CommunicationSection, value: string | null): BrunoCommunicationFilter {
  if (section === "mail") return "email";
  const filter = parseBrunoCommunicationFilter(value);
  return sectionFilters(section).includes(filter) ? filter : "all";
}

export function composerChannels(section: CommunicationSection): readonly BrunoChannel[] {
  if (section === "mail") return ["email"];
  const channels: BrunoChannel[] = ["wasender", "whatsapp_api", "whatsapp_uk", "email", "note"];
  return section === "chat" ? channels.filter(channel => channel !== "email") : channels;
}

export function sectionMessageFilters(section: CommunicationSection, filter: BrunoCommunicationFilter): readonly BrunoCommunicationFilter[] {
  const selected = sectionFilter(section, filter);
  return section === "chat" && selected === "all" ? sectionFilters(section).filter(channel => channel !== "all") : [selected];
}

export function sectionCount(counts: Record<string, number> | undefined, section: CommunicationSection, filter: BrunoCommunicationFilter, total: number) {
  const selected = sectionFilter(section, filter);
  if (section === "chat" && selected === "all") {
    return sectionMessageFilters(section, selected).reduce((sum, channel) => sum + Number(counts?.[channel] ?? 0), 0);
  }
  return communicationCount(counts, selected, total);
}

export function matchesSection(counts: Record<string, number> | undefined, section: CommunicationSection, filter: BrunoCommunicationFilter, email?: string | null) {
  if (section === "mail") return communicationCount(counts, "email", 0) > 0;
  if (section === "chat" && sectionFilter(section, filter) === "all") {
    return !counts || Object.values(counts).every(count => Number(count) === 0) || sectionCount(counts, section, filter, 0) > 0;
  }
  return matchesCommunicationFilter(counts, sectionFilter(section, filter));
}

export function messageMatchesSection(message: { channel: string; metadata?: unknown }, section: CommunicationSection, filter: BrunoCommunicationFilter) {
  const metadata = message.metadata && typeof message.metadata === "object" ? message.metadata as Record<string, unknown> : null;
  const channel = message.channel === "whatsapp_api" && metadata?.["whatsapp_line"] === "uk" ? "whatsapp_uk" : message.channel;
  return sectionMessageFilters(section, filter).some(selected => selected === "all" || selected === channel);
}