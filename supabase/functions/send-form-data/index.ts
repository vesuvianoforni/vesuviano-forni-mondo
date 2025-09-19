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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { formType, data }: FormData = await req.json()

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

    // Complete HTML template
    const htmlTemplate = `
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

    // Send notification email to company
    const emailResult = await resend.emails.send({
      from: 'Sistema Notifiche <system@vesuvianoforni.com>',
      to: ['info@vesuvianoforni.com', 'info@abbattitorizapper.it'],
      subject: subject,
      html: htmlTemplate,
    })

    console.log('Notification email sent:', emailResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Form data sent successfully',
        emailId: emailResult.data?.id
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