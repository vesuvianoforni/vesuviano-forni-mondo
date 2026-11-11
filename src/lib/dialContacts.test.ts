import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-start', () => ({ createServerFn: () => ({
  middleware() { return this; }, inputValidator() { return this; },
  handler(handler: unknown) { return handler; },
}) }));
vi.mock('@/integrations/supabase/auth-middleware', () => ({ requireSupabaseAuth: {} }));

import { resolveDialContact } from './dialContacts.functions';

const andre = { id: '1ddffbb7-62da-4c09-aae6-e18e82ea00e2', phone: '07999488655', country: 'UK', contact_name: 'Andre Brincat' };
const insert = vi.fn();
const update = vi.fn();
let contacts: unknown[] = [], failRead = false, roles: string[] = ['commerciale'];

function query(table: string) {
  const builder = {
    select() { return this; }, eq() { return this; }, not() { return this; }, order() { return this; },
    range: vi.fn(async () => ({ data: contacts, error: failRead ? { message: 'offline' } : null })),
    insert,
    update,
    then(resolve: (value: unknown) => unknown) { return Promise.resolve({ data: table === 'user_roles' ? roles.map(role => ({ role })) : [], error: null }).then(resolve); },
  };
  return builder;
}
const invoke = resolveDialContact as unknown as (input: { data: { destination: string; name: string }; context: unknown }) => Promise<{ lead: typeof andre; created: boolean }>;
const run = () => invoke({ data: { destination: '+447999488655', name: '' }, context: { userId: 'operator', supabase: { from: query } } });

beforeEach(() => {
  contacts = [andre]; failRead = false; roles = ['commerciale']; insert.mockReset(); update.mockReset();
  insert.mockImplementation(() => { throw new Error('unexpected new lead'); });
  update.mockReturnValue({ eq() { return this; }, select: () => ({ single: async () => ({ data: { ...andre, phone: '+447999488655' }, error: null }) }) });
});

describe('Risoluzione cliente prima della scelta chiamata', () => {
  it('riutilizza la scheda reale di Andre senza creare lead o avvisi di nuovo lead', async () => {
    const result = await run();
    expect(result.lead.id).toBe('1ddffbb7-62da-4c09-aae6-e18e82ea00e2');
    expect(result.created).toBe(false); expect(insert).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith({ phone: '+447999488655', country: 'Regno Unito' });
  });
  it('non crea nulla se la lettura clienti fallisce', async () => {
    failRead = true; await expect(run()).rejects.toThrow('nessuna nuova scheda creata'); expect(insert).not.toHaveBeenCalled();
  });
  it('rifiuta schede ambigue anziché associarsi a una a caso', async () => {
    contacts = [andre, { ...andre, id: 'duplicate', phone: '+447999488655' }];
    await expect(run()).rejects.toThrow('Più clienti'); expect(insert).not.toHaveBeenCalled();
  });
  it('crea un nuovo cliente soltanto dopo una ricerca completa senza corrispondenze', async () => {
    contacts = []; insert.mockReturnValue({ select: () => ({ single: async () => ({ data: { ...andre, id: 'new', phone: '+447999488655' }, error: null }) }) });
    expect((await run()).created).toBe(true);
    expect(insert).toHaveBeenCalledOnce(); expect(insert).toHaveBeenCalledWith(expect.objectContaining({ phone: '+447999488655', source: 'cold_call' }));
  });
  it('impedisce a produzione di risolvere o creare clienti per chiamate', async () => {
    roles = ['produzione']; await expect(run()).rejects.toThrow('Accesso alle chiamate negato'); expect(insert).not.toHaveBeenCalled();
  });
  it('non apre la chiamata o crea un doppione se il numero non può essere normalizzato', async () => {
    update.mockReturnValue({ eq() { return this; }, select: () => ({ single: async () => ({ data: null, error: { message: 'changed concurrently' } }) }) });
    await expect(run()).rejects.toThrow('Telefono del cliente non aggiornato'); expect(insert).not.toHaveBeenCalled();
  });
});