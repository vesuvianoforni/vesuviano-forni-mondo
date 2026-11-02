import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { checked } from './engines.ts';
import { STARTER_TEMPLATES, renderMarioEmail } from './templates.ts';
import { canDraft, validateSequence } from './policy.ts';
import { containsPrices } from '../marketing-policy.ts';
import { enqueueMario, dispatchMarioOnce } from './delivery.ts';
import { validateResearchScope } from './research-policy.ts';
import { emailLanguage } from './markets.ts';
import { AUTOPILOT_THREAD, autoEligibility, dailyNewStarts, dailyScope, nextTerritory, warmupLimit } from './autopilot-policy.ts';

type Pilot = { enabled: boolean; owner_id: string | null; countries: string[]; territory_cursor: number; daily_organization_goal: number; last_planned_on: string | null };
const romeDay = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome' }).format(new Date());
const romeHour = () => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', hour: '2-digit', hour12: false }).format(new Date()));

// 1) Once per day: plan the next territory and approve it in the owner's name (explicit standing approval).
async function planToday(db: SupabaseClient, pilot: Pilot) {
  const today = romeDay();
  if (pilot.last_planned_on === today) return { planned: false, reason: 'Ricerca di oggi già pianificata.' };
  const active = checked(await db.from('outreach_research_plans').select('id').in('status', ['queued', 'running']).limit(1));
  if (active.length) return { planned: false, reason: 'Una ricerca è ancora in corso: la prossima partirà domani.' };
  const settings = checked(await db.from('outreach_settings').select('markets,cities,daily_limit,min_interval_seconds,paused,send_markets,updated_at').eq('key', 'default').single());
  const allowed = pilot.countries.filter(c => settings.markets.includes(c));
  const t = nextTerritory(pilot.territory_cursor, allowed);
  const proposal = validateResearchScope(dailyScope(t, pilot.daily_organization_goal), settings.markets);
  const plan = checked(await db.from('outreach_research_plans').insert({
    thread_id: AUTOPILOT_THREAD, request: `Autopilota ${today}: ${t.city} (${t.country})`, proposal,
    analysis: { settings, autopilot: true, territory: t, analyzed_at: new Date().toISOString() }, created_by: pilot.owner_id,
  }).select('id').single());
  const ok = checked(await db.rpc('approve_mario_research_plan', { p_id: plan.id, p_user: pilot.owner_id, p_jobs: proposal.targets }));
  checked(await db.from('outreach_autopilot').update({ last_planned_on: today, territory_cursor: t.cursor }).eq('key', 'default').select('key'));
  return { planned: ok, territory: `${t.city} (${t.country})`, plan_id: plan.id };
}

// 2) Prepare sequences from the approved templates for verified prospects, within the daily new-start budget.
async function prepareSequences(db: SupabaseClient, pilot: Pilot) {
  const s = checked(await db.from('outreach_settings').select('daily_limit,provider_verified_at').eq('key', 'default').single());
  const budget = dailyNewStarts(warmupLimit(s.provider_verified_at, s.daily_limit));
  if (!budget) return { prepared: 0, reason: 'Invio non ancora verificato: nessuna nuova sequenza.' };
  const start = new Date(`${romeDay()}T00:00:00+01:00`).toISOString();
  const already = checked(await db.from('outreach_messages').select('id', { count: 'exact', head: false }).eq('step', 0).eq('direction', 'outbound').gte('created_at', start).limit(1000)).length;
  let left = budget - already; let prepared = 0; let blocked = 0;
  if (left <= 0) return { prepared, reason: 'Quota nuove sequenze di oggi raggiunta.' };
  const saved = checked(await db.from('outreach_templates').select('*').eq('active', true));
  const candidates = checked(await db.from('outreach_prospects').select('*').eq('qualified', true).eq('recipient_eligibility', 'unreviewed').in('status', ['new', 'draft']).order('created_at').limit(Math.min(200, left * 2)));
  for (const p of candidates) {
    if (left <= 0) break;
    const verdict = autoEligibility(p);
    const suppressed = checked(await db.from('outreach_suppressions').select('value').in('value', [p.email, p.domain].filter(Boolean)));
    const exists = checked(await db.from('outreach_messages').select('id').eq('prospect_id', p.id).eq('direction', 'outbound').limit(1));
    if (verdict !== 'eligible' || suppressed.length || canDraft(p) || exists.length) {
      checked(await db.from('outreach_prospects').update({ recipient_eligibility: 'blocked', eligibility_note: 'Autopilota: email non idonea all’invio automatico (dominio, mercato o esclusione).', eligibility_checked_by: pilot.owner_id, eligibility_checked_at: new Date().toISOString() }).eq('id', p.id).eq('recipient_eligibility', 'unreviewed'));
      blocked++; continue;
    }
    const language = emailLanguage(p.country);
    const ms = STARTER_TEMPLATES.filter(t => t.kind === p.kind && t.language === language).map(t => ({ ...t, ...saved.find(x => x.key === t.key) }));
    validateSequence(ms, containsPrices);
    const at = new Date().toISOString();
    checked(await db.from('outreach_prospects').update({ recipient_eligibility: 'eligible', eligibility_note: 'Autopilota: email aziendale sul dominio ufficiale, mercato abilitato.', eligibility_checked_by: pilot.owner_id, eligibility_checked_at: at }).eq('id', p.id).eq('recipient_eligibility', 'unreviewed').select('id'));
    // Templates were approved by the admin; enabling the autopilot is the standing approval for their use.
    checked(await db.from('outreach_messages').insert(ms.map(m => { const r = renderMarioEmail(m.body, language); return { prospect_id: p.id, step: m.step, subject: m.subject, body: r.text, html: r.html, status: 'approved', approved_at: at, approved_by: pilot.owner_id, direction: 'outbound', template_key: m.key, sources: { evidence: p.evidence, template_key: m.key, autopilot: true } }; })).select('id'));
    await enqueueMario(db, p.id);
    prepared++; left--;
  }
  return { prepared, blocked };
}

export async function runAutopilot(db: SupabaseClient) {
  if (!checked(await db.rpc('acquire_mario_autopilot'))) return { skipped: 'busy' };
  const pilot = checked(await db.from('outreach_autopilot').select('*').eq('key', 'default').single()) as Pilot;
  const result: Record<string, unknown> = { at: new Date().toISOString() };
  try {
    if (!pilot.enabled || !pilot.owner_id) return { skipped: 'disabled' };
    const cfg = checked(await db.from('outreach_agent_config').select('ai_status,ai_reason').eq('key', 'default').single());
    if (cfg.ai_status) { result.paused = cfg.ai_reason ?? 'Servizi AI in pausa'; return result; }
    if (romeHour() >= 6) {
      try { result.research = await planToday(db, pilot); } catch (e) { result.research = { error: (e as Error).message.slice(0, 300) }; }
      try { result.sequences = await prepareSequences(db, pilot); } catch (e) { result.sequences = { error: (e as Error).message.slice(0, 300) }; }
    }
    try { result.delivery = await dispatchMarioOnce(db); } catch (e) { result.delivery = { blocked: (e as Error).message.slice(0, 300) }; }
    return result;
  } finally {
    await db.from('outreach_autopilot').update({ lease_until: null, last_result: result }).eq('key', 'default');
  }
}
