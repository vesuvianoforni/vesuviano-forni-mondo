import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutRequest {
  ovenModel: string;
  fuelType: string;
  diameter: number;
  coating?: string;
  buildType: 'on_site' | 'ready_to_use';
  totalPrice: number;
  discountedPrice: number;
  depositAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  quoteId?: string;
  sessionId?: string;
  deliveryWeeks: number;
  pizzaCapacity: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const body: CheckoutRequest = await req.json();
    console.log('Creating checkout session for:', body);

    const {
      ovenModel,
      fuelType,
      diameter,
      coating,
      buildType,
      totalPrice,
      discountedPrice,
      depositAmount,
      customerName,
      customerEmail,
      customerPhone,
      quoteId,
      sessionId,
      deliveryWeeks,
      pizzaCapacity,
    } = body;

    // Validation
    if (!customerEmail || !customerName) {
      return new Response(
        JSON.stringify({ error: 'Customer email and name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create description
    const description = `Acconto 1% per Forno ${ovenModel} - ${fuelType} - ${diameter}cm${coating ? ` - ${coating}` : ''} - ${buildType === 'on_site' ? 'Costruito sul Posto' : 'Già Pronto all\'Uso'}`;

    // Get the origin from the request
    const origin = req.headers.get('origin') || 'https://5418db6d-f0a1-41c3-9a1f-f3089c8b1adb.lovableproject.com';
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Acconto 1% - Forno ${ovenModel}`,
              description: description,
              metadata: {
                ovenModel,
                fuelType,
                diameter: diameter.toString(),
                coating: coating || '',
                buildType,
                pizzaCapacity,
                deliveryWeeks: deliveryWeeks.toString(),
              },
            },
            unit_amount: Math.round(depositAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/configuratore?canceled=true`,
      customer_email: customerEmail,
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        ovenModel,
        fuelType,
        diameter: diameter.toString(),
        coating: coating || '',
        buildType,
        totalPrice: totalPrice.toString(),
        discountedPrice: discountedPrice.toString(),
        depositAmount: depositAmount.toString(),
        customerName,
        customerEmail,
        customerPhone,
        quoteId: quoteId || '',
        sessionId: sessionId || '',
        pizzaCapacity,
        deliveryWeeks: deliveryWeeks.toString(),
      },
    });

    console.log('Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
