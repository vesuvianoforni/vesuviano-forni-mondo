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

test('The live queue rejects a real unanswered operator call and a failed CRM call', async () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server credentials required for integration tests');
  const headers = { apikey: key, ...(key.split('.').length === 3 ? { Authorization: `Bearer ${key}` } : {}), 'Content-Type': 'application/json', Prefer: 'return=representation' };
  const sources = [
    { query: 'crm_direct_calls?select=id,lead_id&answered_at=is.null&status=eq.ended&limit=1', kind: 'direct_call', reference: 'direct_call_id' },
    { query: 'crm_messages?select=id,lead_id&channel=eq.call&metadata->>call_status=eq.failed&limit=1', kind: 'message', reference: 'message_id' },
  ];
  for (const source of sources) {
    const response = await fetch(`${url}/rest/v1/${source.query}`, { headers });
    expect(response.status).toBe(200);
    const calls = await response.json() as { id: string; lead_id: string }[];
    expect(calls.length).toBe(1);
    const call = calls[0];
    if (!call) throw new Error('Real unanswered call required for integration test');
    // No outbound HTTP trigger exists on this table: this tests only the insertion gate.
    const inserted = await fetch(`${url}/rest/v1/telegram_notifications`, {
      method: 'POST', headers,
      body: JSON.stringify({ kind: source.kind, lead_id: call.lead_id, [source.reference]: call.id }),
    });
    expect(inserted.status).toBe(201);
    expect(await inserted.json()).toEqual([]);
    const readBack = await fetch(`${url}/rest/v1/telegram_notifications?select=id&kind=eq.${source.kind}&${source.reference}=eq.${call.id}&sent_at=is.null`, { headers });
    expect(readBack.status).toBe(200);
    expect(await readBack.json()).toEqual([]);
  }
});