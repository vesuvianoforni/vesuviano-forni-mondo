// Browser-safe validation shared by the chat and its existing submission endpoint.
// Validates dialable formatting, not ownership or whether the line is reachable.
export function normalizeChatPhone(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const input = value.trim();
  if (!/^\+?[\d\s().-]+$/.test(input) || input.length > 40) return null;
  const digits = input.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15 || /^(\d)\1+$/.test(digits)) return null;
  return `${input.startsWith('+') ? '+' : ''}${digits}`;
}

export function requiresChatPhone(formType: unknown): boolean {
  return formType === 'callback_request' || formType === 'hero_callback' || formType === 'ai_chat';
}