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

    const getPizzaCapacity = (diameter: number, fuelType: string): string => {
      if (diameter === 80) return fuelType === 'Legna' ? '2 pizze' : '3 pizze';
      if (diameter === 100) return fuelType === 'Legna' ? '4 pizze' : '5-6 pizze';
      if (diameter === 120) return fuelType === 'Legna' ? '5 pizze' : '6-7 pizze';
      if (diameter === 130) return fuelType === 'Legna' ? '6 pizze' : '7-8 pizze';
      return '';
    };

    const models = [
      { name: 'Sebastian', image: '/lovable-uploads/forno-metallo-nero-nuovo.png', basePrice: 3500, deliveryWeeks: 4 },
      { name: 'Realbosco', image: '/lovable-uploads/vesuviobuono-verde-mosaico.jpg', basePrice: 4000, deliveryWeeks: 4 },
      { name: 'Anastasia', image: '/lovable-uploads/forno-mosaico-rosso.jpg', basePrice: 3800, deliveryWeeks: 4 },
      { name: 'Ottavio', image: '/lovable-uploads/forno-metallo-bianco-nuovo.png', basePrice: 4500, deliveryWeeks: 5 }
    ];

    const fuelTypes = ['Elettrico', 'Gas', 'Legna'];
    const diameters = [80, 100, 120, 130];
    const ovensToInsert = [];

    for (const model of models) {
      const availableFuelTypes = model.name === 'Realbosco' ? [...fuelTypes, 'Rotante'] : fuelTypes;
      for (const fuelType of availableFuelTypes) {
        for (const diameter of diameters) {
          ovensToInsert.push({
            model_name: model.name,
            fuel_type: fuelType,
            diameter: diameter,
            pizza_capacity: getPizzaCapacity(diameter, fuelType),
            base_price: model.basePrice + (diameter - 80) * 200,
            delivery_time_weeks: model.deliveryWeeks,
            image_url: model.image,
            description: `Forno ${model.name} ${fuelType} - Diametro ${diameter}cm`,
            is_active: true
          });
        }
      }
    }

    const { data: ovensData, error: ovensError } = await supabase.from('configurator_ovens').insert(ovensToInsert).select();
    if (ovensError) throw ovensError;

    const optionsToInsert = [
      { name: 'Montaggio sul posto', type: 'installation', price: 500.00, description: 'Servizio di montaggio professionale', is_active: true },
      { name: 'Conversione a Gas', type: 'gas_conversion', price: 800.00, description: 'Kit conversione da legna a gas', is_active: true }
    ];

    const { data: optionsData, error: optionsError } = await supabase.from('configurator_options').insert(optionsToInsert).select();
    if (optionsError) throw optionsError;

    return new Response(JSON.stringify({ success: true, ovens: ovensData?.length || 0, options: optionsData?.length || 0 }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});