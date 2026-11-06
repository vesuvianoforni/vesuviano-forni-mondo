import type { BrunoChannel } from "./brunoObjectives";

export type BrunoCommunicationFilter = "all" | BrunoChannel;

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