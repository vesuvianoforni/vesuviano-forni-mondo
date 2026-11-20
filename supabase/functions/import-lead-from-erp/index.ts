import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify API key
    const apiKey = req.headers.get('x-api-key');
    const expectedApiKey = Deno.env.get('ERP_API_KEY');

    if (!apiKey || apiKey !== expectedApiKey) {
      console.error('Unauthorized: Invalid or missing API key');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { name, email, phone, pipeline_id, price_list = 'A', erp_webhook_url } = await req.json();

    // Validate required fields
    if (!name || !email || !phone) {
      console.error('Missing required fields:', { name: !!name, email: !!email, phone: !!phone });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, phone' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Invalid email format:', email);
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate price list
    if (!['A', 'B', 'C'].includes(price_list)) {
      console.error('Invalid price_list:', price_list);
      return new Response(
        JSON.stringify({ error: 'Invalid price_list. Must be A, B, or C' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating session for lead:', { name, email, phone, pipeline_id, price_list });

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Generate unique token
    const token = crypto.randomUUID();

    // Calculate expiration (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Prepare customer info with pipeline data
    const customerInfo = {
      imported_from: 'erp',
      pipeline_id: pipeline_id || null,
      imported_at: new Date().toISOString(),
    };

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('configurator_sessions')
      .insert({
        token,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        price_list,
        expires_at: expiresAt.toISOString(),
        status: 'draft',
        is_used: false,
        customer_info: customerInfo,
        created_by: null, // Imported from ERP, not created by admin
        erp_webhook_url: erp_webhook_url || null,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session', details: sessionError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Session created successfully:', session.id);

    // Mirror into the CRM board (dedupe by email or last 9 phone digits).
    // Inserting a new leads row fires the Bruno Telegram "new lead" notification.
    let leadId: string | null = null;
    try {
      const digits = String(phone).replace(/\D/g, '').slice(-9);
      const { data: existing } = await supabase
        .from('leads')
        .select('id, phone, email')
        .or(`email.ilike.${String(email).replace(/[,()]/g, '')},phone.ilike.%${digits}%`)
        .order('created_at', { ascending: true })
        .limit(20);
      const match = (existing ?? []).find((l: { email: string | null; phone: string | null }) =>
        (l.email && l.email.toLowerCase() === String(email).toLowerCase()) ||
        (digits.length >= 6 && String(l.phone ?? '').replace(/\D/g, '').slice(-9) === digits));
      if (match) {
        leadId = match.id;
      } else {
        const { data: lead, error: leadError } = await supabase
          .from('leads')
          .insert({ contact_name: name, email, phone, source: 'zapper_erp', status: 'nuovo', pipeline: 'Vesuviano' })
          .select('id')
          .single();
        if (leadError) console.error('CRM lead insert failed:', leadError.message);
        leadId = lead?.id ?? null;
      }
    } catch (e) {
      console.error('CRM lead mirror failed:', e instanceof Error ? e.message : e);
    }

    // Generate configurator link
    const configuratorLink = `https://vesuvianoforni.com/configuratore/${token}`;

    return new Response(
      JSON.stringify({
        success: true,
        session_id: session.id,
        lead_id: leadId,
        token,
        configurator_link: configuratorLink,
        expires_at: expiresAt.toISOString(),
        customer: {
          name,
          email,
          phone,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in import-lead-from-erp:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
