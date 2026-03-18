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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const burners = [
      {
        name: 'P1 Atmospheric',
        description: 'Bruciatore atmosferico multigas Serie P (manuale) per forno Ø80. Non richiede alimentazione elettrica (batterie integrate). Fiamma simile a quella della legna.',
        image_url: '/lovable-uploads/bruciatore-p1.jpg',
        price: 0,
        is_active: true,
        specifications: {
          series: 'P',
          control: 'Manuale',
          power_supply: 'Batterie integrate',
          oven_sizes: '80',
          lpg_consumption: '0.54 kg/h',
          methane_consumption: '1.58 mc/h',
          power_kw: 15,
          power_kcal: 13000
        }
      },
      {
        name: 'P1 Plus Atmospheric',
        description: 'Bruciatore atmosferico multigas Serie P (manuale) per forno Ø100/110. Non richiede alimentazione elettrica (batterie integrate). Fiamma simile a quella della legna.',
        image_url: '/lovable-uploads/bruciatore-p1.jpg',
        price: 0,
        is_active: true,
        specifications: {
          series: 'P',
          control: 'Manuale',
          power_supply: 'Batterie integrate',
          oven_sizes: '100, 110',
          lpg_consumption: '0.86 kg/h',
          methane_consumption: '1.58 mc/h',
          power_kw: 24,
          power_kcal: 20640
        }
      },
      {
        name: 'P2 Atmospheric',
        description: 'Bruciatore atmosferico multigas Serie P (manuale) per forni Ø120/130/140/150. Non richiede alimentazione elettrica (batterie integrate). Fiamma simile a quella della legna.',
        image_url: '/lovable-uploads/bruciatore-p2.jpg',
        price: 0,
        is_active: true,
        specifications: {
          series: 'P',
          control: 'Manuale',
          power_supply: 'Batterie integrate',
          oven_sizes: '120, 130, 140, 150',
          lpg_consumption: '1.22 kg/h',
          methane_consumption: '1.75 mc/h',
          power_kw: 34,
          power_kcal: 29200
        }
      },
      {
        name: 'D1/M Atmospheric',
        description: 'Bruciatore atmosferico multigas Serie D (digitale) per forni Ø80/100/110. Pannello di controllo digitale con alimentazione 220V-50/60 Hz monofase.',
        image_url: '/lovable-uploads/bruciatore-d1m.jpg',
        price: 0,
        is_active: true,
        specifications: {
          series: 'D',
          control: 'Digitale',
          power_supply: '220V-50/60 Hz monofase',
          oven_sizes: '80, 100, 110',
          lpg_consumption: '0.86 kg/h',
          methane_consumption: '1.50 mc/h',
          power_kw: 24,
          power_kcal: 20640
        }
      },
      {
        name: 'D2/M Atmospheric',
        description: 'Bruciatore atmosferico multigas Serie D (digitale) per forni Ø120/130/140/150. Pannello di controllo digitale con alimentazione 220V-50/60 Hz monofase.',
        image_url: '/lovable-uploads/bruciatore-d2m.jpg',
        price: 0,
        is_active: true,
        specifications: {
          series: 'D',
          control: 'Digitale',
          power_supply: '220V-50/60 Hz monofase',
          oven_sizes: '120, 130, 140, 150',
          lpg_consumption: '1.22 kg/h',
          methane_consumption: '1.75 mc/h',
          power_kw: 34,
          power_kcal: 29200
        }
      },
      {
        name: 'DRAGO SIX Atmospheric',
        description: 'Bruciatore atmosferico multigas DRAGO SIX Serie D (digitale) per forni Ø120/130/140/150. Pannello di controllo digitale con alimentazione 220V-50/60 Hz monofase.',
        image_url: '/lovable-uploads/bruciatore-drago-six.jpg',
        price: 0,
        is_active: true,
        specifications: {
          series: 'D',
          control: 'Digitale',
          power_supply: '220V-50/60 Hz monofase',
          oven_sizes: '120, 130, 140, 150',
          lpg_consumption: '1.22 kg/h',
          methane_consumption: '1.75 mc/h',
          power_kw: 34,
          power_kcal: 29200
        }
      },
      {
        name: 'GOLD 34',
        description: 'Bruciatore atmosferico multigas Serie GOLD (digitale premium) per forni Ø120/130/140/150. Pannello di controllo digitale con alimentazione 220V-50/60 Hz monofase.',
        image_url: '/lovable-uploads/bruciatore-gold-34.jpg',
        price: 0,
        is_active: true,
        specifications: {
          series: 'GOLD',
          control: 'Digitale',
          power_supply: '220V-50/60 Hz monofase',
          oven_sizes: '120, 130, 140, 150',
          lpg_consumption: '1.05 kg/h',
          methane_consumption: '1.35 mc/h'
        }
      }
    ]

    // Check existing burners to avoid duplicates
    const { data: existing } = await supabase.from('burners').select('name')
    const existingNames = new Set((existing || []).map((b: any) => b.name))
    const toInsert = burners.filter(b => !existingNames.has(b.name))

    if (toInsert.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'All burners already exist', added: 0 }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data, error } = await supabase.from('burners').insert(toInsert).select()
    if (error) throw error

    return new Response(JSON.stringify({ success: true, added: data?.length || 0 }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
  }
})
