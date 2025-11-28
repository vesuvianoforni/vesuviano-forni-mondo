import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Payment not completed" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Get quote ID from metadata
    const quoteId = session.metadata?.quoteId;

    if (!quoteId) {
      throw new Error("Quote ID not found in session metadata");
    }

    // Update the quote in Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: quote, error } = await supabaseClient
      .from("configurator_quotes")
      .update({
        payment_completed: true,
        stripe_session_id: sessionId,
        status: "paid",
      })
      .eq("id", quoteId)
      .select()
      .single();

    if (error) {
      console.error("Error updating quote:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        quote,
        session: {
          amount_total: session.amount_total,
          currency: session.currency,
          customer_email: session.customer_details?.email,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in verify-payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
