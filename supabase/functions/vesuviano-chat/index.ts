import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANG_NAMES: Record<string, string> = {
  it: "italiano", en: "English", fr: "français", de: "Deutsch", es: "español"
};

const CATALOG_KNOWLEDGE = `
=== CATALOGO PRODOTTI VESUVIANO ===

MODELLO ANASTASIA (Legna, Gas, Elettrico):
- Rivestimenti: Mosaico, Mosaico e Pittura
- 100cm: capacità 4-5 pizze
- 120cm: capacità 5-6 pizze
- 130cm: capacità 7-8 pizze

MODELLO REALBOSCO (Legna, Gas, Rotante):
- Rivestimenti: Mosaico, Pittura, Piastrelle
- 80cm: capacità 2-3 pizze
- 100cm: capacità 4-5 pizze
- 120cm: capacità 5-6 pizze
- 130cm: capacità 7-8 pizze

MODELLO OTTAVIO (Legna, Gas):
- Rivestimento: Palladiano
- 100cm: capacità 4-5 pizze
- 120cm: capacità 5-6 pizze
- 130cm: capacità 7-8 pizze
- 140cm: capacità 9-10 pizze
- 150cm: capacità 10-11 pizze

MODELLO SEBASTIAN (Legna, Gas, Elettrico):
- Rivestimento: Metallico
- 80cm: capacità 2-3 pizze
- 100cm: capacità 4-5 pizze
- 120cm: capacità 5-6 pizze
- 130cm: capacità 7-8 pizze

MODELLO VESUVIOBUONO 120VB & 130VB (Legna Eco-Professionale):
- Sistema di purificazione fumi integrato (0% polveri emesse)
- Perfetto per aree urbane e aziende attente all'ambiente
- Rivestimenti: Mosaico, Mosaico e Pittura
- 120VB: capacità 5-6 pizze
- 130VB: capacità 7-8 pizze

BRUCIATORI UNITECH (consigliati per Anastasia, Ottavio, Sebastian):
- BRM1 (1 fiamma, manuale, per forni 80cm): €900
- BRD1 (1 fiamma, digitale, per forni 80cm): €1.600
- BRM2 (2 fiamme, manuale, per forni 100-120cm): €1.323
- BRD2 (2 fiamme, digitale, per forni 100-120cm): €2.177
- BRM3 (3 fiamme, manuale, per forni 130cm): €1.657
- BRD3 (3 fiamme, digitale, per forni 130cm): €2.540

BRUCIATORI AVANZINI (consigliati per RealBosco):
- P1 Plus: per forni 80-100cm, controllo preciso, compatto e silenzioso
- P2 Plus: per forni 100-150cm, prestazioni professionali, zero manutenzione
- Drago D2M: per forni 100-160cm, 6 livelli di potenza, sicurezza certificata
- Drago Six: per forni 100-160cm, top di gamma, 6 livelli, qualità professionale

CONDIZIONI DI VENDITA:
- Acconto 50% per confermare l'ordine
- Saldo alla consegna
- Tutti i prezzi sono IVA esclusa
- Tempo di produzione: 30 giorni lavorativi
- Consegna: presso la sede del cliente
- Scarico: necessario muletto

CONTATTI:
- Indirizzo: Via Santa Chiara, 80048 Sant'Anastasia (NA)
- Telefono: +39 350 9286 941
- Email: info@vesuvianoforni.com
`;

function buildSystemPrompt(lang: string, knowledgeBase: string, liveProducts: string, liveBurners: string) {
  const langName = LANG_NAMES[lang] || "English";
  return `You are the AI sales assistant for Vesuviano, artisan Neapolitan manufacturers of professional pizza ovens. You are an EXPERT consultant who knows everything about our products.

=== KNOWLEDGE BASE (from CMS) ===
${knowledgeBase}

=== CATALOG & TECHNICAL SPECS ===
${CATALOG_KNOWLEDGE}

=== LIVE PRODUCT DATABASE (current prices & availability) ===
${liveProducts}

=== LIVE BURNERS DATABASE (current prices) ===
${liveBurners}

BEHAVIOR:
- ALWAYS respond in ${langName} (the customer's browser language)
- Be friendly, knowledgeable and professional - you are a pizza oven expert
- You CAN share prices from the live database! Use Listino A (base_price_a) prices for public customers
- When sharing prices, always mention "IVA esclusa" (VAT excluded) and that they are indicative
- Suggest the right oven model based on the customer's needs (volume, space, fuel preference)
- Recommend appropriate burners when discussing gas ovens
- Highlight unique selling points: handmade in Naples, traditional craftsmanship, eco-friendly VesuvioBuono
- Guide the customer toward requesting a personalized quote for exact pricing
- Be concise but informative, maximum 4-5 sentences per response
- If asked about something not in your knowledge, say you'll check with the team
- Do NOT include "Lascia i tuoi dati" - the contact form is handled separately by the UI
- When comparing models, create clear comparisons highlighting differences`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, lang } = await req.json();
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all data in parallel
    const [kbResult, ovensResult, burnersResult] = await Promise.all([
      supabase
        .from("ai_knowledge_base")
        .select("category, title, content")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("configurator_ovens")
        .select("model_name, diameter, pizza_capacity, fuel_type, base_price_a, gas_price_a, electric_price_a, delivery_time_weeks, coatings, sizes, is_active")
        .eq("is_active", true)
        .order("model_name"),
      supabase
        .from("burners")
        .select("name, price, description, specifications, is_active")
        .eq("is_active", true)
        .order("name"),
    ]);

    const knowledgeBase = (kbResult.data || [])
      .map((e: any) => `[${e.category.toUpperCase()}] ${e.title}: ${e.content}`)
      .join("\n");

    const liveProducts = (ovensResult.data || [])
      .map((o: any) => {
        const lines: string[] = [];
        const sizes = o.sizes as any[] || [];
        if (sizes.length > 0) {
          for (const size of sizes) {
            const coatings = size.coatings as any[] || [];
            for (const coat of coatings) {
              const p = coat.prices?.listA || {};
              let line = `${o.model_name} ${size.diameter}cm ${coat.name} - Capacità: ${size.pizza_capacity}`;
              if (p.base) line += ` | Legna: €${p.base}`;
              if (p.gas) line += ` | Gas: €${p.gas}`;
              if (p.electric) line += ` | Elettrico: €${p.electric}`;
              line += ` | Consegna: ${o.delivery_time_weeks} settimane`;
              lines.push(line);
            }
          }
        } else {
          lines.push(`${o.model_name} ${o.diameter}cm - Capacità: ${o.pizza_capacity} - Prezzo: da configurare | Consegna: ${o.delivery_time_weeks} settimane`);
        }
        return lines.join("\n");
      })
      .join("\n") || "Nessun prodotto disponibile al momento.";

    const liveBurners = (burnersResult.data || [])
      .map((b: any) => `${b.name}: €${b.price}${b.description ? ` - ${b.description}` : ""}`)
      .join("\n") || "Nessun bruciatore disponibile al momento.";

    const systemPrompt = buildSystemPrompt(
      lang || "en",
      knowledgeBase || "No knowledge base configured.",
      liveProducts,
      liveBurners
    );

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI error: ${err}`);
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
