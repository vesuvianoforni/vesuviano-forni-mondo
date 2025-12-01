import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfigurationEmailData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  modelName: string;
  fuelType: string;
  diameter: number;
  pizzaCapacity: string;
  coating: string;
  buildType: string;
  deliveryOption?: string;
  ovenPrice: number;
  shippingPrice?: number;
  onSitePrice?: number;
  totalPrice: number;
  discountedPrice: number;
  deliveryTimeWeeks: number;
  priceList: string;
  baseImageUrl: string;
  colorRenderImageUrl?: string;
  architectAIRenderUrl?: string;
  actionType: 'contact_request' | 'deposit_paid';
  contactMethod?: string;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ConfigurationEmailData = await req.json();

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

    console.log("Email sent successfully:", emailResponse);

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
