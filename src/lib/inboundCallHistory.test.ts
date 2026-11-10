import { describe, expect, it } from 'vitest';
import { historicalInboundCalls, type TelnyxHistoryRow } from './inboundCallHistory';
const incoming: TelnyxHistoryRow = { id:'in-1',record_type:'sip-trunking',direction:'inbound',cli:'+353860217737',cld:'+447457416033',telnyx_session_id:'session-1',call_control_id:'provider-parent',started_at:'2026-11-10T11:29:51Z',finished_at:'2026-11-10T11:30:27Z',answered_at:'2026-11-10T11:29:53Z',call_sec:34,hangup_cause:'NORMAL_CLEARING' };
const office: TelnyxHistoryRow = {...incoming,id:'out-1',direction:'outbound',cli:'+447457416033',cld:'+3908119231684',call_control_id:'provider-child',answered_at:'2026-11-10T11:29:56Z',call_sec:31};
describe('Recupero storico chiamate ricevute Telnyx', () => {
  it('recupera il chiamante irlandese e i 31 secondi realmente parlati al fisso, non i 34 della linea UK', () => {
    expect(historicalInboundCalls([incoming, office],[])[0]).toMatchObject({caller_number:'+353860217737',forwarded_to:'+3908119231684',duration_seconds:31,status:'completed',created_at:'2026-11-10T11:29:51Z'});
  });
  it('non duplica le sette chiamate già registrate da Bruno AI', () => {
    expect(historicalInboundCalls([incoming,office],['provider-parent'])).toEqual([]);
  });
  it('raggruppa i tentativi della stessa sessione e preferisce la risposta riuscita', () => {
    const fail={...office,id:'retry-1',answered_at:null,call_sec:0,hangup_cause:'NORMAL_TEMPORARY_FAILURE'};
    expect(historicalInboundCalls([incoming,{...incoming,id:'in-retry'},fail,office],[])).toHaveLength(1);
    expect(historicalInboundCalls([incoming,fail,office],[])[0]?.duration_seconds).toBe(31);
  });
  it('non considera risposta al fisso la sola risposta tecnica della linea UK', () => {
    expect(historicalInboundCalls([incoming],[])[0]).toMatchObject({status:'unknown',forwarded_to:null,answered_at:null});
  });
  it('conserva ingressi persi e inoltri precedenti senza confonderli con chiamate outbound', () => {
    const legacy={...incoming,call_control_id:'',cf_number:'+3908119231684',answered_at:null,call_sec:0,hangup_cause:'SUBSCRIBER_ABSENT'};
    const leg={...legacy,id:'legacy-out',direction:'outbound'};
    expect(historicalInboundCalls([legacy,leg],[])[0]).toMatchObject({status:'missed',forwarded_to:'+3908119231684',provider_call_id:'telnyx-session:session-1'});
    expect(historicalInboundCalls([office],[])).toEqual([]);
  });
  it('non associa un inoltro di un’altra sessione e non inventa destinazioni passate', () => {
    expect(historicalInboundCalls([incoming,{...office,telnyx_session_id:'other'}],[])[0]?.forwarded_to).toBeNull();
  });
});