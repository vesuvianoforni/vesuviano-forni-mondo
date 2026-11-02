import type { BrunoChatMessage, BrunoThread } from './brunoThreads';

export type MarioThread = BrunoThread & { status?: string };

export function decodeMarioMessages(value: unknown): BrunoChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(message => {
    if (!message || typeof message !== 'object') return [];
    const { role, content } = message;
    return (role === 'user' || role === 'assistant') && typeof content === 'string'
      ? [{ role, content } as BrunoChatMessage] : [];
  });
}

export function mergeMarioThreads(remote: MarioThread[], local: MarioThread[]): MarioThread[] {
  const threads = new Map(local.map(thread => [thread.id, thread]));
  for (const thread of remote) threads.set(thread.id, thread);
  return [...threads.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function selectMarioThread(threads: MarioThread[], id: string | null): MarioThread | undefined {
  return id ? threads.find(thread => thread.id === id) : threads[0];
}