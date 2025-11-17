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

    console.log('Starting configurator data initialization...')

    // Inserisco i forni tradizionali
    const traditionalOvens = [
      {
        name: 'Forno Tradizionale Bianco',
        category: 'Tradizionale',
        image_url: '/lovable-uploads/forno-metallo-bianco-nuovo.png',
        base_price: 3500.00,
        delivery_time_weeks: 6,
        diameters: ['80cm', '100cm', '120cm', '140cm'],
        description: 'Forno a legna tradizionale con rivestimento bianco elegante',
        is_active: true
      },
      {
        name: 'Forno Tradizionale Nero',
        category: 'Tradizionale',
        image_url: '/lovable-uploads/forno-metallo-nero-nuovo.png',
        base_price: 3500.00,
        delivery_time_weeks: 6,
        diameters: ['80cm', '100cm', '120cm', '140cm'],
        description: 'Forno a legna tradizionale con rivestimento nero metallico',
        is_active: true
      },
      {
        name: 'Forno Terra del Gusto',
        category: 'Tradizionale',
        image_url: '/lovable-uploads/forno-arancione-terra-del-gusto.png',
        base_price: 4200.00,
        delivery_time_weeks: 8,
        diameters: ['100cm', '120cm', '140cm'],
        description: 'Forno premium con rivestimento arancione terra',
        is_active: true
      },
      {
        name: 'Forno Elegante Nero',
        category: 'Tradizionale',
        image_url: '/lovable-uploads/forno-nero-elegante.png',
        base_price: 3800.00,
        delivery_time_weeks: 6,
        diameters: ['80cm', '100cm', '120cm'],
        description: 'Design elegante con finitura nera professionale',
        is_active: true
      }
    ]

    // Inserisco i forni con mosaico
    const mosaicOvens = [
      {
        name: 'Forno Mosaico Bianco',
        category: 'Mosaico',
        image_url: '/lovable-uploads/forno-mosaico-bianco.jpg',
        base_price: 4500.00,
        delivery_time_weeks: 8,
        diameters: ['100cm', '120cm', '140cm'],
        description: 'Forno artigianale con rivestimento in mosaico bianco',
        is_active: true
      },
      {
        name: 'Forno Mosaico Grigio-Nero',
        category: 'Mosaico',
        image_url: '/lovable-uploads/forno-mosaico-grigio-nero.jpg',
        base_price: 4500.00,
        delivery_time_weeks: 8,
        diameters: ['100cm', '120cm', '140cm'],
        description: 'Elegante mosaico grigio e nero per design moderno',
        is_active: true
      },
      {
        name: 'Forno Mosaico Rosso',
        category: 'Mosaico',
        image_url: '/lovable-uploads/forno-mosaico-rosso.jpg',
        base_price: 4800.00,
        delivery_time_weeks: 8,
        diameters: ['100cm', '120cm', '140cm'],
        description: 'Mosaico rosso tradizionale napoletano',
        is_active: true
      },
      {
        name: 'Forno Mosaico Nero-Beige',
        category: 'Mosaico',
        image_url: '/lovable-uploads/forno-mosaico-nero-beige.jpg',
        base_price: 4500.00,
        delivery_time_weeks: 8,
        diameters: ['100cm', '120cm', '140cm'],
        description: 'Combinazione elegante nero e beige',
        is_active: true
      }
    ]

    // Inserisco i forni a gas
    const gasOvens = [
      {
        name: 'Forno Gas Mosaico Azzurro',
        category: 'Gas',
        image_url: '/lovable-uploads/forno-gas-mosaico-azzurro.jpg',
        base_price: 5500.00,
        delivery_time_weeks: 10,
        diameters: ['100cm', '120cm', '140cm'],
        description: 'Forno a gas con mosaico azzurro mediterraneo',
        is_active: true
      },
      {
        name: 'Forno Gas Verde Mosaico',
        category: 'Gas',
        image_url: '/lovable-uploads/forno-gas-verde-mosaico.png',
        base_price: 5500.00,
        delivery_time_weeks: 10,
        diameters: ['100cm', '120cm', '140cm'],
        description: 'Forno a gas con elegante mosaico verde',
        is_active: true
      }
    ]

    // Inserisco i forni rotanti
    const rotatingOvens = [
      {
        name: 'Forno Rotativo Mosaico',
        category: 'Rotativo',
        image_url: '/lovable-uploads/forno-rotativo-mosaico.png',
        base_price: 8500.00,
        delivery_time_weeks: 12,
        diameters: ['120cm', '140cm', '160cm'],
        description: 'Forno rotativo professionale con mosaico',
        is_active: true
      },
      {
        name: 'Forno Rotativo Mosaico Nero',
        category: 'Rotativo',
        image_url: '/lovable-uploads/forno-rotativo-mosaico-nero.jpg',
        base_price: 8800.00,
        delivery_time_weeks: 12,
        diameters: ['120cm', '140cm', '160cm'],
        description: 'Forno rotativo con elegante mosaico nero',
        is_active: true
      }
    ]

    // Inserisco il sistema VesuvioBuono
    const vesuvioBuonoOvens = [
      {
        name: 'VesuvioBuono Marrone',
        category: 'VesuvioBuono',
        image_url: '/lovable-uploads/vesuviobuono-marrone-completo.jpg',
        base_price: 6500.00,
        delivery_time_weeks: 10,
        diameters: ['100cm', '120cm'],
        description: 'Sistema rivoluzionario a zero emissioni con abbattitore di fuliggine',
        is_active: true
      },
      {
        name: 'VesuvioBuono Verde Mosaico',
        category: 'VesuvioBuono',
        image_url: '/lovable-uploads/vesuviobuono-verde-mosaico.jpg',
        base_price: 7200.00,
        delivery_time_weeks: 10,
        diameters: ['100cm', '120cm'],
        description: 'VesuvioBuono con elegante mosaico verde',
        is_active: true
      },
      {
        name: 'VesuvioBuono Osteria Pizza',
        category: 'VesuvioBuono',
        image_url: '/lovable-uploads/vesuviobuono-ostepizza-completo.png',
        base_price: 6800.00,
        delivery_time_weeks: 10,
        diameters: ['100cm', '120cm'],
        description: 'Sistema completo per osterie e pizzerie',
        is_active: true
      }
    ]

    // Combino tutti i forni
    const allOvens = [
      ...traditionalOvens,
      ...mosaicOvens,
      ...gasOvens,
      ...rotatingOvens,
      ...vesuvioBuonoOvens
    ]

    // Inserisco i forni
    const { data: ovensData, error: ovensError } = await supabase
      .from('configurator_ovens')
      .insert(allOvens)
      .select()

    if (ovensError) {
      console.error('Error inserting ovens:', ovensError)
      throw ovensError
    }

    console.log(`Inserted ${ovensData.length} ovens`)

    // Inserisco le opzioni aggiuntive
    const options = [
      {
        name: 'Montaggio in loco',
        type: 'installation',
        price: 800.00,
        description: 'Installazione professionale presso la vostra sede con certificazione',
        is_active: true
      },
      {
        name: 'Conversione a Gas',
        type: 'gas',
        price: 1200.00,
        description: 'Sistema di conversione da legna a gas con certificazione',
        is_active: true
      }
    ]

    const { data: optionsData, error: optionsError } = await supabase
      .from('configurator_options')
      .insert(options)
      .select()

    if (optionsError) {
      console.error('Error inserting options:', optionsError)
      throw optionsError
    }

    console.log(`Inserted ${optionsData.length} options`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Configurator data initialized successfully',
        ovens_count: ovensData.length,
        options_count: optionsData.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in init-configurator-data function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})