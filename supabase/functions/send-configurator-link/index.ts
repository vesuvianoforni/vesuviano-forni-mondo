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
  const logoUrl = 'https://www.vesuvianoforni.com/lovable-uploads/vesuviano-logo-bianco.png';
  
  const templates = {
    it: {
      subject: 'Il tuo configuratore personalizzato Vesuviano Forni',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #ffffff;
            }
            .header { 
              background: linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #CD5C5C 100%);
              color: white; 
              padding: 40px 30px; 
              text-align: center;
            }
            .header img {
              max-width: 200px;
              height: auto;
              margin-bottom: 10px;
            }
            .header h1 {
              margin: 10px 0 5px 0;
              font-size: 24px;
              font-weight: bold;
            }
            .header p {
              margin: 0;
              font-size: 14px;
              opacity: 0.95;
            }
            .content { 
              background: #f5f5f5; 
              padding: 40px 30px;
            }
            .intro-box {
              background: #fff;
              border-left: 4px solid #8B4513;
              padding: 15px;
              margin-bottom: 25px;
              border-radius: 4px;
            }
            .intro-box p {
              margin: 0;
              font-size: 14px;
              color: #666;
            }
            h2 {
              color: #8B4513;
              margin-top: 0;
              margin-bottom: 20px;
            }
            ul {
              padding-left: 20px;
              margin: 20px 0;
            }
            li {
              margin: 10px 0;
              color: #333;
            }
            .cta-button { 
              display: inline-block; 
              background: linear-gradient(135deg, #8B4513 0%, #CD5C5C 100%);
              color: white !important; 
              padding: 16px 40px; 
              text-decoration: none; 
              border-radius: 6px; 
              font-weight: bold; 
              margin: 25px 0;
              box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
            }
            .cta-button:hover {
              box-shadow: 0 6px 16px rgba(139, 69, 19, 0.4);
            }
            .warning-box {
              background: #fff3cd;
              border: 1px solid #ffc107;
              border-radius: 6px;
              padding: 15px;
              margin: 20px 0;
            }
            .warning-box strong {
              color: #856404;
            }
            .footer { 
              background: #2c2c2c; 
              color: #999; 
              padding: 30px; 
              text-align: center; 
              font-size: 13px;
            }
            .footer strong {
              color: #fff;
              font-size: 15px;
            }
            .footer a { 
              color: #CD5C5C; 
              text-decoration: none; 
            }
            .footer p {
              margin: 8px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="Vesuviano Forni Logo" />
              <h1>Vesuviano Forni</h1>
              <p>Forni Artigianali d'Eccellenza dal Vesuvio</p>
            </div>
            <div class="content">
              <div class="intro-box">
                <p><strong>📢 Perché ricevi questa email?</strong><br>
                Hai compilato il nostro form per ricevere informazioni sui nostri forni a legna, a gas ed elettrici, realizzati artigianalmente nel Vesuviano, a Napoli!</p>
              </div>

              <h2>Ciao ${name},</h2>
              <p>Grazie per il tuo interesse nei nostri forni artigianali!</p>
              <p>Abbiamo preparato per te un <strong>configuratore personalizzato</strong> dove potrai:</p>
              <ul>
                <li>🔥 Scegliere il modello perfetto per le tue esigenze</li>
                <li>🎨 Personalizzare colori e rivestimenti</li>
                <li>📊 Visualizzare il tuo forno con render AI</li>
                <li>💰 Ricevere un preventivo immediato</li>
              </ul>
              <div style="text-align: center;">
                <a href="${link}" class="cta-button">CONFIGURA IL TUO FORNO</a>
              </div>
              
              <div class="warning-box">
                <strong>⚠️ Importante:</strong> Il link è valido per una singola sessione. Dopo averlo visualizzato, se necessiti di un nuovo accesso, dovrai richiedere un nuovo link al nostro team commerciale.
              </div>

              <p>Tutte le tue scelte verranno salvate automaticamente durante la configurazione.</p>
              <p><strong>Hai bisogno di assistenza?</strong><br>
              Il nostro team è a tua disposizione per qualsiasi domanda.</p>
              <p>Ti aspettiamo per realizzare insieme il forno perfetto per te!</p>
              <p style="margin-top: 30px;">
                Cordiali saluti,<br>
                <strong>Il Team Vesuviano Forni</strong>
              </p>
            </div>
            <div class="footer">
              <p><strong>Vesuviano Forni</strong></p>
              <p>Forni Artigianali dal Vesuvio</p>
              <p>Via Sant'Anastasia 123, Napoli, Italia</p>
              <p>📧 <a href="mailto:info@vesuvianoforni.com">info@vesuvianoforni.com</a> | 📞 <a href="tel:+390811234567">+39 081 123 4567</a></p>
              <p style="margin-top: 15px;">🌐 <a href="https://www.vesuvianoforni.com">www.vesuvianoforni.com</a></p>
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
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #ffffff;
            }
            .header { 
              background: linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #CD5C5C 100%);
              color: white; 
              padding: 40px 30px; 
              text-align: center;
            }
            .header img {
              max-width: 200px;
              height: auto;
              margin-bottom: 10px;
            }
            .header h1 {
              margin: 10px 0 5px 0;
              font-size: 24px;
              font-weight: bold;
            }
            .header p {
              margin: 0;
              font-size: 14px;
              opacity: 0.95;
            }
            .content { 
              background: #f5f5f5; 
              padding: 40px 30px;
            }
            .intro-box {
              background: #fff;
              border-left: 4px solid #8B4513;
              padding: 15px;
              margin-bottom: 25px;
              border-radius: 4px;
            }
            .intro-box p {
              margin: 0;
              font-size: 14px;
              color: #666;
            }
            h2 {
              color: #8B4513;
              margin-top: 0;
              margin-bottom: 20px;
            }
            ul {
              padding-left: 20px;
              margin: 20px 0;
            }
            li {
              margin: 10px 0;
              color: #333;
            }
            .cta-button { 
              display: inline-block; 
              background: linear-gradient(135deg, #8B4513 0%, #CD5C5C 100%);
              color: white !important; 
              padding: 16px 40px; 
              text-decoration: none; 
              border-radius: 6px; 
              font-weight: bold; 
              margin: 25px 0;
              box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
            }
            .cta-button:hover {
              box-shadow: 0 6px 16px rgba(139, 69, 19, 0.4);
            }
            .warning-box {
              background: #fff3cd;
              border: 1px solid #ffc107;
              border-radius: 6px;
              padding: 15px;
              margin: 20px 0;
            }
            .warning-box strong {
              color: #856404;
            }
            .footer { 
              background: #2c2c2c; 
              color: #999; 
              padding: 30px; 
              text-align: center; 
              font-size: 13px;
            }
            .footer strong {
              color: #fff;
              font-size: 15px;
            }
            .footer a { 
              color: #CD5C5C; 
              text-decoration: none; 
            }
            .footer p {
              margin: 8px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="Vesuviano Ovens Logo" />
              <h1>Vesuviano Ovens</h1>
              <p>Artisanal Ovens of Excellence from Vesuvius</p>
            </div>
            <div class="content">
              <div class="intro-box">
                <p><strong>📢 Why are you receiving this email?</strong><br>
                You filled out our form to receive information about our wood-fired, gas, and electric ovens, handcrafted in the Vesuvius area, Naples!</p>
              </div>

              <h2>Hello ${name},</h2>
              <p>Thank you for your interest in our artisanal ovens!</p>
              <p>We have prepared a <strong>personalized configurator</strong> for you where you can:</p>
              <ul>
                <li>🔥 Choose the perfect model for your needs</li>
                <li>🎨 Customize colors and finishes</li>
                <li>📊 Visualize your oven with AI renders</li>
                <li>💰 Get an instant quote</li>
              </ul>
              <div style="text-align: center;">
                <a href="${link}" class="cta-button">CONFIGURE YOUR OVEN</a>
              </div>
              
              <div class="warning-box">
                <strong>⚠️ Important:</strong> This link is valid for a single session only. After viewing it, if you need new access, you'll need to request a new link from our sales team.
              </div>

              <p>All your choices will be saved automatically during configuration.</p>
              <p><strong>Need assistance?</strong><br>
              Our team is at your disposal for any questions.</p>
              <p>We look forward to creating the perfect oven for you!</p>
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The Vesuviano Ovens Team</strong>
              </p>
            </div>
            <div class="footer">
              <p><strong>Vesuviano Forni</strong></p>
              <p>Artisanal Ovens from Vesuvius</p>
              <p>Via Sant'Anastasia 123, Naples, Italy</p>
              <p>📧 <a href="mailto:info@vesuvianoforni.com">info@vesuvianoforni.com</a> | 📞 <a href="tel:+390811234567">+39 081 123 4567</a></p>
              <p style="margin-top: 15px;">🌐 <a href="https://www.vesuvianoforni.com">www.vesuvianoforni.com</a></p>
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
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #ffffff;
            }
            .header { 
              background: linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #CD5C5C 100%);
              color: white; 
              padding: 40px 30px; 
              text-align: center;
            }
            .header img {
              max-width: 200px;
              height: auto;
              margin-bottom: 10px;
            }
            .header h1 {
              margin: 10px 0 5px 0;
              font-size: 24px;
              font-weight: bold;
            }
            .header p {
              margin: 0;
              font-size: 14px;
              opacity: 0.95;
            }
            .content { 
              background: #f5f5f5; 
              padding: 40px 30px;
            }
            .intro-box {
              background: #fff;
              border-left: 4px solid #8B4513;
              padding: 15px;
              margin-bottom: 25px;
              border-radius: 4px;
            }
            .intro-box p {
              margin: 0;
              font-size: 14px;
              color: #666;
            }
            h2 {
              color: #8B4513;
              margin-top: 0;
              margin-bottom: 20px;
            }
            ul {
              padding-left: 20px;
              margin: 20px 0;
            }
            li {
              margin: 10px 0;
              color: #333;
            }
            .cta-button { 
              display: inline-block; 
              background: linear-gradient(135deg, #8B4513 0%, #CD5C5C 100%);
              color: white !important; 
              padding: 16px 40px; 
              text-decoration: none; 
              border-radius: 6px; 
              font-weight: bold; 
              margin: 25px 0;
              box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
            }
            .cta-button:hover {
              box-shadow: 0 6px 16px rgba(139, 69, 19, 0.4);
            }
            .warning-box {
              background: #fff3cd;
              border: 1px solid #ffc107;
              border-radius: 6px;
              padding: 15px;
              margin: 20px 0;
            }
            .warning-box strong {
              color: #856404;
            }
            .footer { 
              background: #2c2c2c; 
              color: #999; 
              padding: 30px; 
              text-align: center; 
              font-size: 13px;
            }
            .footer strong {
              color: #fff;
              font-size: 15px;
            }
            .footer a { 
              color: #CD5C5C; 
              text-decoration: none; 
            }
            .footer p {
              margin: 8px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="Vesuviano Fours Logo" />
              <h1>Vesuviano Fours</h1>
              <p>Fours Artisanaux d'Excellence du Vésuve</p>
            </div>
            <div class="content">
              <div class="intro-box">
                <p><strong>📢 Pourquoi recevez-vous cet email ?</strong><br>
                Vous avez rempli notre formulaire pour recevoir des informations sur nos fours à bois, à gaz et électriques, fabriqués artisanalement dans la région du Vésuve, à Naples !</p>
              </div>

              <h2>Bonjour ${name},</h2>
              <p>Merci pour votre intérêt dans nos fours artisanaux !</p>
              <p>Nous avons préparé pour vous un <strong>configurateur personnalisé</strong> où vous pourrez :</p>
              <ul>
                <li>🔥 Choisir le modèle parfait pour vos besoins</li>
                <li>🎨 Personnaliser les couleurs et les revêtements</li>
                <li>📊 Visualiser votre four avec des rendus IA</li>
                <li>💰 Recevoir un devis immédiat</li>
              </ul>
              <div style="text-align: center;">
                <a href="${link}" class="cta-button">CONFIGUREZ VOTRE FOUR</a>
              </div>
              
              <div class="warning-box">
                <strong>⚠️ Important :</strong> Le lien est valable pour une seule session. Après l'avoir consulté, si vous avez besoin d'un nouvel accès, vous devrez demander un nouveau lien à notre équipe commerciale.
              </div>

              <p>Tous vos choix seront sauvegardés automatiquement pendant la configuration.</p>
              <p><strong>Besoin d'assistance ?</strong><br>
              Notre équipe est à votre disposition pour toutes questions.</p>
              <p>Nous attendons de créer ensemble le four parfait pour vous !</p>
              <p style="margin-top: 30px;">
                Cordialement,<br>
                <strong>L'Équipe Vesuviano Fours</strong>
              </p>
            </div>
            <div class="footer">
              <p><strong>Vesuviano Forni</strong></p>
              <p>Fours Artisanaux du Vésuve</p>
              <p>Via Sant'Anastasia 123, Naples, Italie</p>
              <p>📧 <a href="mailto:info@vesuvianoforni.com">info@vesuvianoforni.com</a> | 📞 <a href="tel:+390811234567">+39 081 123 4567</a></p>
              <p style="margin-top: 15px;">🌐 <a href="https://www.vesuvianoforni.com">www.vesuvianoforni.com</a></p>
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
