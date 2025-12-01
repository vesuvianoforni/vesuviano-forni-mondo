import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncEvent {
  session_id: string;
  event_type: 'link_opened' | 'model_selected' | 'fuel_selected' | 'size_selected' | 'coating_selected' | 
               'color_render_generated' | 'architect_ai_used' | 'quote_saved' | 'contact_requested' | 
               'payment_initiated' | 'payment_completed' | 'feedback_not_interested';
  event_data?: any;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[SYNC-TO-ERP] Function invoked');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { session_id, event_type, event_data, timestamp }: SyncEvent = await req.json();
    console.log('[SYNC-TO-ERP] Event received:', { session_id, event_type });

    // Get session data including ERP webhook URL
    const { data: session, error: sessionError } = await supabaseClient
      .from('configurator_sessions')
      .select(`
        *,
        configurator_quotes (
          id,
          total_price,
          status,
          payment_completed,
          has_installation,
          has_gas
        )
      `)
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      console.error('[SYNC-TO-ERP] Session not found:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if session has ERP webhook URL
    if (!session.erp_webhook_url) {
      console.log('[SYNC-TO-ERP] No ERP webhook URL configured for this session');
      return new Response(
        JSON.stringify({ message: 'No ERP webhook configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[SYNC-TO-ERP] Sending to ERP webhook:', session.erp_webhook_url);

    // Prepare payload for ERP
    const payload = {
      session_id: session.id,
      token: session.token,
      customer_name: session.customer_name,
      customer_email: session.customer_email,
      customer_phone: session.customer_phone,
      price_list: session.price_list,
      status: session.status,
      event_type,
      event_data,
      timestamp,
      link_opened: session.is_used,
      last_opened_at: session.last_opened_at,
      customer_actions: session.customer_actions,
      quote: session.configurator_quotes ? {
        id: session.configurator_quotes.id,
        total_price: session.configurator_quotes.total_price,
        status: session.configurator_quotes.status,
        payment_completed: session.configurator_quotes.payment_completed,
        has_installation: session.configurator_quotes.has_installation,
        has_gas: session.configurator_quotes.has_gas
      } : null,
      feedback_status: session.feedback_status,
      feedback_reason: session.feedback_reason,
      configurator_link: `https://www.vesuvianoforni.com/configuratore/${session.token}`
    };

    // Send to ERP webhook
    const erpResponse = await fetch(session.erp_webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!erpResponse.ok) {
      console.error('[SYNC-TO-ERP] ERP webhook failed:', erpResponse.status, erpResponse.statusText);
      return new Response(
        JSON.stringify({ error: 'ERP webhook failed', status: erpResponse.status }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[SYNC-TO-ERP] Successfully sent to ERP');

    return new Response(
      JSON.stringify({ success: true, message: 'Event synced to ERP' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[SYNC-TO-ERP] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});