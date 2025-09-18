import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

interface ConsultationFormData {
  name: string
  email: string
  phone: string
  company: string
  country: string
  ovenType: string
  capacity: string
  budget: string
  message: string
  services: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData: ConsultationFormData = await req.json()

    console.log('Processing consultation request for:', formData.email)

    // Email di conferma per il cliente
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Conferma Richiesta Consulenza - Vesuviano</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background-color: #f8f9fa;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 10px; 
              overflow: hidden; 
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #d97706 0%, #ea580c 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .logo { 
              width: 150px; 
              height: auto; 
              margin-bottom: 20px; 
            }
            .content { 
              padding: 40px 30px; 
            }
            .highlight { 
              background: #fef3c7; 
              border-left: 4px solid #f59e0b; 
              padding: 20px; 
              margin: 20px 0; 
              border-radius: 0 8px 8px 0;
            }
            .info-section { 
              background: #f8fafc; 
              padding: 25px; 
              border-radius: 8px; 
              margin: 25px 0; 
            }
            .info-item { 
              margin: 12px 0; 
              display: flex; 
              align-items: center; 
            }
            .info-label { 
              font-weight: 600; 
              color: #374151; 
              min-width: 120px; 
            }
            .footer { 
              background: #1f2937; 
              color: white; 
              padding: 30px; 
              text-align: center; 
            }
            .contact-info { 
              display: flex; 
              justify-content: space-around; 
              flex-wrap: wrap; 
              margin-top: 20px; 
            }
            .contact-item { 
              margin: 10px; 
            }
            .btn { 
              display: inline-block; 
              background: #d97706; 
              color: white; 
              padding: 12px 25px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 15px 10px; 
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/oven-gallery/vesuviano-logo-bianco.png" alt="Vesuviano Logo" class="logo">
              <h1 style="margin: 0; font-size: 28px;">Grazie per la tua richiesta!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">La tua consulenza gratuita è stata ricevuta</p>
            </div>
            
            <div class="content">
              <p>Ciao <strong>${formData.name}</strong>,</p>
              
              <p>Abbiamo ricevuto la tua richiesta di consulenza per un forno professionale. I nostri esperti ti contatteranno <strong>entro 24 ore</strong> per fornirti una consulenza personalizzata completamente gratuita.</p>
              
              <div class="highlight">
                <h3 style="margin-top: 0; color: #d97706;">🔥 Cosa succederà dopo:</h3>
                <ul style="margin: 10px 0;">
                  <li>Un nostro esperto analizzerà le tue esigenze specifiche</li>
                  <li>Ti proporremo la soluzione ottimale per il tuo progetto</li>
                  <li>Riceverai un preventivo dettagliato e personalizzato</li>
                  <li>Ti assisteremo dalla progettazione alla consegna internazionale</li>
                </ul>
              </div>

              <div class="info-section">
                <h3 style="margin-top: 0; color: #374151;">Riepilogo della tua richiesta:</h3>
                ${formData.ovenType ? `<div class="info-item"><span class="info-label">Tipo di Forno:</span> <span>${formData.ovenType}</span></div>` : ''}
                ${formData.capacity ? `<div class="info-item"><span class="info-label">Capacità:</span> <span>${formData.capacity}</span></div>` : ''}
                ${formData.budget ? `<div class="info-item"><span class="info-label">Budget:</span> <span>${formData.budget}</span></div>` : ''}
                ${formData.country ? `<div class="info-item"><span class="info-label">Destinazione:</span> <span>${formData.country}</span></div>` : ''}
                ${formData.company ? `<div class="info-item"><span class="info-label">Azienda:</span> <span>${formData.company}</span></div>` : ''}
              </div>

              <p>Nel frattempo, puoi esplorare i nostri forni e soluzioni sul nostro sito web:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://vesuvianoforni.com" class="btn">Esplora i Nostri Forni</a>
                <a href="https://vesuvianoforni.com/catalogo" class="btn" style="background: #059669;">Scarica il Catalogo</a>
              </div>
            </div>

            <div class="footer">
              <h3 style="margin: 0 0 20px 0;">I Nostri Contatti</h3>
              <div class="contact-info">
                <div class="contact-item">
                  <strong>📞 Telefono</strong><br>
                  +39 081 123 4567
                </div>
                <div class="contact-item">
                  <strong>✉️ Email</strong><br>
                  info@vesuvianoforni.com
                </div>
                <div class="contact-item">
                  <strong>📍 Laboratorio</strong><br>
                  Napoli, Italia
                </div>
              </div>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #4b5563;">
                <p style="margin: 0; opacity: 0.8;">© 2024 Vesuviano - Forni Professionali Artigianali</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.7;">Tradizione, qualità e innovazione dal cuore di Napoli</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Email di notifica per l'azienda
    const companyEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Nuova Richiesta Consulenza - Vesuviano</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #d97706; color: white; padding: 20px; border-radius: 8px; }
            .content { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; }
            .field { margin: 15px 0; padding: 10px; background: white; border-radius: 4px; }
            .label { font-weight: bold; color: #d97706; }
            .priority { background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔔 Nuova Richiesta di Consulenza</h2>
              <p>Ricevuta il ${new Date().toLocaleString('it-IT')}</p>
            </div>
            
            <div class="priority">
              <strong>⚡ AZIONE RICHIESTA:</strong> Contattare entro 24 ore per consulenza gratuita
            </div>

            <div class="content">
              <div class="field">
                <div class="label">Nome Completo:</div>
                ${formData.name}
              </div>
              
              <div class="field">
                <div class="label">Email:</div>
                <a href="mailto:${formData.email}">${formData.email}</a>
              </div>
              
              ${formData.phone ? `
              <div class="field">
                <div class="label">Telefono:</div>
                <a href="tel:${formData.phone}">${formData.phone}</a>
              </div>
              ` : ''}
              
              ${formData.company ? `
              <div class="field">
                <div class="label">Azienda/Ristorante:</div>
                ${formData.company}
              </div>
              ` : ''}
              
              ${formData.country ? `
              <div class="field">
                <div class="label">Paese di Destinazione:</div>
                ${formData.country}
              </div>
              ` : ''}
              
              ${formData.ovenType ? `
              <div class="field">
                <div class="label">Tipo di Forno Richiesto:</div>
                ${formData.ovenType}
              </div>
              ` : ''}
              
              ${formData.capacity ? `
              <div class="field">
                <div class="label">Capacità Richiesta:</div>
                ${formData.capacity}
              </div>
              ` : ''}
              
              ${formData.budget ? `
              <div class="field">
                <div class="label">Budget Orientativo:</div>
                ${formData.budget}
              </div>
              ` : ''}

              ${formData.services?.length > 0 ? `
              <div class="field">
                <div class="label">Servizi Richiesti:</div>
                <ul>
                  ${formData.services.map(service => {
                    const serviceLabels: Record<string, string> = {
                      'identification': 'Identificazione migliore soluzione',
                      'quotation': 'Quotazione personalizzata',
                      'rendering': 'Rendering 3D alta fedeltà',
                      'logistics': 'Organizzazione logistica e export'
                    }
                    return `<li>${serviceLabels[service] || service}</li>`
                  }).join('')}
                </ul>
              </div>
              ` : ''}
              
              ${formData.message ? `
              <div class="field">
                <div class="label">Messaggio:</div>
                <div style="background: white; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${formData.message}</div>
              </div>
              ` : ''}
            </div>
          </div>
        </body>
      </html>
    `

    // Invia email al cliente
    const customerEmailResult = await resend.emails.send({
      from: 'Vesuviano Forni <noreply@vesuvianoforni.com>',
      to: [formData.email],
      subject: '🔥 Conferma richiesta consulenza gratuita - Vesuviano Forni',
      html: customerEmailHtml,
    })

    console.log('Customer email sent:', customerEmailResult)

    // Invia email all'azienda
    const companyEmailResult = await resend.emails.send({
      from: 'Sistema Consulenze <system@vesuvianoforni.com>',
      to: ['info@vesuvianoforni.com'], // Email aziendale principale
      subject: `🔔 Nuova Consulenza: ${formData.name} - ${formData.ovenType || 'Tipo non specificato'}`,
      html: companyEmailHtml,
    })

    console.log('Company notification email sent:', companyEmailResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Emails sent successfully',
        customerEmailId: customerEmailResult.data?.id,
        companyEmailId: companyEmailResult.data?.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in send-consultation-email function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to send emails',
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})