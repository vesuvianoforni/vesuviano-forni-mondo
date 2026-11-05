import { z } from 'npm:zod@3';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { executeAction, type ActionContext } from './actions.ts';

export const WorkspaceRequest = z.discriminatedUnion('action',[
  z.object({action:z.literal('workspace'),days:z.union([z.literal(1),z.literal(7),z.literal(30)]).default(7)}),
  z.object({action:z.literal('actions'),view:z.enum(['plan','history']),before_at:z.string().datetime({offset:true}).optional(),before_id:z.string().uuid().optional()}),
  z.object({action:z.literal('action_detail'),id:z.string().uuid()}),
  z.object({action:z.literal('action_approve'),id:z.string().uuid()}),
  z.object({action:z.literal('action_cancel'),id:z.string().uuid()}),
]);
const check=<T>(r:{data:T;error:{message:string}|null}):T=>{if(r.error)throw new Error(r.error.message);return r.data;};
export async function workspace(ctx:ActionContext,reader:SupabaseClient,input:z.infer<typeof WorkspaceRequest>,execute:(name:string,args:Record<string,unknown>,id:string)=>Promise<any>) {
  if(input.action==='action_approve')return executeAction(ctx,input.id,execute);
  if(input.action==='action_cancel') {
    const row=check(await ctx.admin.from('bruno_actions').update({status:'cancelled',finished_at:new Date().toISOString()}).eq('id',input.id).eq('status','proposed').select('id').maybeSingle());
    if(!row)return {error:'Azione già gestita'};
    return {cancelled:true};
  }
  if(input.action==='action_detail')return {action:check(await reader.from('bruno_actions').select('*,leads(contact_name,company_name)').eq('id',input.id).single())};
  if(input.action==='actions') {
    let q=reader.from('bruno_actions').select('*,leads(contact_name,company_name)').order('created_at',{ascending:false}).order('id',{ascending:false}).limit(31);
    if(input.view==='plan') q=q.in('status',['proposed','approved','running','blocked']); else q=q.in('status',['completed','failed','unknown','cancelled','expired']);
    if(input.before_at && input.before_id)q=q.or(`created_at.lt.${input.before_at},and(created_at.eq.${input.before_at},id.lt.${input.before_id})`);
    const data=check(await q)??[];
    return {actions:data.slice(0,30),has_more:data.length>30};
  }
  const [summary,upcoming,recent,issues,reminders]=await Promise.all([
    reader.rpc('bruno_workspace_summary',{p_days:input.days}),
    reader.from('bruno_actions').select('*,leads(contact_name,company_name)').in('status',['proposed','approved','running','blocked']).order('created_at',{ascending:false}).limit(6),
    reader.from('bruno_actions').select('*,leads(contact_name,company_name)').eq('status','completed').order('finished_at',{ascending:false}).limit(6),
    reader.from('bruno_actions').select('*,leads(contact_name,company_name)').in('status',['failed','unknown','blocked']).order('created_at',{ascending:false}).limit(6),
    reader.from('leads').select('id,contact_name,company_name,next_activity_type,next_activity_date,next_activity_notes').eq('pipeline','Vesuviano').eq('archived',false).not('status','in','(vinto,perso)').not('next_activity_date','is',null).order('next_activity_date').limit(12),
  ]);
  return {summary:check(summary),upcoming:check(upcoming),recent:check(recent),issues:check(issues),reminders:check(reminders)};
}