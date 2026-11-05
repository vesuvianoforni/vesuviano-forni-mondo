import { z } from 'npm:zod@3';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { actionOutcome, WRITE_TOOLS } from './action-domain.ts';

export type ActionContext = { admin: SupabaseClient; userId: string; source?: string; requestText?: string; requestedLabel?: string };
const check = <T>(r:{data:T;error:{message:string}|null}):T => {if(r.error) throw new Error(r.error.message);return r.data;};
const uuid = z.string().uuid();
export async function saveAction(ctx: ActionContext,name:string,args:Record<string,unknown>) {
  if (!WRITE_TOOLS.includes(name)) throw new Error('Strumento non autorizzato');
  if(name==='approve_call'&&uuid.safeParse(args.call_id).success){
    const existing=check(await ctx.admin.from('bruno_actions').select('*').eq('tool_name','approve_call').eq('voice_call_id',args.call_id).maybeSingle());
    if(existing)return existing;
  }
  let leadId = uuid.safeParse(args.lead_id).success ? args.lead_id : null;
  if (!leadId && name === 'approve_call' && uuid.safeParse(args.call_id).success) leadId=check(await ctx.admin.from('bruno_voice_calls').select('lead_id').eq('id',args.call_id).maybeSingle())?.lead_id ?? null;
  if (!leadId && name === 'send_offer') leadId=check(await ctx.admin.from('commercial_offers').select('lead_id').eq('number',String(args.offer_number ?? '')).maybeSingle())?.lead_id ?? null;
  const inserted=await ctx.admin.from('bruno_actions').insert({tool_name:name,args,lead_id:leadId,source:ctx.source || 'erp',requested_by:ctx.userId,request_text:(ctx.requestText || '').slice(0,8000),requested_label:ctx.requestedLabel,channel:args.channel || args.send_via || (name.includes('call') ? 'call' : null),...(name==='approve_call'?{voice_call_id:args.call_id}:{})}).select('*').single();
  if(inserted.error?.code==='23505'&&name==='approve_call'){
    const existing=check(await ctx.admin.from('bruno_actions').select('*').eq('tool_name','approve_call').eq('voice_call_id',args.call_id).single());
    return existing;
  }
  const row = check(inserted);
  if (!row) throw new Error('Proposta non salvata');
  return row;
}
export async function executeAction(ctx:ActionContext,id:string,execute:(name:string,args:Record<string,unknown>,id:string)=>Promise<any>) {
  const claimed=check(await ctx.admin.rpc('claim_bruno_action',{p_id:id,p_user:ctx.userId}));const action=claimed?.[0];
  if(!action) return {error:'Azione già gestita o scaduta. Nessuna nuova esecuzione.'};
  try {
    const result=await execute(action.tool_name,action.args,id);
    const status=actionOutcome(action.tool_name,result);
    const messageId=result?.message?.id || result?.message_id;
    const callId=action.tool_name==='approve_call' ? result?.call_id || action.args.call_id : result?.proposal?.id;
    check(await ctx.admin.from('bruno_actions').update({result,...(uuid.safeParse(messageId).success?{message_id:messageId}:{}),...(uuid.safeParse(callId).success?{voice_call_id:callId}:{}),...(uuid.safeParse(result?.lead?.id).success?{lead_id:result.lead.id}:{})}).eq('id',id));
    check(await ctx.admin.from('bruno_actions').update({status,finished_at:['completed','failed','cancelled'].includes(status) ? new Date().toISOString() : null,error_code:status==='unknown'?'outcome_uncertain':status==='failed'?'operation_failed':null}).eq('id',id).eq('status','running'));
    // Read asynchronous results back, including a callback which raced with the tool response.
    if (uuid.safeParse(messageId).success) {
      const m=check(await ctx.admin.from('crm_messages').select('status').eq('id',messageId).maybeSingle());
      if (m && ['sent','delivered','read','logged','failed'].includes(m.status)) check(await ctx.admin.from('bruno_actions').update({status:m.status==='failed'?'failed':'completed',finished_at:new Date().toISOString()}).eq('id',id).in('status',['running','unknown','completed','failed']));
    }
    if(action.tool_name==='approve_call' && uuid.safeParse(callId).success) {
      const c=check(await ctx.admin.from('bruno_voice_calls').select('status,ended_at').eq('id',callId).maybeSingle());
      if(c && ['completed','failed','cancelled','unknown'].includes(c.status)) check(await ctx.admin.from('bruno_actions').update({status:c.status,finished_at:c.ended_at}).eq('id',id).in('status',['running','unknown']));
    }
    const final=check(await ctx.admin.from('bruno_actions').select('status').eq('id',id).single());
    return {...result,action_id:id,action_status:final?.status ?? status};
  } catch {
    const outbox=check(await ctx.admin.from('email_outbox').select('smtp_status,crm_message_id,smtp_accepted_at').eq('idempotency_key',id).maybeSingle());
    if(outbox?.smtp_status==='accepted'){
      check(await ctx.admin.from('bruno_actions').update({status:'completed',message_id:outbox.crm_message_id,finished_at:outbox.smtp_accepted_at,error_code:null,result:{smtp_status:'accepted',message_id:outbox.crm_message_id}}).eq('id',id));
      return {action_id:id,action_status:'completed',result:'accepted'};
    }
    // Submission may have succeeded: never make the action claimable again.
    check(await ctx.admin.from('bruno_actions').update({status:'unknown',error_code:'execution_uncertain',finished_at:new Date().toISOString()}).eq('id',id).eq('status','running'));
    return {error:'Esito da verificare: controlla il cliente prima di ripetere.',action_id:id,action_status:'unknown'};
  }
}