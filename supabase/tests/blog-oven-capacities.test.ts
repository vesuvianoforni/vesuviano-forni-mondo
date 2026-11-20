import { beforeAll, expect, test } from 'bun:test';

const languages = ['it', 'en', 'fr', 'de', 'es'] as const;
let capacities: Record<string, number[][][]> = {};

beforeAll(async () => {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_ANON_KEY'] || process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!url || !key) throw new Error('Supabase configuration required');
  const fields = languages.map((lang) => `content_${lang}`).join(',');
  const response = await fetch(`${url}/rest/v1/blog_posts?id=eq.1958eed4-4325-4b6d-b92d-1660589b695e&select=${fields}`, {
    headers: { apikey: key, ...(key.split('.').length === 3 ? { Authorization: `Bearer ${key}` } : {}) },
  });
  expect(response.status).toBe(200);
  const posts = await response.json() as Record<string, string>[];
  const post = posts[0];
  if (!post) throw new Error('Published article not found');
  capacities = Object.fromEntries(languages.map((lang) => {
    const html = post[`content_${lang}`];
    if (!html) throw new Error(`Missing article language: ${lang}`);
    const table = html.match(/<table\b[^>]*>[\s\S]*?<\/table>/i)?.[0];
    if (!table) throw new Error(`Missing capacity data: ${lang}`);
    const rows = Array.from(table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi))
      .map((row) => Array.from((row[1] || '').matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi))
        .map((cell) => (cell[1] || '').replace(/<[^>]*>/g, '').match(/\d+/g)?.map(Number) || []))
      .filter((row) => row.length > 0);
    return [lang, rows];
  }));
});

test('80 cm: 2 pizze a legna e 3 a gas; elettrico non specificato', () => {
  for (const lang of languages) expect(capacities[lang]?.find((row) => row[0]?.[0] === 80)).toEqual([[80], [2], [3], []]);
});

test('100 cm: 4 pizze a legna e 5/6 a gas o elettrico', () => {
  for (const lang of languages) expect(capacities[lang]?.find((row) => row[0]?.[0] === 100)).toEqual([[100], [4], [5, 6], [5, 6]]);
});

test('120 cm: 5 pizze a legna e 6/7 a gas o elettrico', () => {
  for (const lang of languages) expect(capacities[lang]?.find((row) => row[0]?.[0] === 120)).toEqual([[120], [5], [6, 7], [6, 7]]);
});

test('130 cm: 5/6 pizze a legna e 7/8 a gas; elettrico non specificato', () => {
  for (const lang of languages) expect(capacities[lang]?.find((row) => row[0]?.[0] === 130)).toEqual([[130], [5, 6], [7, 8], []]);
});