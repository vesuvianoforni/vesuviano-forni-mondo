import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendLinkRequest {
  customerName: string;
  customerEmail: string;
  configuratorLink: string;
  language: 'it' | 'en' | 'fr';
}

const getEmailTemplate = (name: string, link: string, language: 'it' | 'en' | 'fr') => {
  const templates = {
    it: {
      subject: 'Il tuo configuratore personalizzato Vesuviano Forni',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6B35 0%, #D32F2F 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .cta-button { display: inline-block; background: #FF6B35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
            .footer a { color: #FF6B35; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Vesuviano Forni</h1>
              <p>Forni Artigianali d'Eccellenza</p>
            </div>
            <div class="content">
              <h2>Ciao ${name},</h2>
              <p>Grazie per il tuo interesse nei nostri forni artigianali!</p>
              <p>Abbiamo preparato per te un <strong>configuratore personalizzato</strong> dove potrai:</p>
              <ul>
                <li>✨ Scegliere il modello perfetto per le tue esigenze</li>
                <li>🎨 Personalizzare colori e rivestimenti</li>
                <li>📊 Visualizzare il tuo forno con render AI</li>
                <li>💰 Ricevere un preventivo immediato</li>
              </ul>
              <p style="text-align: center;">
                <a href="${link}" class="cta-button">CONFIGURA IL TUO FORNO</a>
              </p>
              <p><strong>Il link è valido per 30 giorni</strong> e ti permetterà di salvare la tua configurazione e tornare quando vuoi.</p>
              <p>Se hai domande o necessiti di assistenza, il nostro team è a tua disposizione!</p>
              <p>Cordiali saluti,<br><strong>Il Team Vesuviano Forni</strong></p>
            </div>
            <div class="footer">
              <p><strong>Vesuviano Forni S.r.l.</strong></p>
              <p>Via Sant'Anastasia 123, Napoli, Italia</p>
              <p>📧 <a href="mailto:info@vesuvianoforni.com">info@vesuvianoforni.com</a> | 📞 +39 081 123 4567</p>
              <p>🌐 <a href="https://www.vesuvianoforni.com">www.vesuvianoforni.com</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    en: {
      subject: 'Your personalized Vesuviano Ovens configurator',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6B35 0%, #D32F2F 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .cta-button { display: inline-block; background: #FF6B35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
            .footer a { color: #FF6B35; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Vesuviano Ovens</h1>
              <p>Artisanal Ovens of Excellence</p>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Thank you for your interest in our artisanal ovens!</p>
              <p>We have prepared a <strong>personalized configurator</strong> for you where you can:</p>
              <ul>
                <li>✨ Choose the perfect model for your needs</li>
                <li>🎨 Customize colors and finishes</li>
                <li>📊 Visualize your oven with AI renders</li>
                <li>💰 Get an instant quote</li>
              </ul>
              <p style="text-align: center;">
                <a href="${link}" class="cta-button">CONFIGURE YOUR OVEN</a>
              </p>
              <p><strong>The link is valid for 30 days</strong> and will allow you to save your configuration and come back whenever you want.</p>
              <p>If you have any questions or need assistance, our team is at your disposal!</p>
              <p>Best regards,<br><strong>The Vesuviano Ovens Team</strong></p>
            </div>
            <div class="footer">
              <p><strong>Vesuviano Forni S.r.l.</strong></p>
              <p>Via Sant'Anastasia 123, Naples, Italy</p>
              <p>📧 <a href="mailto:info@vesuvianoforni.com">info@vesuvianoforni.com</a> | 📞 +39 081 123 4567</p>
              <p>🌐 <a href="https://www.vesuvianoforni.com">www.vesuvianoforni.com</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    fr: {
      subject: 'Votre configurateur personnalisé Vesuviano Fours',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6B35 0%, #D32F2F 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .cta-button { display: inline-block; background: #FF6B35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
            .footer a { color: #FF6B35; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Vesuviano Fours</h1>
              <p>Fours Artisanaux d'Excellence</p>
            </div>
            <div class="content">
              <h2>Bonjour ${name},</h2>
              <p>Merci pour votre intérêt dans nos fours artisanaux !</p>
              <p>Nous avons préparé pour vous un <strong>configurateur personnalisé</strong> où vous pourrez :</p>
              <ul>
                <li>✨ Choisir le modèle parfait pour vos besoins</li>
                <li>🎨 Personnaliser les couleurs et les revêtements</li>
                <li>📊 Visualiser votre four avec des rendus IA</li>
                <li>💰 Recevoir un devis immédiat</li>
              </ul>
              <p style="text-align: center;">
                <a href="${link}" class="cta-button">CONFIGUREZ VOTRE FOUR</a>
              </p>
              <p><strong>Le lien est valable 30 jours</strong> et vous permettra de sauvegarder votre configuration et de revenir quand vous voulez.</p>
              <p>Si vous avez des questions ou besoin d'assistance, notre équipe est à votre disposition !</p>
              <p>Cordialement,<br><strong>L'Équipe Vesuviano Fours</strong></p>
            </div>
            <div class="footer">
              <p><strong>Vesuviano Forni S.r.l.</strong></p>
              <p>Via Sant'Anastasia 123, Naples, Italie</p>
              <p>📧 <a href="mailto:info@vesuvianoforni.com">info@vesuvianoforni.com</a> | 📞 +39 081 123 4567</p>
              <p>🌐 <a href="https://www.vesuvianoforni.com">www.vesuvianoforni.com</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  };

  return templates[language];
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerName, customerEmail, configuratorLink, language }: SendLinkRequest = await req.json();

    console.log('Sending configurator link email:', { customerName, customerEmail, language });

    const template = getEmailTemplate(customerName, configuratorLink, language);

    const emailResponse = await resend.emails.send({
      from: 'Vesuviano Forni <noreply@vesuvianoforni.com>',
      to: [customerEmail],
      subject: template.subject,
      html: template.html,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in send-configurator-link function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
