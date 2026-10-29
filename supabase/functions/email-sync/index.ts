import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { mailbox, syncMailbox } from '../_shared/email-service.ts';
import { imapClient, smtpClient, findSent, closeIMAP, mailConfig } from '../_shared/email-transport.ts';
import { safeMailError } from '../_shared/email-rules.ts';

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('status') }), z.object({ action: z.literal('test') }),
  z.object({ action: z.literal('sync') }), z.object({ action: z.literal('enable'), enabled: z.boolean() }),
  z.object({ action: z.literal('process'), run_id: z.string().uuid() }),
]);
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Metodo non consentito' },405);
  try {
    const url = Deno.env.get('SUPABASE_URL'); const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return json({ error: 'Servizio non configurato' },503);
    const admin = createClient(url,key);
    let raw;
    try { raw = await req.json(); } catch { return json({ error: 'Richiesta non valida' },400); }
    const parsed = schema.safeParse(raw);
    if (!parsed.success) return json({ error: 'Richiesta non valida' },400);
    const input = parsed.data;
    if (input.action === 'process') {
      // This endpoint can only consume an existing, recent queued run. It cannot create work, send SMTP,
      // select a mailbox, change configuration or read content. The DB scheduler owns run creation.
      const { data: run, error } = await admin.from('email_sync_runs').select('id,kind,status,mailbox_id,created_at').eq('id',input.run_id).maybeSingle();
      if (error || !run || run.status !== 'queued' || Date.now()-new Date(run.created_at).getTime() > 5*60000) return json({ error: 'Operazione non disponibile' },404);
      if (run.kind === 'connection_test') {
        const imap = imapClient(), smtp = smtpClient();
        try {
          const { data: claimed } = await admin.from('email_sync_runs').update({status:'running',started_at:new Date().toISOString()}).eq('id',run.id).eq('status','queued').select('id').maybeSingle();
          if (!claimed) return json({error:'Operazione non disponibile'},404);
          await imap.connect();
          const sent=await findSent(imap);
          await smtp.verify();
          await admin.from('email_mailboxes').update({sent_folder:sent,last_error:null}).eq('id',run.mailbox_id);
          await admin.from('email_sync_runs').update({status:'success',finished_at:new Date().toISOString()}).eq('id',run.id);
          return json({connected:true});
        } catch(e) {
          const code=safeMailError(e);
          await admin.from('email_sync_runs').update({status:'failed',error_code:code,finished_at:new Date().toISOString()}).eq('id',run.id);
          await admin.from('email_mailboxes').update({last_error:code}).eq('id',run.mailbox_id);
          return json({error:code},422);
        } finally { smtp.close();await closeIMAP(imap); }
      }
      EdgeRuntime.waitUntil(syncMailbox(admin,run.id));
      return json({ queued: true },202);
    }
    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i,'');
    const { data: auth } = await admin.auth.getUser(token);
    if (!auth?.user) return json({ error: 'Non autenticato' },401);
    const { data: roles, error: roleError } = await admin.from('user_roles').select('role').eq('user_id',auth.user.id);
    const isAdmin = roles?.some(r => r.role === 'admin');
    if (roleError || !roles?.some(r => ['admin','commerciale'].includes(r.role))) return json({ error: 'Accesso negato' },403);
    const box = await mailbox(admin);
    if (input.action === 'status') {
      const { data: runs, error } = await admin.from('email_sync_runs').select('id,kind,status,processed,linked,error_code,started_at,finished_at,created_at').eq('mailbox_id',box.id).order('created_at',{ascending:false}).limit(15);
      if (error) throw new Error('MAIL_DB_FAILED');
      const { count: unlinked } = await admin.from('email_items').select('id',{head:true,count:'exact'}).eq('mailbox_id',box.id).is('lead_id',null);
      const { count: copies } = await admin.from('email_outbox').select('id',{head:true,count:'exact'}).eq('mailbox_id',box.id).eq('smtp_status','accepted').not('copy_status','in','(found,appended)');
      const { count: unknown } = await admin.from('email_outbox').select('id',{head:true,count:'exact'}).eq('mailbox_id',box.id).in('smtp_status',['sending','unknown']);
      let configReady = true, configError: string | null = null;
      try { mailConfig(); } catch(e) { configReady=false; configError=safeMailError(e); }
      return json({ mailbox: { address:box.address, enabled:box.enabled, sent_folder:box.sent_folder, last_sync_at:box.last_sync_at, last_error:box.last_error }, runs:runs||[], unlinked:unlinked||0, pending_copies:copies||0, unknown_submissions:unknown||0, config_ready:configReady, config_error:configError, can_manage:!!isAdmin });
    }
    if (input.action === 'enable') {
      if (!isAdmin) return json({ error: 'Solo gli amministratori possono attivare la casella' },403);
      if (input.enabled) {
        mailConfig();
        if (!box.sent_folder) return json({ error: 'Verifica prima la connessione alla casella' },409);
      }
      const { error } = await admin.from('email_mailboxes').update({enabled:input.enabled}).eq('id',box.id);
      if (error) throw new Error('MAIL_DB_FAILED');
      return json({ enabled: input.enabled });
    }
    if (input.action === 'test') {
      const imap = imapClient(), smtp = smtpClient();
      let stage = 'imap';
      try {
        await imap.connect();
        const sent = await findSent(imap,box.sent_folder);
        stage = 'smtp'; await smtp.verify();
        const { error } = await admin.from('email_mailboxes').update({sent_folder:sent,last_error:null}).eq('id',box.id);
        if (error) throw new Error('MAIL_DB_FAILED');
        return json({ connected:true, sent_folder:sent });
      } catch(e) {
        const code=safeMailError(e);
        await admin.from('email_mailboxes').update({last_error:code}).eq('id',box.id);
        return json({ error:code, stage },422);
      } finally { smtp.close(); await closeIMAP(imap); }
    }
    if (!box.enabled) return json({error:'MAILBOX_DISABLED'},409);
    const { data:run, error } = await admin.from('email_sync_runs').insert({mailbox_id:box.id}).select('id').single();
    if (error?.code === '23505') return json({queued:true,already_queued:true},202);
    if (error || !run) throw new Error('MAIL_DB_FAILED');
    EdgeRuntime.waitUntil(syncMailbox(admin,run.id));
    return json({queued:true,run_id:run.id},202);
  } catch(e) {
    const code=safeMailError(e);
    console.error('Email operation failed',code);
    return json({error:code},422);
  }
});