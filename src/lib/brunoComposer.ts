import type { BrunoChannel } from "./brunoObjectives";

/** A timeline filter can select a reply channel, but never redirect an existing draft. */
export function composerChannelForFilter(filter: "all" | BrunoChannel, current: BrunoChannel, draft: string): BrunoChannel {
  if (draft.trim() || filter === "all" || filter === "call") return current;
  return filter;
}