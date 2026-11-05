export interface BrunoChatMessage { role: "user" | "assistant"; content: string; cards?: { kind: "call" | "action"; id: string }[] }
export interface BrunoThread { id: string; title: string; updatedAt: string; messages: BrunoChatMessage[] }

const KEY = "bruno-agent-threads";

export function loadThreads(key = KEY): BrunoThread[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) || "[]") as BrunoThread[]; } catch { return []; }
}

export function saveThreads(threads: BrunoThread[], key = KEY) {
  localStorage.setItem(key, JSON.stringify(threads.slice(0, 50)));
}

export function newThread(): BrunoThread {
  return { id: crypto.randomUUID(), title: "Nuova conversazione", updatedAt: new Date().toISOString(), messages: [] };
}
