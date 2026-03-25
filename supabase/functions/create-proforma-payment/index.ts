import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proforma_id, token } = await req.json();

    if (!proforma_id || !token) {
      return new Response(JSON.stringify({ error: "Missing proforma_id or token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch proforma
    const { data: proforma, error: proformaError } = await supabase
      .from("proformas")
      .select("*")
      .eq("id", proforma_id)
      .eq("token", token)
      .single();

    if (proformaError || !proforma) {
      return new Response(JSON.stringify({ error: "Proforma not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (proforma.payment_status === "paid") {
      return new Response(JSON.stringify({ error: "Already paid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const depositWithFee = proforma.deposit_amount * 1.035;
    const depositAmountCents = Math.round(depositWithFee * 100);
    const depositLabel = proforma.payment_option === "deposit_5"
      ? "Deposito 5% - Blocca Offerta"
      : "Acconto 50% - Spedizione Rapida";

    const customerName = proforma.customer_name || "Cliente";
    const companyName = proforma.company_name ? ` (${proforma.company_name})` : "";

    // Map proforma currency to Stripe currency code
    const currencyMap: Record<string, string> = {
      "EUR": "eur",
      "USD": "usd",
      "GBP": "gbp",
      "CHF": "chf",
    };
    const stripeCurrency = currencyMap[proforma.currency] || "eur";

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: stripeCurrency,
            product_data: {
              name: `${depositLabel} — Vesuviano Forni`,
              description: `Pro-Forma per ${customerName}${companyName}`,
            },
            unit_amount: depositAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: proforma.customer_email || undefined,
      success_url: `${req.headers.get("origin")}/proforma/${token}?payment=success`,
      cancel_url: `${req.headers.get("origin")}/proforma/${token}?payment=cancelled`,
      metadata: {
        proforma_id: proforma.id,
        token: proforma.token,
      },
    });

    // Save stripe session id
    await supabase
      .from("proformas")
      .update({ stripe_session_id: session.id })
      .eq("id", proforma.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
