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
      ? `Sei un esperto venditore di forni a legna professionali per pizzerie. Il tuo compito è generare un messaggio email persuasivo e personalizzato per convertire un potenziale cliente.

Regole:
- Usa un tono professionale ma caldo e personale
- Indirizza il cliente per nome
- Fai riferimento SPECIFICO al modello, dimensioni, rivestimento scelto e prezzo
- Menziona TUTTI i dettagli tecnici forniti (diametro, capacità pizze, alimentazione, rivestimento)
- Includi il prezzo specifico se disponibile
- Crea urgenza senza essere aggressivo
- Evidenzia i benefici chiave del prodotto scelto
- Includi una call-to-action chiara
- Lunghezza: 200-250 parole
- Non usare formule troppo commerciali
- Oggetto email: max 60 caratteri, accattivante e personalizzato

Formato risposta (JSON):
{
  "subject": "Oggetto email",
  "message": "Corpo del messaggio"
}`
      : language === 'en'
      ? `You are an expert seller of professional wood-fired ovens for pizzerias. Your task is to generate a persuasive and personalized email message to convert a potential customer.

Rules:
- Use a professional but warm and personal tone
- Address the customer by name
- Make SPECIFIC reference to the model, dimensions, coating chosen and price
- Mention ALL technical details provided (diameter, pizza capacity, fuel type, coating)
- Include the specific price if available
- Create urgency without being aggressive
- Highlight key benefits of the chosen product
- Include a clear call-to-action
- Length: 200-250 words
- Don't use overly commercial formulas
- Email subject: max 60 characters, catchy and personalized

Response format (JSON):
{
  "subject": "Email subject",
  "message": "Message body"
}`
      : `Vous êtes un expert en vente de fours à bois professionnels pour pizzerias. Votre tâche est de générer un message email persuasif et personnalisé pour convertir un client potentiel.

Règles:
- Utilisez un ton professionnel mais chaleureux et personnel
- Adressez-vous au client par son nom
- Faites référence SPÉCIFIQUE au modèle, dimensions, revêtement choisi et prix
- Mentionnez TOUS les détails techniques fournis (diamètre, capacité pizzas, alimentation, revêtement)
- Incluez le prix spécifique si disponible
- Créez l'urgence sans être agressif
- Mettez en évidence les avantages clés du produit choisi
- Incluez un appel à l'action clair
- Longueur: 200-250 mots
- N'utilisez pas de formules trop commerciales
- Objet email: max 60 caractères, accrocheur et personnalisé

Format de réponse (JSON):
{
  "subject": "Objet de l'email",
  "message": "Corps du message"
}`;

    const userPrompt = language === 'it'
      ? `Genera un messaggio di conversione per:

Cliente: ${customerName}
Status: ${status}
${ovenDetails ? `Forno configurato: ${ovenDetails}` : 'Nessun forno configurato ancora'}
${fuelTypeInfo ? fuelTypeInfo : ''}
${coatingInfo ? coatingInfo : ''}
${totalPrice ? `Prezzo preventivo: €${Number(totalPrice).toLocaleString('it-IT')}` : ''}
${quote?.has_gas ? 'Con kit gas' : ''}
${quote?.has_installation ? 'Con installazione' : ''}
Attività: ${activitySummary || 'Ha visitato il configuratore'}

IMPORTANTE: Menziona TUTTI i dettagli specifici forniti (modello, diametro, rivestimento, prezzo) nel messaggio per renderlo personale e convincente.`
      : language === 'en'
      ? `Generate a conversion message for:

Customer: ${customerName}
Status: ${status}
${ovenDetails ? `Configured oven: ${ovenDetails}` : 'No oven configured yet'}
${fuelTypeInfo ? fuelTypeInfo : ''}
${coatingInfo ? coatingInfo : ''}
${totalPrice ? `Quote price: €${Number(totalPrice).toLocaleString('en-US')}` : ''}
${quote?.has_gas ? 'With gas kit' : ''}
${quote?.has_installation ? 'With installation' : ''}
Activity: ${activitySummary || 'Visited the configurator'}

IMPORTANT: Mention ALL specific details provided (model, diameter, coating, price) in the message to make it personal and convincing.`
      : `Générez un message de conversion pour:

Client: ${customerName}
Statut: ${status}
${ovenDetails ? `Four configuré: ${ovenDetails}` : 'Aucun four configuré pour le moment'}
${fuelTypeInfo ? fuelTypeInfo : ''}
${coatingInfo ? coatingInfo : ''}
${totalPrice ? `Prix du devis: €${Number(totalPrice).toLocaleString('fr-FR')}` : ''}
${quote?.has_gas ? 'Avec kit gaz' : ''}
${quote?.has_installation ? 'Avec installation' : ''}
Activité: ${activitySummary || 'A visité le configurateur'}

IMPORTANT: Mentionnez TOUS les détails spécifiques fournis (modèle, diamètre, revêtement, prix) dans le message pour le rendre personnel et convaincant.`;

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

    return new Response(
      JSON.stringify({
        subject: generatedContent.subject,
        message: generatedContent.message,
        customerEmail: session.customer_email,
        customerName: session.customer_name
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