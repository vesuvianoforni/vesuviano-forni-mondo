import { expect, test } from 'bun:test';

async function period(date: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server credentials required');
  const response = await fetch(`${url}/rest/v1/rpc/roberta_news_period`, {
    method: 'POST', headers: { apikey: key, ...(key.split('.').length === 3 ? { Authorization: `Bearer ${key}` } : {}), 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_date: date }),
  });
  expect(response.status).toBe(200);
  return response.json();
}

test('Roberta creates one newsletter period every seven days across month and year boundaries', async () => {
  expect(await period('2026-11-14')).toBe('news-2026-11-14');
  expect(await period('2026-11-20')).toBe('news-2026-11-14');
  expect(await period('2026-11-21')).toBe('news-2026-11-21');
  expect(await period('2026-11-28')).toBe('news-2026-11-28');
  expect(await period('2026-12-04')).toBe('news-2026-11-28');
  expect(await period('2026-12-05')).toBe('news-2026-12-05');
  expect(await period('2027-01-02')).toBe('news-2027-01-02');
});