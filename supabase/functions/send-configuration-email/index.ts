import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfigurationEmailData {
  // Per email di configurazione
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  modelName?: string;
  fuelType?: string;
  diameter?: number;
  pizzaCapacity?: string;
  coating?: string;
  buildType?: string;
  deliveryOption?: string;
  ovenPrice?: number;
  shippingPrice?: number;
  onSitePrice?: number;
  totalPrice?: number;
  discountedPrice?: number;
  deliveryTimeWeeks?: number;
  priceList?: string;
  baseImageUrl?: string;
  colorRenderImageUrl?: string;
  architectAIRenderUrl?: string;
  actionType?: 'contact_request' | 'deposit_paid';
  contactMethod?: string;
  notes?: string;
  
  // Per email AI di conversione
  emailType?: 'configuration' | 'ai_sales';
  to?: string;
  subject?: string;
  message?: string;
  ovenImageUrl?: string;
  sessionId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ConfigurationEmailData = await req.json();

    console.log("Sending email, type:", data.emailType || 'configuration');

    // Se è un'email AI di conversione, usa il template specifico
    if (data.emailType === 'ai_sales') {
      const aiEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 650px; margin: 0 auto; background: white;">
            <!-- Header con logo -->
            <div style="background: linear-gradient(135deg, #8B4513 0%, #CD5C5C 100%); padding: 40px 30px; text-align: center;">
              <img src="https://www.vesuvianoforni.com/lovable-uploads/vesuviano-logo-bianco.png" alt="Vesuviano Forni" style="max-width: 200px; height: auto; margin-bottom: 15px;" />
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Vesuviano Forni</h1>
              <p style="color: #fef2f2; margin: 10px 0 0 0; font-size: 14px;">L'arte della tradizione napoletana</p>
            </div>

            <!-- Corpo del messaggio -->
            <div style="padding: 40px 30px;">
              ${data.ovenImageUrl ? `
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="${data.ovenImageUrl}" alt="Il tuo forno Vesuviano" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
              </div>
              ` : ''}
              
              <div style="color: #333; font-size: 16px; line-height: 1.8;">
                ${data.message?.replace(/\n/g, '<br/>')}
              </div>
            </div>

            <!-- Footer con contatti -->
            <div style="background: #f8f8f8; padding: 30px; border-top: 3px solid #8B4513;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #8B4513; margin: 0 0 15px 0; font-size: 18px;">Parliamone insieme</h3>
              </div>
              
              <table style="width: 100%; max-width: 500px; margin: 0 auto;">
                <tr>
                  <td style="padding: 8px 0; text-align: center;">
                    <strong style="color: #8B4513;">Bruno Nardello</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; text-align: center;">
                    <a href="https://www.vesuvianoforni.com" style="color: #2563eb; text-decoration: none;">www.vesuvianoforni.com</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; text-align: center;">
                    <a href="mailto:info@vesuvianoforni.com" style="color: #2563eb; text-decoration: none;">info@vesuvianoforni.com</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; text-align: center;">
                    <a href="https://www.vesuvianoforni.com/contatti?whatsapp=true" 
                       style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 15px;">
                      💬 Scrivimi su WhatsApp
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; text-align: center; color: #666;">
                    📱 +39 350 928 6941 (mobile)
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; text-align: center; color: #666;">
                    ☎️ 081 192 31684
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; text-align: center; color: #888; font-size: 14px;">
                    📍 Naples - Italy
                  </td>
                </tr>
              </table>
            </div>

            <!-- Footer finale -->
            <div style="background: #333; padding: 20px; text-align: center;">
              <p style="color: #fff; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} Vesuviano Forni - Forni a legna artigianali dal cuore del Vesuvio
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailResponse = await resend.emails.send({
        from: "Bruno Nardello - Vesuviano Forni <info@vesuvianoforni.com>",
        to: [data.to!],
        subject: data.subject!,
        html: aiEmailHtml,
      });

      console.log("AI Sales email sent successfully:", emailResponse);

      // Salva nella cronologia email se abbiamo un sessionId
      if (data.sessionId) {
        try {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          
          const { error: historyError } = await supabase
            .from('email_history')
            .insert({
              session_id: data.sessionId,
              email_type: 'ai_sales',
              subject: data.subject!,
              body: data.message!,
              sent_to: data.to!,
              sent_from: 'info@vesuvianoforni.com',
              metadata: {
                ovenImageUrl: data.ovenImageUrl,
                resendEmailId: emailResponse.data?.id
              }
            });
          
          if (historyError) {
            console.error("Error saving email history:", historyError);
          } else {
            console.log("Email history saved successfully");
          }
        } catch (historyErr) {
          console.error("Error saving email history:", historyErr);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email inviata con successo",
          emailId: emailResponse.data?.id 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Altrimenti procedi con l'email di configurazione normale
    console.log("Sending configuration email for:", data.customerName);

    // Determina il titolo in base al tipo di azione
    const emailSubject = data.actionType === 'deposit_paid' 
      ? `🔥 ACCONTO PAGATO - Nuova Configurazione da ${data.customerName}`
      : `💬 RICHIESTA CONTATTO - Nuova Configurazione da ${data.customerName}`;

    const actionBadge = data.actionType === 'deposit_paid'
      ? '<div style="display: inline-block; background: #16a34a; color: white; padding: 8px 16px; border-radius: 6px; font-weight: bold; margin-bottom: 20px;">✅ ACCONTO 1% PAGATO</div>'
      : '<div style="display: inline-block; background: #2563eb; color: white; padding: 8px 16px; border-radius: 6px; font-weight: bold; margin-bottom: 20px;">💬 RICHIESTA CONTATTO</div>';

    const contactMethodText = data.contactMethod 
      ? `<p style="margin: 5px 0;"><strong>Metodo di Contatto Preferito:</strong> ${data.contactMethod === 'whatsapp' ? 'WhatsApp' : 'Chiamata Telefonica'}</p>`
      : '';

    // Costruisci la sezione immagini
    let imagesSection = `
      <div style="margin: 30px 0;">
        <h3 style="color: #1f2937; margin-bottom: 15px;">📷 Immagini Configurazione</h3>
        <div style="display: grid; gap: 20px;">
          <div style="text-align: center;">
            <p style="font-weight: bold; margin-bottom: 10px;">Forno Base</p>
            <img src="${data.baseImageUrl}" alt="Forno base" style="max-width: 100%; height: auto; border-radius: 8px; border: 2px solid #e5e7eb;" />
          </div>
    `;

    if (data.colorRenderImageUrl) {
      imagesSection += `
          <div style="text-align: center;">
            <p style="font-weight: bold; margin-bottom: 10px;">🎨 Colore Personalizzato</p>
            <img src="${data.colorRenderImageUrl}" alt="Render colore personalizzato" style="max-width: 100%; height: auto; border-radius: 8px; border: 2px solid #e5e7eb;" />
          </div>
      `;
    }

    if (data.architectAIRenderUrl) {
      imagesSection += `
          <div style="text-align: center;">
            <p style="font-weight: bold; margin-bottom: 10px;">🏠 Architetto AI - Visualizzazione nello Spazio</p>
            <img src="${data.architectAIRenderUrl}" alt="Render Architetto AI" style="max-width: 100%; height: auto; border-radius: 8px; border: 2px solid #e5e7eb;" />
          </div>
      `;
    }

    imagesSection += `
        </div>
      </div>
    `;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔥 Vesuviano Forni</h1>
          <p style="color: #fef2f2; margin: 10px 0 0 0; font-size: 16px;">Nuova Configurazione Cliente</p>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          ${actionBadge}

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 15px; font-size: 20px;">👤 Dati Cliente</h2>
            <p style="margin: 5px 0;"><strong>Nome:</strong> ${data.customerName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${data.customerEmail}" style="color: #2563eb;">${data.customerEmail}</a></p>
            <p style="margin: 5px 0;"><strong>Telefono:</strong> <a href="tel:${data.customerPhone}" style="color: #2563eb;">${data.customerPhone}</a></p>
            ${contactMethodText}
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
            <h2 style="color: #78350f; margin-top: 0; margin-bottom: 15px; font-size: 20px;">🍕 Configurazione Forno</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #fde68a;">
                <td style="padding: 8px 0;"><strong>Modello:</strong></td>
                <td style="padding: 8px 0;">${data.modelName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #fde68a;">
                <td style="padding: 8px 0;"><strong>Alimentazione:</strong></td>
                <td style="padding: 8px 0;">${data.fuelType}</td>
              </tr>
              <tr style="border-bottom: 1px solid #fde68a;">
                <td style="padding: 8px 0;"><strong>Diametro:</strong></td>
                <td style="padding: 8px 0;">${data.diameter}cm</td>
              </tr>
              <tr style="border-bottom: 1px solid #fde68a;">
                <td style="padding: 8px 0;"><strong>Capacità:</strong></td>
                <td style="padding: 8px 0;">${data.pizzaCapacity}</td>
              </tr>
              <tr style="border-bottom: 1px solid #fde68a;">
                <td style="padding: 8px 0;"><strong>Rivestimento:</strong></td>
                <td style="padding: 8px 0;">${data.coating}</td>
              </tr>
              <tr style="border-bottom: 1px solid #fde68a;">
                <td style="padding: 8px 0;"><strong>Tipologia:</strong></td>
                <td style="padding: 8px 0;">${data.buildType === 'on_site' ? 'Costruito sul Posto' : 'Pronto all\'Uso'}</td>
              </tr>
              ${data.deliveryOption === 'shipping' ? `
              <tr style="border-bottom: 1px solid #fde68a;">
                <td style="padding: 8px 0;"><strong>Consegna:</strong></td>
                <td style="padding: 8px 0;">Spedizione in Europa</td>
              </tr>
              ` : ''}
              <tr style="border-bottom: 1px solid #fde68a;">
                <td style="padding: 8px 0;"><strong>Tempo di Consegna:</strong></td>
                <td style="padding: 8px 0;">${data.deliveryTimeWeeks} settimane</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Listino:</strong></td>
                <td style="padding: 8px 0;">Lista ${data.priceList}</td>
              </tr>
            </table>
            ${data.notes ? `
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #fde68a;">
              <p style="margin: 0;"><strong>Note:</strong></p>
              <p style="margin: 5px 0; font-style: italic;">${data.notes}</p>
            </div>
            ` : ''}
          </div>

          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin-bottom: 25px;">
            <h2 style="color: #1e40af; margin-top: 0; margin-bottom: 15px; font-size: 20px;">💰 Dettaglio Prezzi</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #bfdbfe;">
                <td style="padding: 8px 0;">Prezzo Forno:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">€${data.ovenPrice.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              ${data.shippingPrice ? `
              <tr style="border-bottom: 1px solid #bfdbfe;">
                <td style="padding: 8px 0;">Spedizione:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">€${data.shippingPrice.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              ` : ''}
              ${data.onSitePrice ? `
              <tr style="border-bottom: 1px solid #bfdbfe;">
                <td style="padding: 8px 0;">Costruzione sul Posto:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">€${data.onSitePrice.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              ` : ''}
              <tr style="border-bottom: 2px solid #2563eb;">
                <td style="padding: 8px 0;"><strong>Totale:</strong></td>
                <td style="padding: 8px 0; text-align: right; font-size: 18px; color: #1e40af;"><strong>€${data.totalPrice.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
              </tr>
              <tr style="background: #dcfce7;">
                <td style="padding: 8px 0; color: #166534;"><strong>🎉 Sconto 5% (prenotazione immediata):</strong></td>
                <td style="padding: 8px 0; text-align: right; font-size: 20px; color: #166534;"><strong>€${data.discountedPrice.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
              </tr>
            </table>
            <div style="margin-top: 15px; padding: 12px; background: white; border-radius: 6px; border: 1px solid #bfdbfe;">
              <p style="margin: 0; font-size: 14px; color: #1e40af;">
                <strong>💳 Accordi di Pagamento:</strong><br/>
                50% acconto alla conferma dell'ordine<br/>
                50% saldo al completamento del forno
              </p>
            </div>
          </div>

          ${imagesSection}

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 25px; text-align: center;">
            <h3 style="color: #1f2937; margin-top: 0;">📞 Contatti Vesuviano</h3>
            <p style="margin: 5px 0;">
              <strong>Email:</strong> <a href="mailto:info@vesuvianoforni.com" style="color: #2563eb;">info@vesuvianoforni.com</a><br/>
              <strong>Telefono:</strong> <a href="tel:+393509286941" style="color: #2563eb;">+39 350 928 6941</a><br/>
              <strong>Website:</strong> <a href="https://www.vesuvianoforni.com" style="color: #2563eb;">www.vesuvianoforni.com</a>
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Email automatica generata dal configuratore Vesuviano</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Vesuviano Configuratore <noreply@vesuvianoforni.com>",
      to: ["info@vesuvianoforni.com"],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log("Configuration email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email inviata con successo",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-configuration-email function:", error);
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
