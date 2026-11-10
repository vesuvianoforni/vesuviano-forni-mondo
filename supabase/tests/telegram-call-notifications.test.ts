import { expect, test } from 'bun:test';

// Integration checks use the deployed SQL predicate, not a duplicate JS rule.
// Run: bun test supabase/tests/telegram-call-notifications.test.ts
async function hasNoAnswer(metadata: Record<string, unknown> | null) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server credentials required for integration tests');
  const response = await fetch(`${url}/rest/v1/rpc/telegram_call_has_no_answer`, {
    method: 'POST',
    headers: { apikey: key, ...(key.split('.').length === 3 ? { Authorization: `Bearer ${key}` } : {}), 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_metadata: metadata }),
  });
  expect(response.status).toBe(200);
  return response.json();
}

test('Telegram excludes unanswered call outcomes, including provider aliases', async () => {
  for (const status of ['no-answer', 'no_answer', 'missed', 'busy', 'failed', 'canceled', 'cancelled', 'unreachable', 'no_conversation']) {
    expect(await hasNoAnswer({ call_status: status })).toBe(true);
  }
  expect(await hasNoAnswer({ error_code: 'no_answer', call_status: 'completed' })).toBe(true);
  expect(await hasNoAnswer({ status: 'NO-ANSWER' })).toBe(true);
});

test('Telegram excludes Zapper calls with zero conversation duration', async () => {
  expect(await hasNoAnswer({ source: 'zapper', duration_seconds: 0 })).toBe(true);
  expect(await hasNoAnswer({ source: 'zapper', duration_seconds: '0.00' })).toBe(true);
});

test('Telegram preserves answered calls and does not infer no-answer from missing evidence', async () => {
  expect(await hasNoAnswer({ source: 'zapper', duration_seconds: 28.18 })).toBe(false);
  expect(await hasNoAnswer({ source: 'bruno_telnyx', call_status: 'completed', duration_seconds: 7 })).toBe(false);
  expect(await hasNoAnswer({ duration_seconds: 0.5 })).toBe(false);
  expect(await hasNoAnswer({ duration_seconds: 'unknown' })).toBe(false);
  expect(await hasNoAnswer({})).toBe(false);
  expect(await hasNoAnswer(null)).toBe(false);
});