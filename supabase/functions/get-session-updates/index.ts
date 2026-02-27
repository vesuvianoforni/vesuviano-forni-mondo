import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[GET-SESSION-UPDATES] Function invoked');

    // Check API key authentication
    const apiKey = req.headers.get('x-api-key');
    const expectedApiKey = Deno.env.get('ERP_API_KEY');

    if (!apiKey || apiKey !== expectedApiKey) {
      console.error('[GET-SESSION-UPDATES] Invalid API key');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');
    const pipelineId = url.searchParams.get('pipeline_id');
    const since = url.searchParams.get('since'); // ISO timestamp for filtering

    console.log('[GET-SESSION-UPDATES] Query params:', { sessionId, pipelineId, since });

    // Build query
    let query = supabaseClient
      .from('configurator_sessions')
      .select(`
        *,
        configurator_quotes (
          id,
          total_price,
          status,
          payment_completed,
          has_installation,
          has_gas,
          delivery_time_weeks,
          customer_name,
          customer_email,
          customer_phone
        )
      `);

    // Filter by session_id if provided
    if (sessionId) {
      query = query.eq('id', sessionId);
    }

    // Filter by pipeline_id if provided (stored in customer_info)
    if (pipelineId) {
      query = query.contains('customer_info', { pipeline_id: pipelineId });
    }

    // Filter by timestamp if provided
    if (since) {
      query = query.gte('created_at', since);
    }

    // Only return sessions imported from ERP
    query = query.contains('customer_info', { imported_from: 'erp' });

    // Order by most recent first
    query = query.order('created_at', { ascending: false });

    const { data: sessions, error } = await query;

    if (error) {
      console.error('[GET-SESSION-UPDATES] Query error:', error);
      return new Response(
        JSON.stringify({ error: 'Database query failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[GET-SESSION-UPDATES] Found sessions:', sessions?.length || 0);

    // Format response data
    const formattedSessions = sessions?.map(session => ({
      session_id: session.id,
      token: session.token,
      customer_name: session.customer_name,
      customer_email: session.customer_email,
      customer_phone: session.customer_phone,
      price_list: session.price_list,
      status: session.status,
      created_at: session.created_at,
      link_sent: session.link_sent,
      link_opened: session.is_used,
      last_opened_at: session.last_opened_at,
      customer_actions: session.customer_actions || [],
      quote: session.configurator_quotes ? {
        id: session.configurator_quotes.id,
        total_price: session.configurator_quotes.total_price,
        status: session.configurator_quotes.status,
        payment_completed: session.configurator_quotes.payment_completed,
        has_installation: session.configurator_quotes.has_installation,
        has_gas: session.configurator_quotes.has_gas,
        delivery_time_weeks: session.configurator_quotes.delivery_time_weeks
      } : null,
      feedback_status: session.feedback_status,
      feedback_reason: session.feedback_reason,
      pipeline_id: session.customer_info?.pipeline_id || null,
      configurator_link: `https://vesuvianoforni.com/configuratore/${session.token}`,
      
      // Extract summary data from customer actions
      summary: {
        has_opened: session.is_used,
        has_selected_model: session.customer_actions?.some((a: any) => a.type === 'model_selected') || false,
        has_configured: session.customer_actions?.some((a: any) => a.type === 'coating_selected') || false,
        has_generated_render: session.customer_actions?.some((a: any) => a.type === 'color_render_generated') || false,
        has_used_architect_ai: session.customer_actions?.some((a: any) => a.type === 'architect_ai_used') || false,
        has_saved_quote: session.customer_actions?.some((a: any) => a.type === 'quote_saved') || false,
        has_requested_contact: session.status === 'interested',
        has_initiated_payment: session.status === 'payment_initiated',
        has_completed_payment: session.configurator_quotes?.payment_completed || false,
        is_not_interested: session.feedback_status === 'not_interested'
      }
    })) || [];

    return new Response(
      JSON.stringify({
        success: true,
        count: formattedSessions.length,
        sessions: formattedSessions
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[GET-SESSION-UPDATES] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});