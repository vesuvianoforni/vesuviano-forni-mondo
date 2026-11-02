export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export function appendMarioRequest(saved: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const last = incoming.at(-1);
  if (!last || last.role !== 'user' || !last.content.trim()) throw new Error('Richiesta mancante');
  // Persisted history is authoritative; stale browser histories cannot erase tasks.
  return [...saved.filter(m => m.content.trim()), { ...last }];
}

export function marioChatOwnedBy(owner: string, user: string): boolean {
  return owner === user;
}