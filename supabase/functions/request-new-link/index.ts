import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

    // Send email to sales team
    const emailResponse = await resend.emails.send({
      from: "Vesuviano <onboarding@resend.dev>",
      to: ["commerciale@vesuviano.it"], // Replace with actual sales team email
      subject: `Richiesta Nuovo Link Configuratore - ${customerName}`,
      html: `
        <h2>Richiesta Nuovo Link Configuratore</h2>
        <p>Un cliente ha richiesto un nuovo link per il configuratore perché il precedente è scaduto.</p>
        
        <h3>Dati Cliente:</h3>
        <ul>
          <li><strong>Nome:</strong> ${customerName}</li>
          <li><strong>Email:</strong> ${customerEmail}</li>
          <li><strong>Telefono:</strong> ${customerPhone}</li>
        </ul>
        
        <p><strong>Token Scaduto:</strong> ${oldToken}</p>
        
        <p>Per favore, genera un nuovo link e contatta il cliente al più presto.</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Richiesta inviata con successo" }),
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
