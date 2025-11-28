import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendLinkRequest {
  customerName: string;
  customerEmail: string;
  configuratorLink: string;
  priceList: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerName, customerEmail, configuratorLink, priceList }: SendLinkRequest = await req.json();

    console.log('Sending configurator link email to:', customerEmail);

    const emailResponse = await resend.emails.send({
      from: "Vesuviano Forni <onboarding@resend.dev>",
      to: [customerEmail],
      subject: "Il tuo link personale per configurare il tuo forno Vesuviano",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background: #ffffff;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
                border-radius: 0 0 8px 8px;
              }
              .button {
                display: inline-block;
                background: #dc2626;
                color: white;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
              }
              .info-box {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                color: #6b7280;
                font-size: 12px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">Vesuviano Forni</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">I Migliori Forni Artigianali Italiani</p>
            </div>
            
            <div class="content">
              <h2>Ciao ${customerName},</h2>
              
              <p>Siamo felici di condividere con te il tuo <strong>link personale</strong> per configurare il forno dei tuoi sogni.</p>
              
              <p>Con il nostro configuratore interattivo potrai:</p>
              <ul>
                <li>✨ Scegliere il modello perfetto per le tue esigenze</li>
                <li>🎨 Personalizzare colori e rivestimenti</li>
                <li>📐 Selezionare le dimensioni ideali</li>
                <li>💰 Visualizzare il preventivo in tempo reale</li>
                <li>🏠 Vedere il forno nel tuo spazio con l'Architetto AI</li>
              </ul>

              <div style="text-align: center;">
                <a href="${configuratorLink}" class="button">
                  🔥 Configura il Tuo Forno
                </a>
              </div>

              <div class="info-box">
                <strong>Listino prezzi applicato:</strong> Listino ${priceList}<br>
                <strong>Il tuo link personale:</strong><br>
                <a href="${configuratorLink}" style="word-break: break-all; color: #dc2626;">${configuratorLink}</a>
              </div>

              <p>Il link è personale e puoi utilizzarlo ogni volta che vuoi per continuare la tua configurazione. Tutte le tue scelte verranno salvate automaticamente.</p>

              <p><strong>Hai bisogno di assistenza?</strong><br>
              Il nostro team è a tua disposizione per qualsiasi domanda. Contattaci via WhatsApp o telefono.</p>

              <p>Ti aspettiamo per realizzare insieme il forno perfetto per te!</p>

              <p style="margin-top: 30px;">
                A presto,<br>
                <strong>Il Team Vesuviano Forni</strong>
              </p>
            </div>

            <div class="footer">
              <p>Vesuviano Forni - Tradizione Artigianale dal Vesuvio<br>
              Sant'Anastasia (NA) - Italia<br>
              <a href="https://www.vesuvianoforni.com" style="color: #dc2626;">www.vesuvianoforni.com</a></p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error sending configurator link email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send email" 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
