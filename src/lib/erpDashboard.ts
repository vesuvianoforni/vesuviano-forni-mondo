import { ACTIVE_CRM_STAGES, CRM_STAGES, normalizeCRMStage } from './crmPipeline';
import { activityTiming } from './crmActivity';
import type { Tables } from '@/integrations/supabase/types';

export type DashboardLead = Pick<Tables<'leads'>,
  'id' | 'company_name' | 'contact_name' | 'status' | 'pipeline' | 'archived' |
  'next_activity_type' | 'next_activity_date' | 'next_activity_notes'>;

export function summarizeDashboardLeads(leads: DashboardLead[], now = new Date()) {
  const visible = leads.filter(lead => lead.pipeline === 'Vesuviano' && !lead.archived);
  const stages = CRM_STAGES.map(stage => ({
    ...stage,
    count: visible.filter(lead => normalizeCRMStage(lead.status) === stage.id).length,
  }));
  const active = visible.filter(lead => ACTIVE_CRM_STAGES.some(stage => stage.id === normalizeCRMStage(lead.status)));
  const activities = active.flatMap(lead => {
    const timing = activityTiming(lead.next_activity_date, now);
    return timing.date ? [{ lead, timing }] : [];
  }).sort((a, b) => (a.timing.date?.getTime() ?? 0) - (b.timing.date?.getTime() ?? 0));

  return {
    stages,
    activeCount: active.length,
    overdueCount: activities.filter(activity => activity.timing.state === 'overdue').length,
    todayCount: activities.filter(activity => activity.timing.date?.toDateString() === now.toDateString()).length,
    activities,
  };
}