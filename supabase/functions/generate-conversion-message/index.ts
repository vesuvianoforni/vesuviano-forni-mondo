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
    
    // Extract detailed oven configuration from actions with better parsing
    let modelName = '';
    let diameter = '';
    let fuelType = '';
    let coating = '';
    
    // Parse actions to extract all configuration details
    for (const action of actions) {
      if (action.action === 'Modello' || action.type === 'model_selected') {
        modelName = action.details || action.model || '';
      }
      if (action.action === 'Diametro' || action.type === 'size_selected') {
        diameter = action.details || action.diameter || '';
      }
      if (action.action === 'Alimentazione' || action.type === 'fuel_selected') {
        fuelType = action.details || action.fuelType || '';
      }
      if (action.action === 'Rivestimento' || action.type === 'coating_selected') {
        coating = action.details || action.coating || '';
      }
    }
    
    // Fallback to quote data if actions don't have the info
    if (!modelName && quote?.configurator_ovens) {
      modelName = quote.configurator_ovens.model_name;
    }
    if (!diameter && quote?.configurator_ovens) {
      diameter = `${quote.configurator_ovens.diameter}cm`;
    }
    
    console.log('Extracted configuration:', { modelName, diameter, fuelType, coating });

    const activitySummary = actions.map((a: any) => `${a.action}: ${a.details || ''}`).join(', ');
    
    const systemPrompt = language === 'it' 
      ? `Sei un esperto venditore di forni a legna Vesuviano. Genera un'email BREVE e PERSONALIZZATA per il cliente.

REGOLE CRITICHE:
- Lunghezza: MASSIMO 100-120 parole (SOLO il corpo del messaggio, NON includere firma)
- USA il nome completo del cliente (es. "Caro Mario Rossi")
- CITA ESATTAMENTE le scelte fatte: modello specifico, diametro (es. 100cm), rivestimento scelto (es. Mosaico), alimentazione (legna/gas/elettrico)
- INDICA IL PREZZO: "il tuo forno configurato a €X.XXX"
- Tono emozionale ma conciso: parla del suo sogno pizzeria
- CHIEDI cosa potrebbe convincerlo a finalizzare l'acquisto (dubbi, domande, condizioni speciali)
- NON includere firma, contatti o saluti finali (verranno aggiunti automaticamente nel template HTML)
- Oggetto: max 50 caratteri con nome cliente

Formato JSON:
{
  "subject": "Oggetto con nome cliente",
  "message": "Messaggio breve e specifico SENZA firma"
}`
      : language === 'en'
      ? `You are an expert Vesuviano wood-fired oven seller. Generate a SHORT and PERSONALIZED email for the customer.

CRITICAL RULES:
- Length: MAX 100-120 words (ONLY the message body, do NOT include signature)
- USE customer's full name (e.g. "Dear John Smith")
- CITE EXACTLY their choices: specific model, diameter (e.g. 100cm), chosen coating (e.g. Mosaic), fuel type (wood/gas/electric)
- STATE THE PRICE: "your configured oven at €X,XXX"
- Emotional but concise tone: speak to their pizzeria dream
- ASK what could convince them to finalize the purchase (doubts, questions, special conditions)
- Do NOT include signature, contacts or closing greetings (they will be added automatically in HTML template)
- Subject: max 50 characters with customer name

JSON format:
{
  "subject": "Subject with customer name",
  "message": "Short and specific message WITHOUT signature"
}`
      : `Vous êtes un expert vendeur de fours à bois Vesuviano. Générez un email COURT et PERSONNALISÉ pour le client.

RÈGLES CRITIQUES:
- Longueur: MAX 100-120 mots (SEULEMENT le corps du message, N'incluez PAS la signature)
- UTILISEZ le nom complet (ex. "Cher Jean Dupont")
- CITEZ EXACTEMENT ses choix: modèle spécifique, diamètre (ex. 100cm), revêtement choisi (ex. Mosaïque), alimentation (bois/gaz/électrique)
- INDIQUEZ LE PRIX: "votre four configuré à €X.XXX"
- Ton émotionnel mais concis: parlez de son rêve pizzeria
- DEMANDEZ ce qui pourrait le convaincre de finaliser l'achat (doutes, questions, conditions spéciales)
- N'incluez PAS la signature, les contacts ou les salutations finales (ils seront ajoutés automatiquement dans le template HTML)
- Objet: max 50 caractères avec nom client

Format JSON:
{
  "subject": "Objet avec nom client",
  "message": "Message court et spécifique SANS signature"
}`;

    const userPrompt = language === 'it'
      ? `Cliente: ${customerName}

CONFIGURAZIONE SELEZIONATA DAL CLIENTE:
${modelName ? `🔥 Modello: ${modelName}` : '❌ Nessun modello'}
${diameter ? `📏 Diametro: ${diameter}` : ''}
${fuelType ? `⚡ Alimentazione: ${fuelType}` : ''}
${coating ? `🎨 Rivestimento: ${coating}` : ''}
${totalPrice ? `💰 Prezzo: €${Number(totalPrice).toLocaleString('it-IT')}` : ''}

IMPORTANTE: Devi citare ESATTAMENTE le scelte fatte:
- Modello: "${modelName}"
- Diametro: "${diameter}"
- Alimentazione: "${fuelType}"
- Rivestimento: "${coating}"
- Prezzo: €${totalPrice ? Number(totalPrice).toLocaleString('it-IT') : 'X.XXX'}

Email max 120 parole che:
1. Saluta il cliente per nome
2. Cita le sue scelte specifiche
3. Crea connessione emotiva
4. Chiede cosa potrebbe convincerlo a finalizzare
5. NON include firma (verrà aggiunta automaticamente)`
      : language === 'en'
      ? `Customer: ${customerName}

CUSTOMER SELECTED CONFIGURATION:
${modelName ? `🔥 Model: ${modelName}` : '❌ No model'}
${diameter ? `📏 Diameter: ${diameter}` : ''}
${fuelType ? `⚡ Fuel: ${fuelType}` : ''}
${coating ? `🎨 Coating: ${coating}` : ''}
${totalPrice ? `💰 Price: €${Number(totalPrice).toLocaleString('en-US')}` : ''}

CRITICAL: You must cite EXACTLY what they chose:
- Model: "${modelName}"
- Diameter: "${diameter}"
- Fuel: "${fuelType}"
- Coating: "${coating}"
- Price: €${totalPrice ? Number(totalPrice).toLocaleString('en-US') : 'X,XXX'}

Email max 120 words that:
1. Greets the customer by name
2. Cites their specific choices
3. Creates emotional connection
4. Asks what could convince them to finalize
5. Does NOT include signature (will be added automatically)`
      : `Client: ${customerName}

CONFIGURATION SÉLECTIONNÉE PAR LE CLIENT:
${modelName ? `🔥 Modèle: ${modelName}` : '❌ Aucun modèle'}
${diameter ? `📏 Diamètre: ${diameter}` : ''}
${fuelType ? `⚡ Alimentation: ${fuelType}` : ''}
${coating ? `🎨 Revêtement: ${coating}` : ''}
${totalPrice ? `💰 Prix: €${Number(totalPrice).toLocaleString('fr-FR')}` : ''}

CRITIQUE: Vous devez citer EXACTEMENT ce qu'il a choisi:
- Modèle: "${modelName}"
- Diamètre: "${diameter}"
- Alimentation: "${fuelType}"
- Revêtement: "${coating}"
- Prix: €${totalPrice ? Number(totalPrice).toLocaleString('fr-FR') : 'X.XXX'}

Email max 120 mots qui:
1. Salue le client par son nom
2. Cite ses choix spécifiques
3. Crée une connexion émotionnelle
4. Demande ce qui pourrait le convaincre de finaliser
5. N'inclut PAS la signature (elle sera ajoutée automatiquement)`;

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
    
    // Extract and parse JSON content with robust error handling
    let generatedContent;
    try {
      const rawContent = aiData.choices[0].message.content;
      console.log('Raw AI response:', rawContent);
      
      // Try to extract JSON if it's wrapped in markdown code blocks or text
      let jsonString = rawContent;
      const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                       rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[1] || jsonMatch[0];
      }
      
      generatedContent = JSON.parse(jsonString);
      
      // Validate required fields
      if (!generatedContent.subject || !generatedContent.message) {
        throw new Error('Missing required fields in AI response');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Failed to parse content:', aiData.choices[0].message.content);
      throw new Error('AI generated invalid response format');
    }

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