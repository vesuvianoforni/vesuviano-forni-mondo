import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Netlify: controllo chiavi', () => {
  it('esclude solo l’indirizzo pubblico Supabase e continua a controllare le chiavi riservate', () => {
    const config = readFileSync('netlify.toml', 'utf8');
    expect(config).toMatch(/^\s*SECRETS_SCAN_OMIT_KEYS\s*=\s*"SUPABASE_URL"\s*$/m);
    expect(config).not.toMatch(/SECRETS_SCAN_ENABLED\s*=\s*"?false"?/);
  });
});
