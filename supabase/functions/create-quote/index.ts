import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateQuoteRequest {
  oven_id: string;
  has_installation: boolean;
  has_gas: boolean;
  total_price: number;
  delivery_time_weeks: number;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  notes?: string | null;
  status: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as CreateQuoteRequest;

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data, error } = await supabaseClient
      .from("configurator_quotes")
      .insert({
        oven_id: body.oven_id,
        has_installation: body.has_installation,
        has_gas: body.has_gas,
        total_price: body.total_price,
        delivery_time_weeks: body.delivery_time_weeks,
        customer_name: body.customer_name ?? null,
        customer_email: body.customer_email ?? null,
        customer_phone: body.customer_phone ?? null,
        notes: body.notes ?? null,
        status: body.status,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating quote in create-quote:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ quote: data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Unhandled error in create-quote:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
