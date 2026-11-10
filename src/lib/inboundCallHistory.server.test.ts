import { beforeEach, describe, expect, it, vi } from 'vitest';
import { syncInboundHistory } from './inboundCallHistory.server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { telnyxDialer } from './crmDialer.server';
vi.mock('./crmDialer.server', () => ({ telnyxDialer: vi.fn() }));
const incoming={id:'in-1',record_type:'sip-trunking',direction:'inbound',cli:'+353860217737',cld:'+447457416033',telnyx_session_id:'session-1',call_control_id:'parent-1',started_at:'2026-11-10T11:29:51Z',finished_at:'2026-11-10T11:30:27Z',answered_at:'2026-11-10T11:29:53Z',call_sec:34};
const office={...incoming,id:'out-1',direction:'outbound',cli:'+447457416033',cld:'+3908119231684',call_control_id:'child-1',call_sec:31};
function fakeDb() {
  const upsert=vi.fn().mockReturnValue({select:async()=>({data:[{id:'saved'}],error:null})});
  const q={select:()=>q,eq:()=>q,order:()=>q,range:async()=>({data:[],error:null})};
  return {upsert,db:{from:(table:string)=>table==='bruno_voice_calls'?q:{upsert}} as unknown as SupabaseClient};
}
describe('Sincronizzazione storico Telnyx',()=>{
  beforeEach(()=>vi.clearAllMocks());
  it('legge anche la seconda pagina prima di recuperare la durata vera del fisso',async()=>{
    vi.mocked(telnyxDialer).mockResolvedValueOnce({data:[incoming],meta:{total_pages:2}}).mockResolvedValueOnce({data:[office],meta:{total_pages:2}});
    const {db,upsert}=fakeDb();
    expect(await syncInboundHistory(db,{direct:'test-only'})).toEqual({imported:1,checked:1});
    expect(telnyxDialer).toHaveBeenCalledTimes(2);
    expect(upsert.mock.calls[0]?.[0]?.[0]).toMatchObject({caller_number:'+353860217737',duration_seconds:31,forwarded_to:'+3908119231684'});
    expect(upsert.mock.calls[0]?.[1]).toEqual({onConflict:'provider_call_id',ignoreDuplicates:true});
  });
  it('non importa dati incompleti se una pagina Telnyx non arriva',async()=>{
    vi.mocked(telnyxDialer).mockResolvedValueOnce({data:[incoming],meta:{total_pages:2}}).mockRejectedValueOnce(new Error('Unavailable'));
    const {db,upsert}=fakeDb();
    await expect(syncInboundHistory(db,{direct:'test-only'})).rejects.toThrow('Unavailable');
    expect(upsert).not.toHaveBeenCalled();
  });
});