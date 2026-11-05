import {assertEquals} from 'https://deno.land/std@0.224.0/assert/mod.ts';
import type {SupabaseClient} from 'npm:@supabase/supabase-js@2';
import {executeAction} from './actions.ts';
import {workspace} from './workspace.ts';

function fixture(status='proposed',expired=false){
 const row={id:'00000000-0000-4000-8000-000000000001',tool_name:'update_lead',args:{lead_id:'00000000-0000-4000-8000-000000000002',notes_append:'nota approvata'},status};
 const db={
  async rpc(name:string){
   if(name==='cancel_bruno_action'){if(row.status!=='proposed')return {data:false,error:null};row.status='cancelled';return {data:true,error:null};}
   if(name==='claim_bruno_action'&&row.status==='proposed'&&!expired){row.status='running';return {data:[{...row}],error:null};}
   return {data:[],error:null};
  },
  from(table:string){
   let update:Record<string,unknown>|null=null;let allowed:string[]|null=null;
   const q={
    update(patch:Record<string,unknown>){update=patch;return q;},
    select(){return q;},
    eq(key:string,value:string){if(key==='status')allowed=[value];return q;},
    in(key:string,values:string[]){if(key==='status')allowed=values;return q;},
    single(){return Promise.resolve({data:{...row},error:null});},
    maybeSingle(){return Promise.resolve({data:null,error:null});},
    then(resolve:(r:unknown)=>unknown){if(update&&(!allowed||allowed.includes(row.status)))Object.assign(row,update);return Promise.resolve({data:table==='bruno_actions'?[row]:null,error:null}).then(resolve);},
   };return q;
  },
 } as unknown as SupabaseClient;
 return {ctx:{admin:db,userId:'00000000-0000-4000-8000-000000000003'},row};
}
Deno.test('Only one concurrent approval executes the stored scope',async()=>{
 const {ctx,row}=fixture();let executions=0;
 const run=async(name:string,args:Record<string,unknown>)=>{executions++;assertEquals(name,'update_lead');assertEquals(args.notes_append,'nota approvata');await Promise.resolve();return {updated:true};};
 await Promise.all([executeAction(ctx,row.id,run),executeAction(ctx,row.id,run)]);
 assertEquals(executions,1);assertEquals(row.status,'completed');
});
Deno.test('Expired proposal cannot execute',async()=>{
 const {ctx,row}=fixture('proposed',true);let executions=0;
 await executeAction(ctx,row.id,async()=>{executions++;return {updated:true}});
 assertEquals(executions,0);
});
Deno.test('Uncertain submission remains nonclaimable',async()=>{
 const {ctx,row}=fixture();let executions=0;
 const run=async()=>{executions++;throw new Error('timeout');};
 await executeAction(ctx,row.id,run);await executeAction(ctx,row.id,run);
 assertEquals(row.status,'unknown');assertEquals(executions,1);
});
Deno.test('Workspace cancellation uses atomic shared cancellation and never executes',async()=>{
 const {ctx,row}=fixture();let executions=0;
 const result=await workspace(ctx,ctx.admin,{action:'action_cancel',id:row.id},async()=>{executions++;});
 assertEquals(result,{cancelled:true});assertEquals(row.status,'cancelled');assertEquals(executions,0);
});
Deno.test('An authoritative concurrent callback wins over the initial tool result',async()=>{
 const {ctx,row}=fixture();
 const result=await executeAction(ctx,row.id,async()=>{row.status='failed';return {updated:true}});
 assertEquals(result.action_status,'failed');assertEquals(row.status,'failed');
});