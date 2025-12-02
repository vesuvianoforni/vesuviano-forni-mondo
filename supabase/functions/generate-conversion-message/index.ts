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
      ? `Sei un esperto venditore di forni a legna professionali per pizzerie. Il tuo compito è generare un messaggio email persuasivo, emozionale e personalizzato per convertire un potenziale cliente.

Regole per il messaggio:
- USA SEMPRE il nome E cognome del cliente per personalizzare (es. "Caro Mario Rossi")
- Fai riferimento SPECIFICO e DETTAGLIATO al forno che ha configurato (modello, diametro, capacità pizze, rivestimento)
- Menziona il PREZZO ESATTO che ha visualizzato con la formula "il forno che hai configurato a €X.XXX"
- Usa un approccio EMOZIONALE che parla dei sogni del cliente (successo della pizzeria, qualità del prodotto, tradizione napoletana)
- Crea un'immagine vivida: "Immagina il tuo forno [rivestimento] con diametro [X]cm che produce [Y] pizze perfette ogni servizio"
- Enfatizza il valore artigianale e l'unicità del forno Vesuviano
- Includi vantaggi concreti: tradizione napoletana, qualità dei materiali, supporto post-vendita
- Crea urgenza con frasi come "questa configurazione personalizzata", "l'opportunità di avere il tuo forno"
- Chiusura con call-to-action chiara e calda (es. "Parliamone insieme", "Ti chiamo per finalizzare")
- Lunghezza: 250-300 parole
- Tono: professionale ma caloroso, mai aggressivo
- Oggetto email: max 60 caratteri, emozionale e personalizzato con nome cliente

Formato risposta (JSON):
{
  "subject": "Oggetto email con nome cliente",
  "message": "Corpo del messaggio emozionale e personalizzato"
}`
      : language === 'en'
      ? `You are an expert seller of professional wood-fired ovens for pizzerias. Your task is to generate a persuasive, emotional and personalized email message to convert a potential customer.

Message rules:
- ALWAYS use customer's first name AND last name for personalization (e.g. "Dear John Smith")
- Make SPECIFIC and DETAILED reference to the oven they configured (model, diameter, pizza capacity, coating)
- Mention the EXACT PRICE they viewed with formula "the oven you configured at €X,XXX"
- Use an EMOTIONAL approach that speaks to customer's dreams (pizzeria success, product quality, Neapolitan tradition)
- Create vivid imagery: "Imagine your [coating] oven with [X]cm diameter producing [Y] perfect pizzas every service"
- Emphasize artisanal value and uniqueness of Vesuviano ovens
- Include concrete benefits: Neapolitan tradition, material quality, post-sale support
- Create urgency with phrases like "this personalized configuration", "the opportunity to have your oven"
- Close with clear and warm call-to-action (e.g. "Let's talk about it", "I'll call you to finalize")
- Length: 250-300 words
- Tone: professional but warm, never aggressive
- Email subject: max 60 characters, emotional and personalized with customer name

Response format (JSON):
{
  "subject": "Email subject with customer name",
  "message": "Emotional and personalized message body"
}`
      : `Vous êtes un expert en vente de fours à bois professionnels pour pizzerias. Votre tâche est de générer un message email persuasif, émotionnel et personnalisé pour convertir un client potentiel.

Règles du message:
- Utilisez TOUJOURS le prénom ET nom du client pour personnaliser (ex. "Cher Jean Dupont")
- Faites référence SPÉCIFIQUE et DÉTAILLÉE au four qu'il a configuré (modèle, diamètre, capacité pizzas, revêtement)
- Mentionnez le PRIX EXACT qu'il a vu avec formule "le four que vous avez configuré à €X.XXX"
- Utilisez une approche ÉMOTIONNELLE qui parle des rêves du client (succès pizzeria, qualité produit, tradition napolitaine)
- Créez une image vivante: "Imaginez votre four [revêtement] de diamètre [X]cm produisant [Y] pizzas parfaites chaque service"
- Soulignez la valeur artisanale et l'unicité des fours Vesuviano
- Incluez avantages concrets: tradition napolitaine, qualité matériaux, support après-vente
- Créez l'urgence avec phrases comme "cette configuration personnalisée", "l'opportunité d'avoir votre four"
- Clôture avec appel à l'action clair et chaleureux (ex. "Parlons-en ensemble", "Je vous appelle pour finaliser")
- Longueur: 250-300 mots
- Ton: professionnel mais chaleureux, jamais agressif
- Objet email: max 60 caractères, émotionnel et personnalisé avec nom client

Format de réponse (JSON):
{
  "subject": "Objet email avec nom client",
  "message": "Corps du message émotionnel et personnalisé"
}`;

    const userPrompt = language === 'it'
      ? `Genera un messaggio di conversione EMOZIONALE E DETTAGLIATO per:

Cliente: ${customerName}
Status: ${status}
${ovenDetails ? `✅ FORNO CONFIGURATO: ${ovenDetails}` : 'Nessun forno configurato ancora'}
${fuelTypeInfo ? `🔥 ${fuelTypeInfo}` : ''}
${coatingInfo ? `🎨 ${coatingInfo}` : ''}
${totalPrice ? `💰 PREZZO PREVENTIVO: €${Number(totalPrice).toLocaleString('it-IT')}` : ''}
${quote?.has_gas ? '⚙️ Con kit gas' : ''}
${quote?.has_installation ? '🔧 Con installazione' : ''}
Attività: ${activitySummary || 'Ha visitato il configuratore'}

IMPORTANTE ISTRUZIONI:
1. USA il nome completo "${customerName}" nella formula di apertura (es. "Caro ${customerName}")
2. DESCRIVI IN DETTAGLIO il forno che ha configurato: modello, diametro ${ovenDetails ? ovenDetails.match(/Diametro: (\d+)cm/)?.[1] + 'cm' : ''}, capacità pizze, rivestimento scelto
3. MENZIONA SEMPRE IL PREZZO ESATTO: "il forno che hai configurato a €${totalPrice ? Number(totalPrice).toLocaleString('it-IT') : 'X.XXX'}"
4. USA un taglio EMOZIONALE: parla dei sogni del cliente, del successo della sua pizzeria, della tradizione napoletana
5. CREA UN'IMMAGINE VIVIDA del suo forno in azione nella sua pizzeria
6. Enfatizza l'ARTIGIANALITÀ e UNICITÀ di ogni forno Vesuviano
7. Chiudi con call-to-action calorosa e personale`
      : language === 'en'
      ? `Generate an EMOTIONAL AND DETAILED conversion message for:

Customer: ${customerName}
Status: ${status}
${ovenDetails ? `✅ CONFIGURED OVEN: ${ovenDetails}` : 'No oven configured yet'}
${fuelTypeInfo ? `🔥 ${fuelTypeInfo}` : ''}
${coatingInfo ? `🎨 ${coatingInfo}` : ''}
${totalPrice ? `💰 QUOTE PRICE: €${Number(totalPrice).toLocaleString('en-US')}` : ''}
${quote?.has_gas ? '⚙️ With gas kit' : ''}
${quote?.has_installation ? '🔧 With installation' : ''}
Activity: ${activitySummary || 'Visited the configurator'}

IMPORTANT INSTRUCTIONS:
1. USE the full name "${customerName}" in opening (e.g. "Dear ${customerName}")
2. DESCRIBE IN DETAIL the oven they configured: model, diameter, pizza capacity, chosen coating
3. ALWAYS MENTION THE EXACT PRICE: "the oven you configured at €${totalPrice ? Number(totalPrice).toLocaleString('en-US') : 'X,XXX'}"
4. USE an EMOTIONAL approach: speak about customer's dreams, pizzeria success, Neapolitan tradition
5. CREATE A VIVID IMAGE of their oven in action in their pizzeria
6. Emphasize the CRAFTSMANSHIP and UNIQUENESS of each Vesuviano oven
7. Close with warm and personal call-to-action`
      : `Générez un message de conversion ÉMOTIONNEL ET DÉTAILLÉ pour:

Client: ${customerName}
Statut: ${status}
${ovenDetails ? `✅ FOUR CONFIGURÉ: ${ovenDetails}` : 'Aucun four configuré pour le moment'}
${fuelTypeInfo ? `🔥 ${fuelTypeInfo}` : ''}
${coatingInfo ? `🎨 ${coatingInfo}` : ''}
${totalPrice ? `💰 PRIX DU DEVIS: €${Number(totalPrice).toLocaleString('fr-FR')}` : ''}
${quote?.has_gas ? '⚙️ Avec kit gaz' : ''}
${quote?.has_installation ? '🔧 Avec installation' : ''}
Activité: ${activitySummary || 'A visité le configurateur'}

INSTRUCTIONS IMPORTANTES:
1. UTILISEZ le nom complet "${customerName}" dans l'ouverture (ex. "Cher ${customerName}")
2. DÉCRIVEZ EN DÉTAIL le four qu'il a configuré: modèle, diamètre, capacité pizzas, revêtement choisi
3. MENTIONNEZ TOUJOURS LE PRIX EXACT: "le four que vous avez configuré à €${totalPrice ? Number(totalPrice).toLocaleString('fr-FR') : 'X.XXX'}"
4. UTILISEZ une approche ÉMOTIONNELLE: parlez des rêves du client, du succès de sa pizzeria, de la tradition napolitaine
5. CRÉEZ UNE IMAGE VIVANTE de son four en action dans sa pizzeria
6. Soulignez l'ARTISANAT et l'UNICITÉ de chaque four Vesuviano
7. Terminez par un appel à l'action chaleureux et personnel`;

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