import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Sei l'assistente AI di Vesuviano, produttori artigianali napoletani di forni professionali per pizza.

INFORMAZIONI CHIAVE SU VESUVIANO:
- Produciamo forni a legna, a gas, elettrici e rotativi per pizzerie professionali
- Siamo basati a Napoli, Italia
- I nostri forni sono esportati in tutto il mondo
- Offriamo anche il sistema VesuvioBuono (forno a zero emissioni)
- Servizio "Built on Place" per installazioni personalizzate
- Forni disponibili in pronta consegna
- Contatto telefonico: 081 19231684
- Email: info@vesuvianoforni.com
- Il nostro forno passa in spazi stretti da 45cm di larghezza

MODELLI PRINCIPALI:
- Forni Tradizionali a legna (vari diametri)
- Forni a Gas
- Forni Elettrici  
- Forni Rotativi
- Sistema VesuvioBuono (innovativo, zero emissioni)

COMPORTAMENTO:
- Rispondi in modo cordiale e professionale
- Rispondi nella lingua del cliente (italiano, inglese, francese, spagnolo, tedesco)
- Guida il cliente verso una consulenza gratuita o un preventivo
- Se il cliente sembra interessato, dopo 2-3 scambi suggerisci di lasciare i dati per essere ricontattato inserendo la frase esatta "Lascia i tuoi dati" nel messaggio
- Non inventare prezzi specifici, suggerisci di richiedere un preventivo personalizzato
- Sii conciso ma utile, massimo 3-4 frasi per risposta`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY not set");

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
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 500,
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
