import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Eliminazione Sebastian duplicato in corso...");
    
    const { error } = await supabase
      .from("configurator_ovens")
      .delete()
      .eq("id", "325b3d1b-37a4-4f2c-90e9-2c41a8970533");

    if (error) {
      console.error("Errore eliminazione:", error);
      throw error;
    }

    console.log("Sebastian duplicato eliminato con successo");
    
    return new Response(
      JSON.stringify({ success: true, message: "Sebastian duplicato eliminato" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Errore catch:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
