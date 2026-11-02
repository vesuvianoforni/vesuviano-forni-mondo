export interface BrunoChatMessage { role: "user" | "assistant"; content: string }
export interface BrunoThread { id: string; title: string; updatedAt: string; messages: BrunoChatMessage[] }

const KEY = "bruno-agent-threads";

export function loadThreads(): BrunoThread[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]") as BrunoThread[]; } catch { return []; }
}

export function saveThreads(threads: BrunoThread[]) {
  localStorage.setItem(KEY, JSON.stringify(threads.slice(0, 50)));
}

export function newThread(): BrunoThread {
  return { id: crypto.randomUUID(), title: "Nuova conversazione", updatedAt: new Date().toISOString(), messages: [] };
}
