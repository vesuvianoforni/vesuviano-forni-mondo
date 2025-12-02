import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, language = 'it' } = await req.json();
    
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch session details
    const { data: session, error: sessionError } = await supabase
      .from('configurator_sessions')
      .select(`
        *,
        configurator_quotes (
          oven_id,
          has_installation,
          has_gas,
          total_price,
          configurator_ovens (
            model_name,
            fuel_type,
            diameter,
            pizza_capacity,
            coatings
          )
        )
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Session not found');
    }

    // Build context for AI
    const customerName = session.customer_name || 'Cliente';
    const status = session.status;
    const actions = session.customer_actions || [];
    const quote = session.configurator_quotes?.[0];
    
    // Extract price from multiple sources
    let totalPrice = quote?.total_price;
    if (!totalPrice) {
      // Try to get price from actions (coating_selected, quote_saved, contact_requested, payment_initiated)
      const coatingAction = actions.find((a: any) => a.type === 'coating_selected');
      const quoteAction = actions.find((a: any) => a.type === 'quote_saved');
      const contactAction = actions.find((a: any) => a.type === 'contact_requested');
      const paymentAction = actions.find((a: any) => a.type === 'payment_initiated');
      
      totalPrice = coatingAction?.totalPrice || coatingAction?.total_price ||
                   quoteAction?.totalPrice || quoteAction?.total_price ||
                   contactAction?.totalPrice || contactAction?.total_price ||
                   paymentAction?.totalPrice || paymentAction?.total_price;
    }
    
    // Extract detailed oven configuration from actions
    let ovenDetails = '';
    let coatingInfo = '';
    let fuelTypeInfo = '';
    
    if (quote?.configurator_ovens) {
      const oven = quote.configurator_ovens;
      ovenDetails = `Modello: ${oven.model_name}, Diametro: ${oven.diameter}cm, Capacità: ${oven.pizza_capacity} pizze`;
      
      // Get fuel type from actions or quote
      const fuelAction = actions.find((a: any) => a.type === 'fuel_selected');
      if (fuelAction?.fuelType) {
        fuelTypeInfo = `Alimentazione: ${fuelAction.fuelType}`;
      } else if (oven.fuel_type) {
        fuelTypeInfo = `Alimentazione: ${oven.fuel_type.join('/')}`;
      }
      
      // Get coating from actions
      const coatingAction = actions.find((a: any) => a.type === 'coating_selected');
      if (coatingAction?.coating) {
        coatingInfo = `Rivestimento: ${coatingAction.coating}`;
      }
    }

    const activitySummary = actions.map((a: any) => `${a.action}: ${a.details || ''}`).join(', ');
    
    const systemPrompt = language === 'it' 
      ? `Sei un esperto venditore di forni a legna Vesuviano. Genera un'email BREVE e PERSONALIZZATA per convertire il cliente.

REGOLE CRITICHE:
- Lunghezza: MASSIMO 100-120 parole
- USA il nome completo del cliente (es. "Caro Mario Rossi")
- CITA ESATTAMENTE le scelte fatte: modello specifico, diametro (es. 100cm), rivestimento scelto (es. Mosaico), alimentazione (legna/gas/elettrico)
- INDICA IL PREZZO: "il tuo forno configurato a €X.XXX"
- Tono emozionale ma conciso: parla del suo sogno pizzeria
- Call-to-action chiara: "Ti chiamo per finalizzare"
- Oggetto: max 50 caratteri con nome cliente

Formato JSON:
{
  "subject": "Oggetto con nome cliente",
  "message": "Messaggio breve e specifico"
}`
      : language === 'en'
      ? `You are an expert Vesuviano wood-fired oven seller. Generate a SHORT and PERSONALIZED email to convert the customer.

CRITICAL RULES:
- Length: MAX 100-120 words
- USE customer's full name (e.g. "Dear John Smith")
- CITE EXACTLY their choices: specific model, diameter (e.g. 100cm), chosen coating (e.g. Mosaic), fuel type (wood/gas/electric)
- STATE THE PRICE: "your configured oven at €X,XXX"
- Emotional but concise tone: speak to their pizzeria dream
- Clear call-to-action: "I'll call you to finalize"
- Subject: max 50 characters with customer name

JSON format:
{
  "subject": "Subject with customer name",
  "message": "Short and specific message"
}`
      : `Vous êtes un expert vendeur de fours à bois Vesuviano. Générez un email COURT et PERSONNALISÉ pour convertir le client.

RÈGLES CRITIQUES:
- Longueur: MAX 100-120 mots
- UTILISEZ le nom complet (ex. "Cher Jean Dupont")
- CITEZ EXACTEMENT ses choix: modèle spécifique, diamètre (ex. 100cm), revêtement choisi (ex. Mosaïque), alimentation (bois/gaz/électrique)
- INDIQUEZ LE PRIX: "votre four configuré à €X.XXX"
- Ton émotionnel mais concis: parlez de son rêve pizzeria
- Appel à l'action clair: "Je vous appelle pour finaliser"
- Objet: max 50 caractères avec nom client

Format JSON:
{
  "subject": "Objet avec nom client",
  "message": "Message court et spécifique"
}`;

    const userPrompt = language === 'it'
      ? `Cliente: ${customerName}

SCELTE SPECIFICHE FATTE:
${ovenDetails ? `🔥 ${ovenDetails}` : 'Nessun modello scelto'}
${fuelTypeInfo ? `⚡ ${fuelTypeInfo}` : ''}
${coatingInfo ? `🎨 ${coatingInfo}` : ''}
${totalPrice ? `💰 Prezzo totale: €${Number(totalPrice).toLocaleString('it-IT')}` : ''}

Genera email BREVE (max 120 parole):
1. Saluto con "${customerName}"
2. CITA LE SUE SCELTE ESATTE: "${ovenDetails || 'modello'}", "${fuelTypeInfo || 'alimentazione'}", "${coatingInfo || 'rivestimento'}"
3. MENZIONA PREZZO: €${totalPrice ? Number(totalPrice).toLocaleString('it-IT') : 'X.XXX'}
4. Tocca emozione: il suo sogno pizzeria
5. Call-to-action: "Ti chiamo per finalizzare"`
      : language === 'en'
      ? `Customer: ${customerName}

SPECIFIC CHOICES MADE:
${ovenDetails ? `🔥 ${ovenDetails}` : 'No model selected'}
${fuelTypeInfo ? `⚡ ${fuelTypeInfo}` : ''}
${coatingInfo ? `🎨 ${coatingInfo}` : ''}
${totalPrice ? `💰 Total price: €${Number(totalPrice).toLocaleString('en-US')}` : ''}

Generate SHORT email (max 120 words):
1. Greeting with "${customerName}"
2. CITE THEIR EXACT CHOICES: "${ovenDetails || 'model'}", "${fuelTypeInfo || 'fuel type'}", "${coatingInfo || 'coating'}"
3. MENTION PRICE: €${totalPrice ? Number(totalPrice).toLocaleString('en-US') : 'X,XXX'}
4. Touch emotion: their pizzeria dream
5. Call-to-action: "I'll call you to finalize"`
      : `Client: ${customerName}

CHOIX SPÉCIFIQUES FAITS:
${ovenDetails ? `🔥 ${ovenDetails}` : 'Aucun modèle sélectionné'}
${fuelTypeInfo ? `⚡ ${fuelTypeInfo}` : ''}
${coatingInfo ? `🎨 ${coatingInfo}` : ''}
${totalPrice ? `💰 Prix total: €${Number(totalPrice).toLocaleString('fr-FR')}` : ''}

Générez email COURT (max 120 mots):
1. Salutation avec "${customerName}"
2. CITEZ SES CHOIX EXACTS: "${ovenDetails || 'modèle'}", "${fuelTypeInfo || 'alimentation'}", "${coatingInfo || 'revêtement'}"
3. MENTIONNEZ PRIX: €${totalPrice ? Number(totalPrice).toLocaleString('fr-FR') : 'X.XXX'}
4. Touchez émotion: son rêve pizzeria
5. Appel à l'action: "Je vous appelle pour finaliser"`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error('Failed to generate message');
    }

    const aiData = await aiResponse.json();
    const generatedContent = JSON.parse(aiData.choices[0].message.content);

    // Get oven image URL
    let ovenImageUrl = '';
    if (quote?.configurator_ovens?.image_url) {
      ovenImageUrl = quote.configurator_ovens.image_url;
    }

    return new Response(
      JSON.stringify({
        subject: generatedContent.subject,
        message: generatedContent.message,
        customerEmail: session.customer_email,
        customerName: session.customer_name,
        ovenImageUrl: ovenImageUrl
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-conversion-message:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});