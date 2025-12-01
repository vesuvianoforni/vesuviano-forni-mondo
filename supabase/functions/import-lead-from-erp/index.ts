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
    const { name, email, phone, pipeline_id, price_list = 'A' } = await req.json();

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

    // Generate configurator link
    const configuratorLink = `https://www.vesuvianoforni.com/configuratore/${token}`;

    return new Response(
      JSON.stringify({
        success: true,
        session_id: session.id,
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
