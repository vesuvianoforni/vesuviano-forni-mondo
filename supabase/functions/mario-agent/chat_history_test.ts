import { assertEquals, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { appendMarioRequest, marioChatOwnedBy } from '../_shared/mario/chat-history.ts';

Deno.test('Mario saves each requested task while retaining the previous conversation', () => {
  const saved = [{ role: 'user' as const, content: 'Pizzerie napoletane a Londra' }, { role: 'assistant' as const, content: 'Piano salvato' }];
  assertEquals(appendMarioRequest(saved, [{ role: 'user', content: 'Verifica i siti ufficiali' }]), [...saved, { role: 'user', content: 'Verifica i siti ufficiali' }]);
});
Deno.test('Mario does not accept an assistant response as a new task', () => {
  assertThrows(() => appendMarioRequest([], [{ role: 'assistant', content: 'Risposta' }]));
});
Deno.test('Mario conversations belong only to their requesting user', () => {
  assertEquals(marioChatOwnedBy('commerciale-1', 'commerciale-1'), true);
  assertEquals(marioChatOwnedBy('commerciale-1', 'commerciale-2'), false);
});