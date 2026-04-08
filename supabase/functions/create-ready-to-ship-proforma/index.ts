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

    // Fetch datasheet URL from configurator_ovens if linked
    let datasheetUrl: string | null = null
    if (rtsOven.oven_id) {
      const { data: configOven } = await supabase
        .from('configurator_ovens')
        .select('sizes, model_name')
        .eq('id', rtsOven.oven_id)
        .single()

      if (configOven?.sizes) {
        // Find matching size by diameter
        const matchingSize = (configOven.sizes as any[]).find(
          (s: any) => s.diameter === rtsOven.diameter
        )
        if (matchingSize?.datasheet_urls) {
          datasheetUrl = matchingSize.datasheet_urls
        } else if (matchingSize?.datasheet_url) {
          datasheetUrl = { it: matchingSize.datasheet_url }
        }
      }
    }

    // If no linked oven, try to find by model name
    if (!datasheetUrl) {
      const { data: configOvens } = await supabase
        .from('configurator_ovens')
        .select('sizes, model_name')
        .eq('is_active', true)

      if (configOvens) {
        for (const oven of configOvens) {
          if (rtsOven.model_name.toLowerCase().includes(oven.model_name.toLowerCase())) {
            const matchingSize = (oven.sizes as any[] || []).find(
              (s: any) => s.diameter === rtsOven.diameter
            )
            if (matchingSize?.datasheet_urls) {
              datasheetUrl = matchingSize.datasheet_urls
              break
            } else if (matchingSize?.datasheet_url) {
              datasheetUrl = { it: matchingSize.datasheet_url }
              break
            }
          }
        }
      }
    }

    // Resolve datasheet URL by language
    let resolvedDatasheetUrl: string | null = null
    if (datasheetUrl && typeof datasheetUrl === 'object') {
      resolvedDatasheetUrl = datasheetUrl[language] || datasheetUrl['en'] || datasheetUrl['it'] || null
    } else if (typeof datasheetUrl === 'string') {
      resolvedDatasheetUrl = datasheetUrl
    }

    // If still no datasheet, use universal catalog as fallback
    if (!resolvedDatasheetUrl) {
      resolvedDatasheetUrl = 'https://www.vesuvianoforni.com/lovable-uploads/vesuviobuono-scheda-tecnica.pdf'
    }

    console.log('Datasheet URL resolved:', resolvedDatasheetUrl, 'for language:', language)

    // Determine the actual fuel type display
    const actualFuelType = rtsOven.fuel_type || 'Legna'
    const isGasConfigurable = actualFuelType.toLowerCase() === 'legna' || actualFuelType.toLowerCase() === 'wood'

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
        bank_account: language === 'en' ? 'wise_uk' : 'intesa',
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
    const listPriceFormatted = rtsOven.list_price?.toLocaleString('it-IT', { minimumFractionDigits: 2 })

    // Multilingual translations
    const translations: Record<string, Record<string, string>> = {
      it: {
        subject: `🔥 La tua Pro-Forma Pronta Consegna — ${rtsOven.model_name}`,
        headerTitle: 'Il tuo forno è pronto!',
        headerSubtitle: `Pro-forma personalizzata per ${customerName}`,
        greeting: `Gentile <strong>${customerName}</strong>,`,
        intro: `Grazie per il tuo interesse! Abbiamo preparato una pro-forma personalizzata per il forno che hai scelto dalla nostra collezione <strong>Pronta Consegna</strong>.`,
        diameter: 'Diametro',
        coating: 'Rivestimento',
        fuel: 'Combustibile',
        woodFired: 'Legna (configurazione base)',
        datasheetTitle: '📄 Scheda Tecnica',
        datasheetDesc: 'Scarica la scheda tecnica completa del tuo forno',
        datasheetBtn: '⬇️ Scarica Scheda Tecnica PDF',
        priceLabel: 'Prezzo forno Pronta Consegna',
        shippingIncluded: '🚚 Spedizione inclusa',
        depositTitle: '🔒 Riserva il tuo forno con solo il 5%',
        depositLabel: 'Deposito',
        depositRefund: 'Il deposito è <strong>100% rimborsabile</strong> e riserva il forno per 7 giorni.',
        ctaBtn: '📋 Visualizza la tua Pro-Forma',
        guaranteeTitle: '✅ Garanzia totale',
        guarantee1: 'Deposito 100% rimborsabile entro 7 giorni',
        guarantee2: 'Il deposito riserva il forno — nessun altro potrà acquistarlo',
        guarantee3: 'Entro 24 ore sarai ricontattato dal nostro Export Manager',
        guarantee4: 'Dopo 7 giorni, se non finalizzi l\'acquisto, rimborso automatico',
        howTitle: 'Come funziona:',
        step1Title: 'Apri la pro-forma',
        step1Desc: 'Clicca il pulsante qui sopra per visualizzare il riepilogo completo.',
        step2Title: 'Versa il deposito del 5%',
        step2Desc: 'Il deposito riserva il forno per 7 giorni. È 100% rimborsabile.',
        step3Title: 'Sarai ricontattato',
        step3Desc: 'Entro 24 ore, il nostro Export Manager ti contatterà per discutere dettagli di spedizione, pagamento e consegna.',
        contactText: 'Per qualsiasi domanda, non esitare a contattarci:',
        phone: 'Telefono',
        emailLabel: 'Email',
        footerCompany: `© ${new Date().getFullYear()} Vesuviano - Forni Professionali Artigianali`,
        footerTagline: 'Tradizione, qualità e innovazione dal cuore di Napoli',
        gasNote: '🔥 <strong>Configurazione base a legna.</strong> Questo forno può essere configurato anche a gas — insieme al nostro esperto sceglierete il bruciatore più adatto alle vostre esigenze.',
      },
      en: {
        subject: `🔥 Your Ready-to-Ship Pro-Forma — ${rtsOven.model_name}`,
        headerTitle: 'Your oven is ready!',
        headerSubtitle: `Custom pro-forma for ${customerName}`,
        greeting: `Dear <strong>${customerName}</strong>,`,
        intro: `Thank you for your interest! We have prepared a custom pro-forma for the oven you selected from our <strong>Ready to Ship</strong> collection.`,
        diameter: 'Diameter',
        coating: 'Coating',
        fuel: 'Fuel',
        woodFired: 'Wood-fired (base configuration)',
        datasheetTitle: '📄 Technical Datasheet',
        datasheetDesc: 'Download the complete technical datasheet for your oven',
        datasheetBtn: '⬇️ Download Datasheet PDF',
        priceLabel: 'Ready-to-Ship oven price',
        shippingIncluded: '🚚 Shipping included',
        depositTitle: '🔒 Reserve your oven with just 5%',
        depositLabel: 'Deposit',
        depositRefund: 'The deposit is <strong>100% refundable</strong> and reserves the oven for 7 days.',
        ctaBtn: '📋 View your Pro-Forma',
        guaranteeTitle: '✅ Full guarantee',
        guarantee1: '100% refundable deposit within 7 days',
        guarantee2: 'The deposit reserves the oven — no one else can purchase it',
        guarantee3: 'Within 24 hours you will be contacted by our Export Manager',
        guarantee4: 'After 7 days, if you don\'t finalize the purchase, automatic refund',
        howTitle: 'How it works:',
        step1Title: 'Open the pro-forma',
        step1Desc: 'Click the button above to view the complete summary.',
        step2Title: 'Pay the 5% deposit',
        step2Desc: 'The deposit reserves the oven for 7 days. It is 100% refundable.',
        step3Title: 'We\'ll contact you',
        step3Desc: 'Within 24 hours, our Export Manager will contact you to discuss shipping, payment and delivery details.',
        contactText: 'For any questions, don\'t hesitate to contact us:',
        phone: 'Phone',
        emailLabel: 'Email',
        footerCompany: `© ${new Date().getFullYear()} Vesuviano - Professional Artisan Ovens`,
        footerTagline: 'Tradition, quality and innovation from the heart of Naples',
        gasNote: '🔥 <strong>Wood-fired base configuration.</strong> This oven can also be configured for gas — together with our expert you will choose the most suitable burner for your needs.',
      },
      fr: {
        subject: `🔥 Votre Pro-Forma Prêt à Expédier — ${rtsOven.model_name}`,
        headerTitle: 'Votre four est prêt !',
        headerSubtitle: `Pro-forma personnalisée pour ${customerName}`,
        greeting: `Cher/Chère <strong>${customerName}</strong>,`,
        intro: `Merci pour votre intérêt ! Nous avons préparé un pro-forma personnalisé pour le four que vous avez choisi dans notre collection <strong>Prêt à Expédier</strong>.`,
        diameter: 'Diamètre',
        coating: 'Revêtement',
        fuel: 'Combustible',
        woodFired: 'Bois (configuration de base)',
        datasheetTitle: '📄 Fiche Technique',
        datasheetDesc: 'Téléchargez la fiche technique complète de votre four',
        datasheetBtn: '⬇️ Télécharger la Fiche Technique PDF',
        priceLabel: 'Prix du four Prêt à Expédier',
        shippingIncluded: '🚚 Livraison incluse',
        depositTitle: '🔒 Réservez votre four avec seulement 5%',
        depositLabel: 'Acompte',
        depositRefund: 'L\'acompte est <strong>100% remboursable</strong> et réserve le four pendant 7 jours.',
        ctaBtn: '📋 Voir votre Pro-Forma',
        guaranteeTitle: '✅ Garantie totale',
        guarantee1: 'Acompte 100% remboursable sous 7 jours',
        guarantee2: 'L\'acompte réserve le four — personne d\'autre ne pourra l\'acheter',
        guarantee3: 'Sous 24 heures vous serez contacté par notre Export Manager',
        guarantee4: 'Après 7 jours, si vous ne finalisez pas l\'achat, remboursement automatique',
        howTitle: 'Comment ça fonctionne :',
        step1Title: 'Ouvrez le pro-forma',
        step1Desc: 'Cliquez sur le bouton ci-dessus pour voir le récapitulatif complet.',
        step2Title: 'Versez l\'acompte de 5%',
        step2Desc: 'L\'acompte réserve le four pendant 7 jours. Il est 100% remboursable.',
        step3Title: 'Nous vous recontacterons',
        step3Desc: 'Sous 24 heures, notre Export Manager vous contactera pour discuter des détails d\'expédition, de paiement et de livraison.',
        contactText: 'Pour toute question, n\'hésitez pas à nous contacter :',
        phone: 'Téléphone',
        emailLabel: 'Email',
        footerCompany: `© ${new Date().getFullYear()} Vesuviano - Fours Professionnels Artisanaux`,
        footerTagline: 'Tradition, qualité et innovation au cœur de Naples',
        gasNote: '🔥 <strong>Configuration de base au bois.</strong> Ce four peut également être configuré au gaz — avec notre expert, vous choisirez le brûleur le plus adapté à vos besoins.',
      },
      de: {
        subject: `🔥 Ihr Sofort-Lieferbar Pro-Forma — ${rtsOven.model_name}`,
        headerTitle: 'Ihr Ofen ist bereit!',
        headerSubtitle: `Individuelle Pro-Forma für ${customerName}`,
        greeting: `Sehr geehrte/r <strong>${customerName}</strong>,`,
        intro: `Vielen Dank für Ihr Interesse! Wir haben ein individuelles Pro-Forma für den Ofen erstellt, den Sie aus unserer <strong>Sofort Lieferbar</strong>-Kollektion ausgewählt haben.`,
        diameter: 'Durchmesser',
        coating: 'Beschichtung',
        fuel: 'Brennstoff',
        woodFired: 'Holz (Basiskonfiguration)',
        datasheetTitle: '📄 Technisches Datenblatt',
        datasheetDesc: 'Laden Sie das vollständige technische Datenblatt Ihres Ofens herunter',
        datasheetBtn: '⬇️ Datenblatt PDF herunterladen',
        priceLabel: 'Preis Sofort Lieferbar Ofen',
        shippingIncluded: '🚚 Versand inklusive',
        depositTitle: '🔒 Reservieren Sie Ihren Ofen mit nur 5%',
        depositLabel: 'Anzahlung',
        depositRefund: 'Die Anzahlung ist <strong>100% erstattbar</strong> und reserviert den Ofen für 7 Tage.',
        ctaBtn: '📋 Ihr Pro-Forma ansehen',
        guaranteeTitle: '✅ Volle Garantie',
        guarantee1: '100% erstattbare Anzahlung innerhalb von 7 Tagen',
        guarantee2: 'Die Anzahlung reserviert den Ofen — niemand anders kann ihn kaufen',
        guarantee3: 'Innerhalb von 24 Stunden werden Sie von unserem Export Manager kontaktiert',
        guarantee4: 'Nach 7 Tagen, wenn Sie den Kauf nicht abschließen, automatische Rückerstattung',
        howTitle: 'So funktioniert es:',
        step1Title: 'Öffnen Sie das Pro-Forma',
        step1Desc: 'Klicken Sie auf den Button oben, um die vollständige Zusammenfassung anzuzeigen.',
        step2Title: 'Zahlen Sie die 5% Anzahlung',
        step2Desc: 'Die Anzahlung reserviert den Ofen für 7 Tage. Sie ist 100% erstattbar.',
        step3Title: 'Wir kontaktieren Sie',
        step3Desc: 'Innerhalb von 24 Stunden wird sich unser Export Manager mit Ihnen in Verbindung setzen, um Versand-, Zahlungs- und Lieferdetails zu besprechen.',
        contactText: 'Bei Fragen zögern Sie nicht, uns zu kontaktieren:',
        phone: 'Telefon',
        emailLabel: 'E-Mail',
        footerCompany: `© ${new Date().getFullYear()} Vesuviano - Professionelle Handwerksöfen`,
        footerTagline: 'Tradition, Qualität und Innovation aus dem Herzen Neapels',
        gasNote: '🔥 <strong>Holzbefeuerte Basiskonfiguration.</strong> Dieser Ofen kann auch für Gas konfiguriert werden — gemeinsam mit unserem Experten wählen Sie den am besten geeigneten Brenner für Ihre Bedürfnisse.',
      },
      es: {
        subject: `🔥 Tu Pro-Forma Listo para Envío — ${rtsOven.model_name}`,
        headerTitle: '¡Tu horno está listo!',
        headerSubtitle: `Pro-forma personalizada para ${customerName}`,
        greeting: `Estimado/a <strong>${customerName}</strong>,`,
        intro: `¡Gracias por tu interés! Hemos preparado una pro-forma personalizada para el horno que elegiste de nuestra colección <strong>Listo para Envío</strong>.`,
        diameter: 'Diámetro',
        coating: 'Revestimiento',
        fuel: 'Combustible',
        woodFired: 'Leña (configuración base)',
        datasheetTitle: '📄 Ficha Técnica',
        datasheetDesc: 'Descarga la ficha técnica completa de tu horno',
        datasheetBtn: '⬇️ Descargar Ficha Técnica PDF',
        priceLabel: 'Precio horno Listo para Envío',
        depositTitle: '🔒 Reserva tu horno con solo el 5%',
        depositLabel: 'Depósito',
        depositRefund: 'El depósito es <strong>100% reembolsable</strong> y reserva el horno por 7 días.',
        ctaBtn: '📋 Ver tu Pro-Forma',
        guaranteeTitle: '✅ Garantía total',
        guarantee1: 'Depósito 100% reembolsable en 7 días',
        guarantee2: 'El depósito reserva el horno — nadie más podrá comprarlo',
        guarantee3: 'En 24 horas serás contactado por nuestro Export Manager',
        guarantee4: 'Después de 7 días, si no finalizas la compra, reembolso automático',
        howTitle: 'Cómo funciona:',
        step1Title: 'Abre la pro-forma',
        step1Desc: 'Haz clic en el botón de arriba para ver el resumen completo.',
        step2Title: 'Paga el depósito del 5%',
        step2Desc: 'El depósito reserva el horno por 7 días. Es 100% reembolsable.',
        step3Title: 'Te contactaremos',
        step3Desc: 'En 24 horas, nuestro Export Manager te contactará para discutir los detalles de envío, pago y entrega.',
        contactText: 'Para cualquier pregunta, no dudes en contactarnos:',
        phone: 'Teléfono',
        emailLabel: 'Email',
        footerCompany: `© ${new Date().getFullYear()} Vesuviano - Hornos Profesionales Artesanales`,
        footerTagline: 'Tradición, calidad e innovación desde el corazón de Nápoles',
        gasNote: '🔥 <strong>Configuración base a leña.</strong> Este horno también puede configurarse a gas — junto con nuestro experto elegirán el quemador más adecuado para sus necesidades.',
      },
    }

    const t = translations[language] || translations['it']

    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${t.subject}</title>
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
            .gas-note { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 18px; margin: 20px 0; font-size: 14px; color: #9a3412; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/oven-gallery/vesuviano-logo-bianco.png" alt="Vesuviano Logo" class="logo">
              <h1 style="margin: 0; font-size: 26px;">${t.headerTitle}</h1>
              <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">${t.headerSubtitle}</p>
            </div>
            
            <div class="content">
              <p>${t.greeting}</p>
              <p>${t.intro}</p>
              
              <div class="oven-card">
                ${rtsOven.images?.[0] ? `<img src="${rtsOven.images[0].startsWith('http') ? rtsOven.images[0] : siteUrl + rtsOven.images[0]}" alt="${rtsOven.model_name}" style="width: 100%; border-radius: 8px; margin-bottom: 15px;">` : ''}
                <h3 style="margin: 0 0 10px 0; color: #1f2937;">${rtsOven.model_name}</h3>
                <p style="margin: 5px 0;"><strong>${t.diameter}:</strong> ${rtsOven.diameter} cm</p>
                <p style="margin: 5px 0;"><strong>${t.coating}:</strong> ${rtsOven.coating || 'Standard'}</p>
                <p style="margin: 5px 0;"><strong>${t.fuel}:</strong> ${actualFuelType}</p>
              </div>

              ${isGasConfigurable ? `<div class="gas-note">
                ${t.gasNote}
              </div>` : ''}

              ${resolvedDatasheetUrl ? `
              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 12px 0; font-size: 15px; color: #1e40af; font-weight: 600;">${t.datasheetTitle}</p>
                <p style="margin: 0 0 15px 0; font-size: 13px; color: #3b82f6;">${t.datasheetDesc}</p>
                <a href="${resolvedDatasheetUrl}" style="display: inline-block; background: #2563eb; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">${t.datasheetBtn}</a>
              </div>
              ` : ''}

              <div class="price-box">
                <p style="margin: 0 0 5px 0; font-size: 14px; opacity: 0.9;">${t.priceLabel}</p>
                <div class="price-amount">€${priceFormatted}</div>
                ${rtsOven.sale_price && rtsOven.list_price > rtsOven.sale_price ? `<p style="margin: 8px 0 0 0; font-size: 14px; text-decoration: line-through; opacity: 0.7;">€${listPriceFormatted}</p>` : ''}
              </div>

              <div class="deposit-box">
                <h3 style="margin: 0 0 10px 0; color: #92400e;">${t.depositTitle}</h3>
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #92400e;">${t.depositLabel}: €${depositFormatted}</p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #78350f;">${t.depositRefund}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${proformaUrl}" class="cta-btn">${t.ctaBtn}</a>
              </div>

              <div class="guarantee">
                <h4 style="margin: 0 0 10px 0; color: #065f46;">${t.guaranteeTitle}</h4>
                <ul style="margin: 0; padding-left: 20px; color: #047857;">
                  <li>${t.guarantee1}</li>
                  <li>${t.guarantee2}</li>
                  <li>${t.guarantee3}</li>
                  <li>${t.guarantee4}</li>
                </ul>
              </div>

              <div class="steps">
                <h3 style="color: #1f2937;">${t.howTitle}</h3>
                <div class="step">
                  <span class="step-num">1</span>
                  <div><strong>${t.step1Title}</strong> — ${t.step1Desc}</div>
                </div>
                <div class="step">
                  <span class="step-num">2</span>
                  <div><strong>${t.step2Title}</strong> — ${t.step2Desc}</div>
                </div>
                <div class="step">
                  <span class="step-num">3</span>
                  <div><strong>${t.step3Title}</strong> — ${t.step3Desc}</div>
                </div>
              </div>

              <p>${t.contactText}</p>
              <p><strong>📞 ${t.phone}:</strong> 081 19231684<br>
              <strong>✉️ ${t.emailLabel}:</strong> info@vesuvianoforni.com</p>
            </div>

            <div class="footer">
              <p style="margin: 0; opacity: 0.8;">${t.footerCompany}</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.7;">${t.footerTagline}</p>
            </div>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: 'Vesuviano Forni <noreply@vesuvianoforni.com>',
      to: [email],
      subject: t.subject,
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

    // Sync lead to external ERP via webhook
    const erpWebhookUrl = Deno.env.get('ERP_WEBHOOK_URL')
    if (erpWebhookUrl) {
      const erpPayload = {
        source: 'vesuviano_website',
        event_type: 'website_lead_created',
        form_type: 'ready_to_ship',
        customer_name: customerName,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        city: city || null,
        oven_type: `${rtsOven.model_name} - Ø${rtsOven.diameter}cm`,
        notes: `Pronta consegna - ${rtsOven.coating || 'N/A'} - Pro-forma: ${proforma.proforma_number || proforma.id}`,
        metadata: {
          ready_to_ship_oven_id: readyToShipOvenId,
          proforma_id: proforma.id,
          proforma_number: proforma.proforma_number,
          model_name: rtsOven.model_name,
          diameter: rtsOven.diameter,
          coating: rtsOven.coating,
          price: ovenPrice,
        },
        timestamp: new Date().toISOString()
      }

      try {
        const erpRes = await fetch(erpWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(erpPayload)
        })
        console.log('ERP webhook response:', erpRes.status)
      } catch (err) {
        console.error('ERP webhook error:', err.message || err)
      }
    }

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
