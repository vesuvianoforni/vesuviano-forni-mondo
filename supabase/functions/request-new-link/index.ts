import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestNewLinkData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  oldToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerName, customerEmail, customerPhone, oldToken }: RequestNewLinkData = await req.json();

    console.log("Request new link for:", { customerName, customerEmail, customerPhone });

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update session in database
    const { data: sessionData, error: sessionError } = await supabase
      .from("configurator_sessions")
      .update({
        status: "link_renewal_requested",
        customer_info: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          renewal_requested_at: new Date().toISOString()
        }
      })
      .eq("token", oldToken)
      .select()
      .single();

    if (sessionError) {
      console.error("Error updating session:", sessionError);
    } else {
      console.log("Session updated successfully:", sessionData);
    }

    // Send email to both sales team and info email
    const emailResponse = await resend.emails.send({
      from: "Vesuviano Configuratore <noreply@vesuvianoforni.com>",
      to: ["info@vesuvianoforni.com"],
      subject: `Richiesta Rinnovo Link Configuratore - ${customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Richiesta Rinnovo Link Configuratore</h2>
          <p>Un cliente ha richiesto il rinnovo del link per il configuratore perché il precedente è scaduto.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #555; margin-top: 0;">Dati Cliente:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;"><strong>Nome:</strong> ${customerName}</li>
              <li style="margin: 10px 0;"><strong>Email:</strong> ${customerEmail}</li>
              <li style="margin: 10px 0;"><strong>Telefono:</strong> ${customerPhone}</li>
            </ul>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0;"><strong>Token Scaduto:</strong> <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px;">${oldToken}</code></p>
          </div>
          
          <p style="color: #666;">⚠️ <strong>Azione richiesta:</strong> Genera un nuovo link configuratore e contatta il cliente al più presto.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
            <p>Email automatica dal sistema Configuratore Vesuviano</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Richiesta inviata con successo. Il nostro team ti contatterà presto con un nuovo link." 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in request-new-link function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
