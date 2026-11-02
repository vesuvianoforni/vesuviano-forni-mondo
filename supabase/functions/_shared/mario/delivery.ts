import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { ImapFlow } from 'npm:imapflow@2.9.1';
import nodemailer from 'npm:nodemailer@10.3.0';
import { composeEmail, rawMIME, findSent, hasExactMessage, closeIMAP } from '../email-transport.ts';
import { emailText } from '../email-content.ts';
import { safeMailError } from '../email-rules.ts';
import { MARIO_SENDER } from './policy.ts';
import { classifyReply, deliveryBlock } from './delivery-policy.ts';
const checked = <T>(r: {data:T;error:unknown}):T => { if(r.error) throw new Error('MAIL_DB_FAILED'); return r.data; };
function clients() {
  const names=['MARIO_MAIL_USER','MARIO_MAIL_PASSWORD','MARIO_IMAP_HOST','MARIO_SMTP_HOST','MARIO_IMAP_PORT'];
  const v=names.map(n=>Deno.env.get(n));
  if(v.some(x=>!x)) throw new Error('MAIL_CONFIG_MISSING');
  if(v[0]!==MARIO_SENDER) throw new Error('MARIO_SENDER_MISMATCH');
  if(Number(v[4])!==993) throw new Error('IMAP_PORT_UNSUPPORTED');
  // Hosted execution uses verified IONOS implicit TLS on 465; legacy STARTTLS/587 configuration is not used.
  const tls={rejectUnauthorized:true,minVersion:'TLSv1.2'};
  const imap=new ImapFlow({host:String(v[2]),port:993,secure:true,auth:{user:MARIO_SENDER,pass:String(v[1])},tls,logger:false,emitLogs:false,disableAutoIdle:true,connectionTimeout:12000,greetingTimeout:12000,socketTimeout:20000});
  imap.on('error',()=>{});
  const smtp=nodemailer.createTransport({host:String(v[3]),port:465,secure:true,auth:{user:MARIO_SENDER,pass:String(v[1])},tls,logger:false,debug:false,pool:false,connectionTimeout:12000,greetingTimeout:12000,socketTimeout:20000,disableFileAccess:true,disableUrlAccess:true});
  return {imap,smtp};
}
const settings = async(db:SupabaseClient)=>checked(await db.from('outreach_settings').select('*').eq('key','default').single());
async function lock(db:SupabaseClient) { const token=crypto.randomUUID(); if(!checked(await db.rpc('acquire_mario_delivery',{p_token:token}))) throw new Error('MAILBOX_BUSY'); return token; }
const unlock=async(db:SupabaseClient,token:string)=>checked(await db.from('outreach_settings').update({lease_token:null,lease_until:null}).eq('key','default').eq('lease_token',token));
export async function preflightMario(db:SupabaseClient) {
  let c:ReturnType<typeof clients>|undefined; let timer:ReturnType<typeof setTimeout>|undefined;
  try {
    c=clients(); const current=c; timer=setTimeout(()=>{current.imap.close();current.smtp.close();},45000);
    await c.imap.connect(); const folder=await findSent(c.imap); await c.smtp.verify();
    const result={mailbox:true,sent_folder:folder,checked_at:new Date().toISOString(),ready:false,reason:'Connessioni verificate; autorizzazione IONOS, autenticazione dominio e prova completa invio/risposta ancora richieste.'};
    checked(await db.from('outreach_settings').update({preflight:result,paused:true}).eq('key','default')); return result;
  } catch(e) {
    const result={mailbox:false,ready:false,checked_at:new Date().toISOString(),reason:(e as Error).message==='SMTP_PORT_UNSUPPORTED'?'La casella usa una porta SMTP non supportata: serve TLS sulla porta 465.':safeMailError(e)};
    checked(await db.from('outreach_settings').update({preflight:result,paused:true}).eq('key','default')); return result;
  } finally { if(timer)clearTimeout(timer);if(c){c.smtp.close();await closeIMAP(c.imap);} }
}
async function importReplies(db:SupabaseClient,imap:ImapFlow) {
  const s=await settings(db); const held=await imap.getMailboxLock('INBOX');
  try {
    const mb=imap.mailbox;if(!mb)throw new Error('MAIL_OPERATION_FAILED');
    const validity=String(mb.uidValidity); const max=Number(mb.uidNext)-1;
    // First contact starts only after a full bounded inbox scan. A large inbox takes several explicit passes.
    const cursor=s.inbox_validity===validity?Number(s.inbox_cursor):0;
    const end=Math.min(cursor+100,max);if(end<=cursor)return true;
    const hits=await imap.search({uid:`${cursor+1}:${end}`},{uid:true});if(!Array.isArray(hits))throw new Error('MAIL_SEARCH_FAILED');
    const entries=hits.length?await imap.fetchAll(hits,{uid:true,envelope:true,bodyStructure:true,internalDate:true},{uid:true}):[];
    for(const entry of entries){
      const sender=entry.envelope?.from?.[0]?.address?.toLowerCase()??''; const refs=entry.envelope?.inReplyTo;
      const match=checked(await db.rpc('mario_reply_match',{p_sender:sender}));
      let id=match.length===1?match[0].id:null;
      if(!id&&refs){const out=checked(await db.from('outreach_outbox').select('prospect_id').eq('message_id',refs).maybeSingle());id=out?.prospect_id??null;}
      const body=await emailText(imap,entry);const subject=entry.envelope?.subject??'';const category=classifyReply(subject,body,sender);
      // Unmatched senders are not assigned merely by a guessed address; reference match is allowed for bounces only.
      if(match.length!==1&&category!=='bounce')id=null;
      const inserted=await db.from('outreach_inbox').insert({physical_key:`INBOX:${validity}:${entry.uid}`,message_id:entry.envelope?.messageId??null,prospect_id:id,sender,subject,body,category,received_at:new Date(entry.envelope?.date??entry.internalDate??Date.now()).toISOString()});
      if(inserted.error&&inserted.error.code!=='23505')throw new Error('MAIL_DB_FAILED');
      // Repeat state projection after a crash: persisting the physical item never skips the stop transition.
      if(id){
        const status=category==='bounce'?'bounced':category==='unsubscribe'?'unsubscribed':'replied';
        const p=checked(await db.from('outreach_prospects').select('status,email').eq('id',id).single());
        if(!['unsubscribed','bounced'].includes(p.status))checked(await db.from('outreach_prospects').update({status,replied_at:new Date().toISOString(),next_send_at:null}).eq('id',id));
        if(category!=='reply'&&p.email)checked(await db.from('outreach_suppressions').upsert({value:p.email,reason:status}));
      }
    }
    checked(await db.from('outreach_settings').update({inbox_cursor:end,inbox_validity:validity}).eq('key','default'));return end>=max;
  }finally{held.release();}
}
export async function syncMarioInbox(db:SupabaseClient) {
  const token=await lock(db);let c:ReturnType<typeof clients>|undefined;let timer:ReturnType<typeof setTimeout>|undefined;
  try{c=clients();const current=c;timer=setTimeout(()=>current.imap.close(),80000);await c.imap.connect();return {caught_up:await importReplies(db,c.imap),note:'Posta controllata; risposte e opposizioni fermano i successivi invii.'};}
  finally{if(timer)clearTimeout(timer);if(c){c.smtp.close();await closeIMAP(c.imap);}await unlock(db,token);}
}
export async function enqueueMario(db:SupabaseClient,id:string) {
  const p=checked(await db.from('outreach_prospects').select('*').eq('id',id).single());const blocked=deliveryBlock(p);if(blocked)throw new Error(blocked);
  const ms=checked(await db.from('outreach_messages').select('*').eq('prospect_id',id).eq('direction','outbound').order('step'));
  if(ms.length!==3||ms.some(m=>m.status!=='approved'||!m.approved_at))throw new Error('Approva tutti e tre i contenuti prima di preparare la coda.');
  if(!ms[0].scheduled_at)checked(await db.from('outreach_messages').update({scheduled_at:new Date().toISOString()}).eq('id',ms[0].id));
  for(const m of ms){const result=await db.from('outreach_outbox').insert({outreach_message_id:m.id,prospect_id:id,recipient:p.email,subject:m.subject,rendered_text:m.body,rendered_html:m.html,message_id:`<${m.id}@vesuviano-forni.com>`});if(result.error&&result.error.code!=='23505')throw new Error('MAIL_DB_FAILED');}
  return {note:'Tre email in coda; follow-up a 3 e 7 giorni dal primo invio confermato. Invii ancora soggetti ai controlli di avvio.'};
}
export async function dispatchMarioOnce(db:SupabaseClient) {
  const s=await settings(db);if(s.paused||!s.preflight?.ready)throw new Error('Invii bloccati: prerequisiti ancora da verificare.');
  const token=await lock(db);let c:ReturnType<typeof clients>|undefined;let timer:ReturnType<typeof setTimeout>|undefined;let claimedId:string|null=null;
  try{
    c=clients();const current=c;timer=setTimeout(()=>{current.smtp.close();current.imap.close();},85000);
    // Reconcile stale attempts without ever repeating SMTP.
    checked(await db.from('outreach_outbox').update({smtp_status:'unknown',last_error:'SMTP_UNKNOWN'}).eq('smtp_status','sending'));
    await c.imap.connect();if(!await importReplies(db,c.imap))return {note:'Controllo posta non ancora completo: nessun invio.'};
    const folder=await findSent(c.imap);await c.smtp.verify();
    // Replay accepted projections atomically after crashes; never resubmit the accepted MIME.
    const repair=checked(await db.from('outreach_outbox').select('id,outreach_messages!inner(status)').eq('smtp_status','accepted').eq('outreach_messages.status','approved').order('accepted_at').limit(10));
    for(const row of repair)checked(await db.rpc('project_mario_acceptance',{p_id:row.id}));
    const rows=checked(await db.rpc('mario_due_outbox'));
    if(!rows.length)return {note:'Nessuna email pronta.'};
    for(const row of rows){
      if(!row.mime){const mime=await composeEmail(row.recipient,row.subject,row.rendered_text,row.message_id,new Date(row.created_at),undefined,row.rendered_html,MARIO_SENDER);checked(await db.from('outreach_outbox').update({mime}).eq('id',row.id).is('mime',null));row.mime=mime;}
      if(!checked(await db.rpc('reserve_mario_submission',{p_id:row.id,p_token:token})))continue;
      claimedId=row.id;
      const res=await c.smtp.sendMail({envelope:{from:MARIO_SENDER,to:[row.recipient]},raw:rawMIME(row.mime)});
      if(!res.accepted?.some((a:string)=>String(a).toLowerCase()===row.recipient)||res.rejected?.length)throw new Error('SMTP_UNKNOWN');
      const at=new Date().toISOString();checked(await db.from('outreach_outbox').update({smtp_status:'accepted',accepted_at:at,last_error:null,sent_folder:folder}).eq('id',row.id));claimedId=null;
      checked(await db.rpc('project_mario_acceptance',{p_id:row.id}));
      // Exact Message-ID + pre-APPEND claim: an ambiguous copy is never blindly duplicated.
      try{if(await hasExactMessage(c.imap,folder,row.message_id))checked(await db.from('outreach_outbox').update({copy_status:'found'}).eq('id',row.id));else{const claim=checked(await db.from('outreach_outbox').update({append_attempted_at:new Date().toISOString(),copy_status:'unknown'}).eq('id',row.id).is('append_attempted_at',null).select('id').maybeSingle());if(claim){const copy=await c.imap.append(folder,rawMIME(row.mime),['\\Seen'],new Date(at));if(copy)checked(await db.from('outreach_outbox').update({copy_status:'appended'}).eq('id',row.id));}}}catch{checked(await db.from('outreach_outbox').update({copy_status:'unknown',last_error:'SENT_COPY_UNKNOWN'}).eq('id',row.id));}
      return {note:'Una email accettata dal server; la consegna al destinatario non è ancora confermata.'};
    }
    return {note:'Nessun invio: limite, intervallo, orario o idoneità non consentono la partenza.'};
  }catch(e){if(claimedId)checked(await db.from('outreach_outbox').update({smtp_status:'unknown',last_error:safeMailError(e)}).eq('id',claimedId).eq('smtp_status','sending'));checked(await db.from('outreach_settings').update({paused:true,pause_reason:'Invio interrotto: controllo manuale necessario.'}).eq('key','default'));throw new Error(safeMailError(e));}
  finally{if(timer)clearTimeout(timer);if(c){c.smtp.close();await closeIMAP(c.imap);}await unlock(db,token);}
}