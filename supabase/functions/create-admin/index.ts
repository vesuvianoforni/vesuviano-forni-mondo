import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, password, secret, role } = await req.json()
    const assignRole = role || 'admin'

    // Verifica il secret per prevenire accessi non autorizzati
    if (secret !== 'Zapper2019!') {
      return new Response(
        JSON.stringify({ error: 'Secret non valido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Crea l'utente
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (userError) throw userError

    // Assegna il ruolo admin
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userData.user.id,
        role: 'admin'
      })

    if (roleError) throw roleError

    console.log(`Admin user created: ${email}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Utente admin creato con successo',
        user_id: userData.user.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    console.error('Error creating admin:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
