import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

interface FormData {
  formType: string
  data: Record<string, any>
  imageUrl?: string // Aggiungo l'URL dell'immagine opzionale
}

// Funzione per convertire data URL in attachment
function dataUrlToAttachment(dataUrl: string, filename: string) {
  const [header, base64Data] = dataUrl.split(',')
  const mimeMatch = header.match(/data:([^;]+)/)
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg'
  
  return {
    filename: filename,
    content: base64Data,
    content_type: mimeType
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { formType, data, imageUrl }: FormData = await req.json()

    console.log(`Processing ${formType} form submission:`, data)

    // Create email content based on form type
    let subject = ''
    let emailContent = ''

    switch (formType) {
      case 'vesuvio-buono':
        subject = `📥 Download Catalogo VesuvioBuono - ${data.firstName} ${data.lastName}`
        emailContent = `
          <h2>🔔 Nuovo Download Catalogo VesuvioBuono</h2>
          <p><strong>Data:</strong> ${new Date().toLocaleString('it-IT')}</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Dati Cliente:</h3>
            <p><strong>Nome:</strong> ${data.firstName}</p>
            <p><strong>Cognome:</strong> ${data.lastName}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            <p><strong>Città:</strong> ${data.city}</p>
            <p><strong>Telefono:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>
          </div>
          
          <p><em>Il cliente ha scaricato il catalogo del VesuvioBuono zero emissioni.</em></p>
        `
        break

      case 'download-modal':
        subject = `📥 Download Immagine - ${data.firstName} ${data.lastName}`
        emailContent = `
          <h2>🔔 Nuovo Download Immagine</h2>
          <p><strong>Data:</strong> ${new Date().toLocaleString('it-IT')}</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Dati Cliente:</h3>
            <p><strong>Nome:</strong> ${data.firstName}</p>
            <p><strong>Cognome:</strong> ${data.lastName}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            <p><strong>Città:</strong> ${data.city}</p>
            <p><strong>Telefono:</strong> ${data.phone}</p>
            ${data.company ? `<p><strong>Azienda:</strong> ${data.company}</p>` : ''}
            ${data.website ? `<p><strong>Sito Web:</strong> <a href="${data.website}">${data.website}</a></p>` : ''}
          </div>
          
          <p><em>Il cliente ha scaricato un'immagine generata dal sistema.</em></p>
        `
        break

      case 'ar-contact':
        subject = `📱 Richiesta Contatto AR - ${data.firstName} ${data.lastName}`
        emailContent = `
          <h2>🔔 Richiesta Contatto da AR Visualizer</h2>
          <p><strong>Data:</strong> ${new Date().toLocaleString('it-IT')}</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Dati Cliente:</h3>
            <p><strong>Nome:</strong> ${data.firstName}</p>
            <p><strong>Cognome:</strong> ${data.lastName}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            <p><strong>Telefono:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <strong>⚡ AZIONE RICHIESTA:</strong> Il cliente vuole essere contattato per maggiori informazioni sui forni.
          </div>
          
          <p><em>Il cliente ha utilizzato l'AR Visualizer e richiede di essere contattato.</em></p>
        `
        break

      case 'datasheet-download':
        subject = `📥 Richiesta Scheda Tecnica - ${data.firstName} ${data.lastName} (${data.ovenType})`
        emailContent = `
          <h2>🔔 Richiesta Download Scheda Tecnica</h2>
          <p><strong>Data:</strong> ${new Date().toLocaleString('it-IT')}</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Dati Cliente:</h3>
            <p><strong>Nome:</strong> ${data.firstName}</p>
            <p><strong>Cognome:</strong> ${data.lastName}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            <p><strong>Città:</strong> ${data.city}</p>
            <p><strong>Telefono:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>
          </div>
          
          <div style="background: #dcfce7; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
            <strong>🔥 Tipologia Forno Richiesto:</strong> ${data.ovenType}
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <strong>⚡ AZIONE RICHIESTA:</strong> Inviare scheda tecnica all'indirizzo email del cliente: <a href="mailto:${data.email}">${data.email}</a>
          </div>
          
          <p><em>Il cliente ha richiesto la scheda tecnica del forno. È stata inviata automaticamente via email.</em></p>
        `
        break

      case 'appointment':
        subject = `📞 Nuova chiamata prenotata da Lead`
        emailContent = `
          <h2>🔔 Nuova chiamata prenotata da Lead</h2>
          <p><strong>Data richiesta:</strong> ${new Date().toLocaleString('it-IT')}</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Dettagli Appuntamento:</h3>
            <p><strong>📅 Data:</strong> ${data.date}</p>
            <p><strong>🕐 Ora:</strong> ${data.time}</p>
            <p><strong>📞 Telefono:</strong> <a href="tel:${data.phoneNumber}">${data.phoneNumber}</a></p>
            <p><strong>💬 Metodo di contatto preferito:</strong> ${data.contactMethod === 'whatsapp' ? '📱 WhatsApp' : data.contactMethod === 'googlemeet' ? '🎥 Google Meet' : '☎️ Telefonata'}</p>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <strong>⚡ AZIONE RICHIESTA:</strong> Contattare il lead al numero <a href="tel:${data.phoneNumber}">${data.phoneNumber}</a> tramite ${data.contactMethod} nella data e ora indicata.
          </div>
          
          <p><em>Il lead ha richiesto di essere contattato per informazioni sui forni Vesuviano.</em></p>
        `
        break

      default:
        subject = `📝 Nuovo Form Compilato - ${formType}`
        emailContent = `
          <h2>🔔 Nuovo Form Compilato</h2>
          <p><strong>Tipo Form:</strong> ${formType}</p>
          <p><strong>Data:</strong> ${new Date().toLocaleString('it-IT')}</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Dati Ricevuti:</h3>
            <pre style="background: white; padding: 10px; border-radius: 4px; overflow-x: auto;">
${JSON.stringify(data, null, 2)}
            </pre>
          </div>
        `
    }

    // Complete HTML template per notifica aziendale
    const companyHtmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Notifica Form - Vesuviano</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: #d97706; color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .content { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; }
            .footer { background: #1f2937; color: white; padding: 20px; border-radius: 8px; text-align: center; }
            a { color: #d97706; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Vesuviano Forni</h1>
              <p>Notifica Automatica Sistema</p>
            </div>
            
            <div class="content">
              ${emailContent}
            </div>

            <div class="footer">
              <p>&copy; 2024 Vesuviano - Sistema Automatico di Notifiche</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Email per l'utente con scheda tecnica
    if (formType === 'datasheet-download') {
      const userHtmlTemplate = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Scheda Tecnica - Vesuviano Forni</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; }
              .header { background: #d97706; color: white; padding: 20px; border-radius: 8px; text-align: center; }
              .content { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; }
              .footer { background: #1f2937; color: white; padding: 20px; border-radius: 8px; text-align: center; }
              a { color: #d97706; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔥 Vesuviano Forni</h1>
                <p>Scheda Tecnica Richiesta</p>
              </div>
              
              <div class="content">
                <h2>Ciao ${data.firstName}!</h2>
                <p>Grazie per il tuo interesse nei nostri forni professionali.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>📄 Scheda Tecnica</h3>
                  <p>Come richiesto, troverai in allegato o al link seguente la scheda tecnica del <strong>${data.ovenType}</strong>.</p>
                  <p>Per ulteriori informazioni o per discutere le specifiche del forno, non esitare a contattarci.</p>
                </div>

                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                  <h3>📞 Hai Domande?</h3>
                  <p>I nostri forni Vesuviano combinano la tradizione artigianale napoletana con le tecnologie più moderne.</p>
                  <p><strong>Contattaci per una consulenza gratuita:</strong></p>
                  <p>📧 Email: <a href="mailto:info@abbattitorizapper.it">info@abbattitorizapper.it</a></p>
                  <p>🌐 Sito web: <a href="https://www.vesuvianoforni.com">www.vesuvianoforni.com</a></p>
                </div>

                <p>Ti ringraziamo per l'interesse e restiamo a disposizione!</p>
              </div>

              <div class="footer">
                <p>&copy; 2024 Vesuviano Forni - Eccellenza Artigianale Napoletana</p>
                <p><a href="https://www.vesuvianoforni.com" style="color: #d97706;">www.vesuvianoforni.com</a></p>
              </div>
            </div>
          </body>
        </html>
      `

      // Inviare email all'utente con la scheda tecnica
      const userEmailResult = await resend.emails.send({
        from: 'Vesuviano Forni <info@vesuvianoforni.com>',
        to: [data.email],
        subject: `🔥 Scheda Tecnica ${data.ovenType} - Vesuviano Forni`,
        html: userHtmlTemplate,
      })

      console.log('User datasheet email sent:', userEmailResult)
    }

    // Email per l'utente (solo per download-modal con immagine)
    if (formType === 'download-modal' && imageUrl) {
      const userHtmlTemplate = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>La tua immagine personalizada - Vesuviano Forni</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; }
              .header { background: #d97706; color: white; padding: 20px; border-radius: 8px; text-align: center; }
              .content { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; }
              .footer { background: #1f2937; color: white; padding: 20px; border-radius: 8px; text-align: center; }
              a { color: #d97706; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔥 Vesuviano Forni</h1>
                <p>La tua immagine personalizzata è pronta!</p>
              </div>
              
              <div class="content">
                <h2>Ciao ${data.firstName}!</h2>
                <p>Grazie per aver utilizzato il nostro <strong>Architetto AI</strong>. La tua immagine personalizzata è allegata a questa email.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>📸 La tua immagine personalizzata</h3>
                  <p>Hai creato una visualizzazione unica del tuo forno nel tuo spazio. L'immagine è allegata in alta qualità.</p>
                </div>

                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                  <h3>🎯 Interessato ai nostri forni?</h3>
                  <p>I nostri forni Vesuviano combinano tradizione artigianale napoletana e tecnologie moderne per offrirti la migliore esperienza culinaria.</p>
                  <p><strong>Contattaci per maggiori informazioni:</strong></p>
                  <p>📧 Email: <a href="mailto:info@abbattitorizapper.it">info@abbattitorizapper.it</a></p>
                  <p>🌐 Sito web: <a href="https://vesuvianoforni.com">vesuvianoforni.com</a></p>
                </div>

                <p>Grazie per aver scelto Vesuviano Forni!</p>
              </div>

              <div class="footer">
                <p>&copy; 2024 Vesuviano Forni - Eccellenza Artigianale Napoletana</p>
                <p><a href="https://vesuvianoforni.com">www.vesuvianoforni.com</a></p>
              </div>
            </div>
          </body>
        </html>
      `

      // Preparare attachment dall'immagine
      const imageAttachment = dataUrlToAttachment(
        imageUrl, 
        `forno-${data.firstName}-${data.lastName}.png`
      )

      // Inviare email all'utente con l'immagine
      const userEmailResult = await resend.emails.send({
        from: 'Vesuviano Forni <system@vesuvianoforni.com>',
        to: [data.email],
        subject: `🔥 La tua immagine personalizzata è pronta - Vesuviano Forni`,
        html: userHtmlTemplate,
        attachments: [imageAttachment]
      })

      console.log('User email sent:', userEmailResult)
    }

    // Send notification email to company
    const companyEmailResult = await resend.emails.send({
      from: 'Sistema Notifiche <system@vesuvianoforni.com>',
      to: ['stanislaoelefante@gmail.com', 'info@vesuvianoforni.com'],
      subject: subject,
      html: companyHtmlTemplate,
    })

    console.log('Company notification email sent:', companyEmailResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Emails sent successfully',
        companyEmailId: companyEmailResult.data?.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in send-form-data function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to send form data',
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})