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
    const { proforma_id, token, payment_method } = await req.json();

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

    const depositAmountCents = Math.round(proforma.deposit_amount * 100);
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

    // Map currency to bank transfer type
    const bankTransferTypeMap: Record<string, { type: string; country_key?: string; country?: string }> = {
      "eur": { type: "eu_bank_transfer", country_key: "eu_bank_transfer", country: "IT" },
      "gbp": { type: "gb_bank_transfer" },
      "usd": { type: "us_bank_transfer" },
    };

    const isBankTransfer = payment_method === "bank_transfer";

    let stripeCustomerId: string | undefined;

    if (isBankTransfer) {
      // Bank transfer requires a Stripe customer
      const customerEmail = proforma.customer_email || undefined;
      
      if (customerEmail) {
        const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
        if (customers.data.length > 0) {
          stripeCustomerId = customers.data[0].id;
        }
      }

      if (!stripeCustomerId) {
        const newCustomer = await stripe.customers.create({
          name: `${customerName}${companyName}`,
          email: customerEmail,
          phone: proforma.customer_phone || undefined,
        });
        stripeCustomerId = newCustomer.id;
      }
    }

    // Build session params
    const sessionParams: any = {
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
      success_url: `${req.headers.get("origin")}/proforma/${token}?payment=success`,
      cancel_url: `${req.headers.get("origin")}/proforma/${token}?payment=cancelled`,
      metadata: {
        proforma_id: proforma.id,
        token: proforma.token,
      },
    };

    if (isBankTransfer) {
      sessionParams.customer = stripeCustomerId;
      sessionParams.payment_method_types = ["customer_balance"];
      
      const btConfig = bankTransferTypeMap[stripeCurrency];
      if (btConfig) {
        const bankTransferObj: any = { type: btConfig.type };
        if (btConfig.country_key && btConfig.country) {
          bankTransferObj[btConfig.country_key] = { country: btConfig.country };
        }
        sessionParams.payment_method_options = {
          customer_balance: {
            funding_type: "bank_transfer",
            bank_transfer: bankTransferObj,
          },
        };
      }
    } else {
      // Card payment
      sessionParams.payment_method_types = ["card"];
      sessionParams.customer_email = proforma.customer_email || undefined;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

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
