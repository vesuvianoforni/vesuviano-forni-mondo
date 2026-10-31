import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { DashboardLead } from '@/lib/erpDashboard';

async function fetchDashboardLeads() {
  const leads: DashboardLead[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from('leads')
      .select('id,company_name,contact_name,status,pipeline,archived,next_activity_type,next_activity_date,next_activity_notes')
      .eq('pipeline', 'Vesuviano').eq('archived', false)
      .order('created_at', { ascending: false }).order('id').range(from, from + 999);
    if (error) throw error;
    leads.push(...(data ?? []));
    if (!data || data.length < 1000) return leads;
  }
}

export function useERPDashboard() {
  const leads = useQuery({ queryKey: ['erp-dashboard', 'leads'], queryFn: fetchDashboardLeads, staleTime: 60_000 });
  const production = useQuery({
    queryKey: ['erp-dashboard', 'production'], staleTime: 60_000,
    queryFn: async () => {
      const { count, error } = await supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'in_produzione');
      if (error) throw error;
      return count ?? 0;
    },
  });
  const drafts = useQuery({
    queryKey: ['erp-dashboard', 'drafts'], staleTime: 60_000,
    queryFn: async () => {
      const { count, error } = await supabase.from('newsletter_campaigns').select('id', { count: 'exact', head: true }).eq('status', 'draft');
      if (error) throw error;
      return count ?? 0;
    },
  });
  return { leads, production, drafts };
}