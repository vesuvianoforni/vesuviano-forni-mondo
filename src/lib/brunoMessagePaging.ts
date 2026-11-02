export const BRUNO_MESSAGE_PAGE_SIZE = 50;

export interface MessageKey { id: string; created_at: string; }

export function compareMessageKeys(a: MessageKey, b: MessageKey) {
  // Preserve Postgres sub-millisecond precision; Date would collapse tied timestamps.
  const timestamp = (value: string) => value.replace(/(?:Z|\+00:00)$/, "").replace(/\.(\d+)$/, (_, fraction: string) => `.${fraction.padEnd(6, "0")}`);
  const normalize = (value: string) => { const normalized = timestamp(value); return normalized.includes(".") ? normalized : `${normalized}.000000`; };
  const left = normalize(a.created_at), right = normalize(b.created_at);
  return left < right ? -1 : left > right ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export function mergeMessagePages<T extends MessageKey>(current: T[], incoming: T[]) {
  const byId = new Map(current.map((message) => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort(compareMessageKeys);
}

export function unpackMessagePage<T extends MessageKey>(descending: T[]) {
  const selected = descending.slice(0, BRUNO_MESSAGE_PAGE_SIZE);
  return { messages: [...selected].reverse(), cursor: selected.at(-1) ?? null, hasMore: descending.length > BRUNO_MESSAGE_PAGE_SIZE };
}