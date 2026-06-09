import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface QuizAnswers {
  usage: "pizzeria" | "private" | string;
  covers?: string;
  style?: string;
  fuel?: string;
  name: string;
  email: string;
  phone: string;
  lang?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as QuizAnswers;
    const { usage, covers, style, fuel, name, email, phone, lang = "en" } = body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !usage) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Save the lead
    const { data: lead } = await supabase
      .from("website_leads")
      .insert({
        first_name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        form_type: "oven_finder_quiz",
        status: "new",
        oven_type: fuel || null,
        notes: `Quiz: usage=${usage} | covers=${covers || "n/a"} | style=${style || "n/a"} | fuel=${fuel || "any"}`,
        metadata: { usage, covers, style, fuel, lang },
      })
      .select()
      .single();

    // Sync lead to external ERP via webhook (same pattern as consultation form)
    const erpWebhookUrl = Deno.env.get("ERP_WEBHOOK_URL");
    if (erpWebhookUrl && lead?.id) {
      const erpPayload = {
        id: lead.id,
        source: "vesuviano_website",
        event_type: "website_lead_created",
        form_type: "oven_finder_quiz",
        customer_name: name.trim(),
        first_name: name.trim(),
        last_name: null,
        email: email.trim(),
        phone: phone.trim(),
        city: null,
        company: null,
        oven_type: fuel || null,
        notes: `Quiz: usage=${usage} | covers=${covers || "n/a"} | style=${style || "n/a"} | fuel=${fuel || "any"}`,
        metadata: { usage, covers, style, fuel, lang },
        timestamp: new Date().toISOString(),
      };
      try {
        const erpRes = await fetch(erpWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(erpPayload),
        });
        const erpText = await erpRes.text();
        console.log("ERP webhook (oven-finder) status:", erpRes.status, "body:", erpText);
      } catch (err) {
        console.error("ERP webhook (oven-finder) error:", err instanceof Error ? err.message : err);
      }
    } else if (!erpWebhookUrl) {
      console.log("ERP_WEBHOOK_URL not configured, skipping ERP sync");
    }

    // Fetch active ovens
    const { data: ovens } = await supabase
      .from("configurator_ovens")
      .select("model_name, description, diameter, fuel_type, pizza_capacity, sizes, base_price_a")
      .eq("is_active", true);

    // Build a compact catalog summary for the AI
    const catalog = (ovens || []).map((o) => ({
      model: o.model_name,
      diameter_cm: o.diameter,
      fuels: o.fuel_type,
      capacity: o.pizza_capacity,
      description: o.description?.slice(0, 200),
    }));

    let aiMessage = "";
    let recommendedModel = "";

    if (LOVABLE_API_KEY && catalog.length > 0) {
      const systemPrompt = `You are an expert advisor for Vesuviano, a Neapolitan artisan oven manufacturer. Based on the customer's needs, recommend the BEST single oven model from the catalog. Reply ONLY in language code "${lang}". Be warm, concise (max 4 short sentences), and specific. Mention the model name, why it fits, and one practical benefit. Do not invent prices.`;

      const userPrompt = `Customer profile:
- Usage: ${usage}
- Covers/seats: ${covers || "not specified"}
- Pizzeria style: ${style || "not specified"}
- Fuel preference: ${fuel || "no preference"}
- Name: ${name}

Available catalog:
${JSON.stringify(catalog, null, 2)}

Pick the single best model and explain in 3-4 sentences why it's perfect for this customer.`;

      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "recommend_oven",
                description: "Provide the recommended oven and explanation",
                parameters: {
                  type: "object",
                  properties: {
                    model_name: { type: "string", description: "Exact model name from the catalog" },
                    explanation: {
                      type: "string",
                      description: "Personalized explanation in the requested language, 3-4 sentences",
                    },
                  },
                  required: ["model_name", "explanation"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "recommend_oven" } },
        }),
      });

      if (aiRes.ok) {
        const data = await aiRes.json();
        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall) {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            recommendedModel = args.model_name || "";
            aiMessage = args.explanation || "";
          } catch (e) {
            console.error("Parse tool call failed", e);
          }
        }
      } else if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        console.error("AI gateway error", aiRes.status, await aiRes.text());
      }
    }

    // Fallback if AI failed
    if (!recommendedModel && catalog.length > 0) {
      recommendedModel = catalog[0].model;
      aiMessage =
        "Our expert will contact you shortly with a personalized recommendation based on your needs.";
    }

    // Find the matched oven for image
    const matched = ovens?.find(
      (o) => o.model_name?.toLowerCase() === recommendedModel.toLowerCase(),
    );

    // Send notification emails (admin full report + customer teaser)
    if (RESEND_API_KEY) {
      const labels: Record<string, string> = {
        pizzeria: "Pizzeria / Ristorante", private: "Uso privato",
        wood: "Legna", gas: "Gas", electric: "Elettrico", any: "Nessuna preferenza",
        traditional: "Napoletana tradizionale", modern: "Moderno / Contemporaneo",
        romana: "Romana / Pinsa", mixed: "Menu misto",
      };
      const lbl = (k?: string) => (k ? labels[k] || k : "—");

      const adminHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
          <div style="background:linear-gradient(135deg,#c2410c,#9a3412);padding:24px;border-radius:8px 8px 0 0;color:#fff;">
            <h1 style="margin:0;font-size:22px;">🔥 Nuovo lead — Oven Finder Quiz</h1>
            <p style="margin:6px 0 0;opacity:.9;font-size:13px;">Quiz "Find your perfect oven" completato</p>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
            <h2 style="font-size:16px;margin:0 0 12px;color:#111;">Contatti</h2>
            <table style="width:100%;font-size:14px;color:#333;border-collapse:collapse;">
              <tr><td style="padding:6px 0;width:120px;color:#666;">Nome</td><td><strong>${name}</strong></td></tr>
              <tr><td style="padding:6px 0;color:#666;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding:6px 0;color:#666;">Telefono</td><td><a href="tel:${phone}">${phone}</a></td></tr>
              <tr><td style="padding:6px 0;color:#666;">Lingua</td><td>${lang.toUpperCase()}</td></tr>
            </table>
            <h2 style="font-size:16px;margin:24px 0 12px;color:#111;">Risposte quiz</h2>
            <table style="width:100%;font-size:14px;color:#333;border-collapse:collapse;">
              <tr><td style="padding:6px 0;width:160px;color:#666;">Utilizzo</td><td>${lbl(usage)}</td></tr>
              <tr><td style="padding:6px 0;color:#666;">Coperti / Persone</td><td>${covers || "—"}</td></tr>
              <tr><td style="padding:6px 0;color:#666;">Stile pizza</td><td>${lbl(style)}</td></tr>
              <tr><td style="padding:6px 0;color:#666;">Combustibile</td><td>${lbl(fuel)}</td></tr>
            </table>
            <div style="margin-top:24px;padding:16px;background:#fff7ed;border-left:4px solid #c2410c;border-radius:4px;">
              <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:#9a3412;font-weight:600;">Raccomandazione AI</p>
              <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#111;">${recommendedModel || "—"}</p>
              <p style="margin:0;font-size:13px;color:#444;line-height:1.5;">${aiMessage || "—"}</p>
            </div>
            <p style="margin:24px 0 0;font-size:12px;color:#888;">Lead ID: ${lead?.id || "n/a"}</p>
          </div>
        </div>`;

      const customerSubjects: Record<string, string> = {
        it: "Abbiamo trovato il forno perfetto per te 🔥",
        en: "We've found your perfect oven 🔥",
        fr: "Nous avons trouvé votre four parfait 🔥",
        de: "Wir haben Ihren perfekten Ofen gefunden 🔥",
        es: "Hemos encontrado tu horno perfecto 🔥",
      };
      const customerBodies: Record<string, { title: string; body: string; signoff: string }> = {
        it: { title: `Grazie ${name}!`, body: "Abbiamo analizzato le tue risposte e individuato il forno perfetto per le tue esigenze. Un nostro esperto ti contatterà a brevissimo per presentartelo nei dettagli e prepararti un preventivo personalizzato.", signoff: "A presto,<br/>Il team Vesuviano Forni" },
        en: { title: `Thank you, ${name}!`, body: "We've analyzed your answers and identified the perfect oven for your needs. One of our experts will contact you very shortly to present it in detail and prepare a personalized quote.", signoff: "Talk soon,<br/>The Vesuviano Forni team" },
        fr: { title: `Merci ${name} !`, body: "Nous avons analysé vos réponses et identifié le four parfait pour vos besoins. L'un de nos experts vous contactera très prochainement pour vous le présenter en détail et préparer un devis personnalisé.", signoff: "À bientôt,<br/>L'équipe Vesuviano Forni" },
        de: { title: `Vielen Dank, ${name}!`, body: "Wir haben Ihre Antworten analysiert und den perfekten Ofen für Ihre Bedürfnisse gefunden. Einer unserer Experten wird Sie in Kürze kontaktieren, um ihn Ihnen im Detail vorzustellen und ein persönliches Angebot zu erstellen.", signoff: "Bis bald,<br/>Das Vesuviano Forni Team" },
        es: { title: `¡Gracias ${name}!`, body: "Hemos analizado tus respuestas e identificado el horno perfecto para tus necesidades. Uno de nuestros expertos te contactará muy pronto para presentártelo en detalle y prepararte un presupuesto personalizado.", signoff: "Hasta pronto,<br/>El equipo Vesuviano Forni" },
      };
      const cb = customerBodies[lang] || customerBodies.en;
      const customerHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
          <div style="background:linear-gradient(135deg,#c2410c,#9a3412);padding:32px 24px;text-align:center;color:#fff;border-radius:8px 8px 0 0;">
            <h1 style="margin:0;font-size:26px;font-weight:700;">${cb.title}</h1>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;padding:32px 24px;border-radius:0 0 8px 8px;">
            <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 24px;">${cb.body}</p>
            <div style="background:#fff7ed;border-left:4px solid #c2410c;padding:16px;border-radius:4px;margin:24px 0;">
              <p style="margin:0;font-size:14px;color:#9a3412;font-style:italic;">"Ogni forno Vesuviano è un'opera unica, costruita a mano nei nostri laboratori di Sant'Anastasia e Boscoreale."</p>
            </div>
            <p style="font-size:14px;color:#555;margin:24px 0 0;line-height:1.6;">${cb.signoff}</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
            <p style="font-size:12px;color:#888;text-align:center;margin:0;">
              Vesuviano Forni · <a href="https://vesuvianoforni.com" style="color:#c2410c;text-decoration:none;">vesuvianoforni.com</a><br/>
              📞 081 19231684 · ✉️ info@vesuvianoforni.com
            </p>
          </div>
        </div>`;

      const sendEmail = (to: string, subject: string, html: string) =>
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Vesuviano Forni <info@vesuvianoforni.com>",
            to: [to], subject, html,
          }),
        }).then(async (r) => {
          if (!r.ok) console.error(`Email to ${to} failed:`, r.status, await r.text());
          else console.log(`Email sent to ${to}`);
        }).catch((err) => console.error(`Email to ${to} error:`, err));

      await Promise.all([
        sendEmail("info@vesuvianoforni.com", `🔥 Nuovo lead Oven Finder — ${name}`, adminHtml),
        sendEmail(email, customerSubjects[lang] || customerSubjects.en, customerHtml),
      ]);
    } else {
      console.warn("RESEND_API_KEY missing — skipping email notifications");
    }

    return new Response(
      JSON.stringify({
        leadId: lead?.id,
        recommendation: {
          model_name: recommendedModel,
          explanation: aiMessage,
          diameter: matched?.diameter,
          capacity: matched?.pizza_capacity,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("oven-finder-recommend error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
