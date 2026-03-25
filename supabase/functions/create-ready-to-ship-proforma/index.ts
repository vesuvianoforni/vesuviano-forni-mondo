import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      city,
      readyToShipOvenId,
      language = 'it',
    } = await req.json()

    if (!firstName || !lastName || !email || !phone || !readyToShipOvenId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Fetch the ready-to-ship oven
    const { data: rtsOven, error: rtsError } = await supabase
      .from('ready_to_ship_ovens')
      .select('*')
      .eq('id', readyToShipOvenId)
      .single()

    if (rtsError || !rtsOven) {
      return new Response(
        JSON.stringify({ error: 'Oven not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use sale_price if available, otherwise list_price
    const ovenPrice = rtsOven.sale_price || rtsOven.list_price || 0
    const customerName = `${firstName} ${lastName}`
    const depositPercentage = 5
    const depositAmount = ovenPrice * (depositPercentage / 100)

    // 2. Create the proforma
    const { data: proforma, error: proformaError } = await supabase
      .from('proformas')
      .insert({
        customer_name: customerName,
        customer_email: email,
        customer_phone: phone,
        notes: city ? `Città: ${city}` : null,
        total_price: ovenPrice,
        deposit_percentage: depositPercentage,
        deposit_amount: depositAmount,
        payment_option: 'deposit_5',
        language,
        currency: 'EUR',
        price_list: 'A',
        status: 'sent',
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (proformaError) throw proformaError

    // 3. Create the oven item
    const ovenItem = {
      proforma_id: proforma.id,
      item_type: 'oven',
      oven_id: rtsOven.oven_id || null,
      model_name: rtsOven.model_name,
      fuel_type: rtsOven.fuel_type || 'Legna',
      diameter: rtsOven.diameter,
      coating: rtsOven.coating || null,
      image_url: rtsOven.images?.[0] || null,
      unit_price: ovenPrice,
      quantity: 1,
      line_total: ovenPrice,
      sort_order: 0,
    }

    const { error: itemError } = await supabase
      .from('proforma_items')
      .insert(ovenItem)

    if (itemError) throw itemError

    // 4. Save as website lead
    await supabase.from('website_leads').insert({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      city: city || null,
      oven_type: `${rtsOven.model_name} (${rtsOven.diameter}cm - ${rtsOven.coating || 'N/A'})`,
      form_type: 'ready_to_ship',
      notes: `Pro-forma auto-generata: ${proforma.proforma_number || proforma.id}`,
      metadata: { ready_to_ship_oven_id: readyToShipOvenId, proforma_id: proforma.id },
    })

    // 5. Build proforma URL
    const siteUrl = 'https://www.vesuvianoforni.com'
    const proformaUrl = `${siteUrl}/proforma/${proforma.token}`

    // 6. Send email to customer
    const priceFormatted = ovenPrice.toLocaleString('it-IT', { minimumFractionDigits: 2 })
    const depositFormatted = depositAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })

    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>La tua Pro-Forma - Vesuviano</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #d97706 0%, #ea580c 100%); color: white; padding: 40px 30px; text-align: center; }
            .logo { width: 150px; height: auto; margin-bottom: 15px; }
            .content { padding: 40px 30px; }
            .oven-card { background: #f8fafc; border-radius: 12px; padding: 25px; margin: 20px 0; border: 1px solid #e2e8f0; }
            .price-box { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
            .price-amount { font-size: 32px; font-weight: bold; }
            .deposit-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .cta-btn { display: inline-block; background: #d97706; color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: 700; margin: 20px 0; }
            .guarantee { background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .steps { margin: 25px 0; }
            .step { display: flex; align-items: flex-start; margin: 15px 0; }
            .step-num { background: #d97706; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
            .footer { background: #1f2937; color: white; padding: 30px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/oven-gallery/vesuviano-logo-bianco.png" alt="Vesuviano Logo" class="logo">
              <h1 style="margin: 0; font-size: 26px;">Il tuo forno è pronto!</h1>
              <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Pro-forma personalizzata per ${customerName}</p>
            </div>
            
            <div class="content">
              <p>Gentile <strong>${customerName}</strong>,</p>
              <p>Grazie per il tuo interesse! Abbiamo preparato una pro-forma personalizzata per il forno che hai scelto dalla nostra collezione <strong>Pronta Consegna</strong>.</p>
              
              <div class="oven-card">
                ${rtsOven.images?.[0] ? `<img src="${rtsOven.images[0].startsWith('http') ? rtsOven.images[0] : siteUrl + rtsOven.images[0]}" alt="${rtsOven.model_name}" style="width: 100%; border-radius: 8px; margin-bottom: 15px;">` : ''}
                <h3 style="margin: 0 0 10px 0; color: #1f2937;">${rtsOven.model_name}</h3>
                <p style="margin: 5px 0;"><strong>Diametro:</strong> ${rtsOven.diameter} cm</p>
                <p style="margin: 5px 0;"><strong>Rivestimento:</strong> ${rtsOven.coating || 'Standard'}</p>
                <p style="margin: 5px 0;"><strong>Combustibile:</strong> ${rtsOven.fuel_type || 'Legna/Gas'}</p>
              </div>

              <div class="price-box">
                <p style="margin: 0 0 5px 0; font-size: 14px; opacity: 0.9;">Prezzo forno Pronta Consegna</p>
                <div class="price-amount">€${priceFormatted}</div>
                ${rtsOven.sale_price && rtsOven.list_price > rtsOven.sale_price ? `<p style="margin: 8px 0 0 0; font-size: 14px; text-decoration: line-through; opacity: 0.7;">€${rtsOven.list_price.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>` : ''}
              </div>

              <div class="deposit-box">
                <h3 style="margin: 0 0 10px 0; color: #92400e;">🔒 Riserva il tuo forno con solo il 5%</h3>
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #92400e;">Deposito: €${depositFormatted}</p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #78350f;">Il deposito è <strong>100% rimborsabile</strong> e riserva il forno per 7 giorni.</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${proformaUrl}" class="cta-btn">📋 Visualizza la tua Pro-Forma</a>
              </div>

              <div class="guarantee">
                <h4 style="margin: 0 0 10px 0; color: #065f46;">✅ Garanzia totale</h4>
                <ul style="margin: 0; padding-left: 20px; color: #047857;">
                  <li>Deposito 100% rimborsabile entro 7 giorni</li>
                  <li>Il deposito riserva il forno — nessun altro potrà acquistarlo</li>
                  <li>Entro 24 ore sarai ricontattato dal nostro Export Manager</li>
                  <li>Dopo 7 giorni, se non finalizzi l'acquisto, rimborso automatico</li>
                </ul>
              </div>

              <div class="steps">
                <h3 style="color: #1f2937;">Come funziona:</h3>
                <div class="step">
                  <span class="step-num">1</span>
                  <div><strong>Apri la pro-forma</strong> — Clicca il pulsante qui sopra per visualizzare il riepilogo completo. Puoi aggiungere un bruciatore a gas se desideri.</div>
                </div>
                <div class="step">
                  <span class="step-num">2</span>
                  <div><strong>Versa il deposito del 5%</strong> — Il deposito riserva il forno per 7 giorni. È 100% rimborsabile.</div>
                </div>
                <div class="step">
                  <span class="step-num">3</span>
                  <div><strong>Sarai ricontattato</strong> — Entro 24 ore, il nostro Export Manager ti contatterà per discutere dettagli di spedizione, pagamento e consegna.</div>
                </div>
              </div>

              <p>Per qualsiasi domanda, non esitare a contattarci:</p>
              <p><strong>📞 Telefono:</strong> 081 19231684<br>
              <strong>✉️ Email:</strong> info@vesuvianoforni.com</p>
            </div>

            <div class="footer">
              <p style="margin: 0; opacity: 0.8;">© ${new Date().getFullYear()} Vesuviano - Forni Professionali Artigianali</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.7;">Tradizione, qualità e innovazione dal cuore di Napoli</p>
            </div>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: 'Vesuviano Forni <noreply@vesuvianoforni.com>',
      to: [email],
      subject: `🔥 La tua Pro-Forma Pronta Consegna — ${rtsOven.model_name}`,
      html: customerEmailHtml,
    })

    // 7. Notify the company
    const companyEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><title>Nuova Richiesta Pronta Consegna</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #d97706; color: white; padding: 20px; border-radius: 8px; }
            .content { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; }
            .field { margin: 12px 0; padding: 10px; background: white; border-radius: 4px; }
            .label { font-weight: bold; color: #d97706; }
            .priority { background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">🏷️ Nuova Richiesta Pronta Consegna</h2>
              <p style="margin: 5px 0 0 0;">${new Date().toLocaleString('it-IT')}</p>
            </div>
            <div class="priority">
              <strong>⚡ Pro-forma generata automaticamente</strong> — Il cliente riceverà il link per il deposito del 5%.
            </div>
            <div class="content">
              <h3>Cliente:</h3>
              <div class="field"><div class="label">Nome:</div> ${customerName}</div>
              <div class="field"><div class="label">Email:</div> <a href="mailto:${email}">${email}</a></div>
              <div class="field"><div class="label">Telefono:</div> ${phone}</div>
              ${city ? `<div class="field"><div class="label">Città:</div> ${city}</div>` : ''}
              <h3>Forno:</h3>
              <div class="field"><div class="label">Modello:</div> ${rtsOven.model_name}</div>
              <div class="field"><div class="label">Diametro:</div> ${rtsOven.diameter}cm</div>
              <div class="field"><div class="label">Rivestimento:</div> ${rtsOven.coating || 'N/A'}</div>
              <div class="field"><div class="label">Prezzo:</div> €${priceFormatted}</div>
              <div class="field"><div class="label">Pro-forma:</div> <a href="${proformaUrl}">${proforma.proforma_number || proforma.id}</a></div>
            </div>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: 'Sistema Pronta Consegna <system@vesuvianoforni.com>',
      to: ['info@vesuvianoforni.com', 'commerciale@vesuviano.it'],
      subject: `🏷️ Nuova Richiesta Pronta Consegna: ${customerName} - ${rtsOven.model_name}`,
      html: companyEmailHtml,
    })

    console.log('Ready-to-ship proforma created:', proforma.id)

    return new Response(
      JSON.stringify({
        success: true,
        proformaId: proforma.id,
        proformaToken: proforma.token,
        proformaUrl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error creating ready-to-ship proforma:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
