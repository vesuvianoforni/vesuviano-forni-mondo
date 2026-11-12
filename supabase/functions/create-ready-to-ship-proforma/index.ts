import { Resend } from "npm:resend@2.0.0"
import { withCompanyEmailCopy } from '../_shared/email-delivery-policy.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { BOOKING_URL, followupDueAt, isWorkingTime } from '../_shared/ready-to-ship-followup.ts'
import { DEFAULT_OFFER_SETTINGS, offerTotals, type OfferDocument, type OfferSettings } from '../_shared/commercial-offer-domain.ts'

// Ready-to-ship request: builds a commercial offer with the shared offer tool (company/IBAN snapshot,
// catalog description, public link + PDF from the same renderer), emails it with photos and one CTA (book a call).
// No proforma and no deposit.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)
import { convertEur, currencyForPhone, ecbRate } from '../_shared/ready-to-ship-currency.ts'
const SITE = 'https://vesuvianoforni.com'
const WWW = 'https://www.vesuvianoforni.com'
const MEDIA = `${WWW}/media`
const LOGO = `${WWW}/lovable-uploads/vesuviano-logo-bianco.png`

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

const T = {
  it: { subject: (m: string) => `La tua offerta Pronta Consegna — ${m}`, title: 'Il tuo forno è pronto', greet: (n: string) => `Gentile ${n},`, intro: 'grazie per il tuo interesse. Ti inviamo la nostra offerta per il forno che hai scelto dalla collezione <strong>Pronta Consegna</strong>.', diameter: 'Diametro', coating: 'Rivestimento', fuel: 'Combustibile', price: 'Prezzo', shipping: 'Spedizione esclusa, quotata a parte', gallery: 'Le foto del tuo forno', view: 'Vedi l’offerta online', pdf: 'Scarica l’offerta in PDF', ctaText: 'Vuoi parlarne con il nostro Export Manager Gennaro Caglione?', cta: 'Prenota una chiamata', contact: 'Per qualsiasi domanda:', inclusion: '', exclusion: 'Spedizione esclusa: quotata a parte in base alla destinazione', fx: 'Importo convertito al cambio BCE del', offerTitle: (m: string) => `Pronta consegna · ${m}` },
  en: { subject: (m: string) => `Your Ready-to-Ship offer — ${m}`, title: 'Your oven is ready', greet: (n: string) => `Dear ${n},`, intro: 'thank you for your interest. Here is our offer for the oven you selected from our <strong>Ready to Ship</strong> collection.', diameter: 'Diameter', coating: 'Coating', fuel: 'Fuel', price: 'Price', shipping: 'Shipping excluded, quoted separately', gallery: 'Photos of your oven', view: 'View the offer online', pdf: 'Download the offer as PDF', ctaText: 'Would you like to talk it through with our Export Manager Gennaro Caglione?', cta: 'Book a call', contact: 'For any question:', inclusion: '', exclusion: 'Shipping excluded: quoted separately based on destination', fx: 'Amount converted at the ECB rate of', offerTitle: (m: string) => `Ready to ship · ${m}` },
  fr: { subject: (m: string) => `Votre offre Prêt à Expédier — ${m}`, title: 'Votre four est prêt', greet: (n: string) => `Bonjour ${n},`, intro: 'merci pour votre intérêt. Voici notre offre pour le four choisi dans notre collection <strong>Prêt à Expédier</strong>.', diameter: 'Diamètre', coating: 'Revêtement', fuel: 'Combustible', price: 'Prix', shipping: 'Livraison non incluse, devis séparé', gallery: 'Les photos de votre four', view: 'Voir l’offre en ligne', pdf: 'Télécharger l’offre en PDF', ctaText: 'Souhaitez-vous en parler avec notre Export Manager Gennaro Caglione ?', cta: 'Réserver un appel', contact: 'Pour toute question :', inclusion: '', exclusion: 'Livraison non incluse : devis séparé selon la destination', fx: 'Montant converti au taux BCE du', offerTitle: (m: string) => `Prêt à expédier · ${m}` },
  de: { subject: (m: string) => `Ihr Angebot Sofort Lieferbar — ${m}`, title: 'Ihr Ofen ist bereit', greet: (n: string) => `Guten Tag ${n},`, intro: 'vielen Dank für Ihr Interesse. Hier ist unser Angebot für den Ofen aus unserer Kollektion <strong>Sofort Lieferbar</strong>.', diameter: 'Durchmesser', coating: 'Beschichtung', fuel: 'Brennstoff', price: 'Preis', shipping: 'Versand exklusive, separates Angebot', gallery: 'Fotos Ihres Ofens', view: 'Angebot online ansehen', pdf: 'Angebot als PDF herunterladen', ctaText: 'Möchten Sie mit unserem Export Manager Gennaro Caglione sprechen?', cta: 'Gespräch buchen', contact: 'Bei Fragen:', inclusion: '', exclusion: 'Versand exklusive: separates Angebot je nach Zielort', fx: 'Betrag umgerechnet zum EZB-Kurs vom', offerTitle: (m: string) => `Sofort lieferbar · ${m}` },
  es: { subject: (m: string) => `Tu oferta Listo para Envío — ${m}`, title: 'Tu horno está listo', greet: (n: string) => `Hola ${n},`, intro: 'gracias por tu interés. Te enviamos nuestra oferta para el horno que elegiste de la colección <strong>Listo para Envío</strong>.', diameter: 'Diámetro', coating: 'Revestimiento', fuel: 'Combustible', price: 'Precio', shipping: 'Envío no incluido, presupuesto aparte', gallery: 'Las fotos de tu horno', view: 'Ver la oferta online', pdf: 'Descargar la oferta en PDF', ctaText: '¿Quieres hablarlo con nuestro Export Manager Gennaro Caglione?', cta: 'Reservar una llamada', contact: 'Para cualquier pregunta:', inclusion: '', exclusion: 'Envío no incluido: presupuesto aparte según el destino', fx: 'Importe convertido al cambio BCE del', offerTitle: (m: string) => `Listo para envío · ${m}` },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  try {
    const { firstName, lastName, email, phone, city, readyToShipOvenId, language = 'it' } = await req.json()
    if (!firstName || !lastName || !email || !phone || !readyToShipOvenId) return json({ error: 'Missing required fields' }, 400)

    const { data: rts } = await supabase.from('ready_to_ship_ovens').select('*').eq('id', readyToShipOvenId).maybeSingle()
    if (!rts) return json({ error: 'Oven not found' }, 404)

    const lang = (String(language).slice(0, 2).toLowerCase() in T ? String(language).slice(0, 2).toLowerCase() : 'it') as keyof typeof T
    const t = T[lang]
    const customerName = `${firstName} ${lastName}`.trim()
    const model = rts.custom_title || rts.model_name
    const fuel = rts.fuel_type || 'Legna'
    const priceEur = Number(rts.sale_price || rts.list_price || 0)
    // Local currency from the phone prefix, daily ECB rate; fall back to EUR if the rate is unavailable
    let currency = currencyForPhone(phone)
    const fx = await ecbRate(currency)
    if (!fx) currency = 'EUR'
    const price = currency === 'EUR' ? priceEur : convertEur(priceEur, fx!.rate)
    const images: string[] = (rts.images || []).map((i: string) => i.startsWith("http") ? i : WWW + (i.startsWith("/") ? i : "/" + i))

    // Reference model description from the product catalog (fallback: ready-to-ship description)
    let catalogDesc = ''
    if (rts.oven_id) {
      const { data: prods } = await supabase.from('products').select('description,size_label').eq('oven_id', rts.oven_id).eq('is_active', true)
      const match = (prods ?? []).find((p) => String(p.size_label ?? '').includes(String(rts.diameter))) ?? (prods ?? [])[0]
      catalogDesc = match?.description ?? ''
    }
    const specs = `${t.diameter}: ${rts.diameter} cm · ${t.coating}: ${rts.coating || 'Standard'} · ${t.fuel}: ${fuel}`
    const description = [specs, catalogDesc || rts.description || ''].filter(Boolean).join('\n\n')

    // Offer settings (company identity, IBAN, conditions) from the shared offer tool
    const { data: row } = await supabase.from('commercial_offer_settings').select('settings').eq('key', 'vesuviano').maybeSingle()
    const settings: OfferSettings = { ...structuredClone(DEFAULT_OFFER_SETTINGS), ...(row?.settings ?? {}) }
    const { data: lead } = await supabase.from('leads').select('id').eq('pipeline', 'Vesuviano').ilike('email', email).limit(1).maybeSingle()
    const valid = new Date(Date.now() + (settings.validity_days || 30) * 86400000).toISOString().slice(0, 10)
    const document: OfferDocument = {
      customer_name: customerName, customer_contact: customerName, customer_email: email, customer_phone: phone,
      customer_address: city || '', customer_vat: '', title: t.offerTitle(model), description: '',
      language: lang, currency, price_list: settings.price_list,
      company_entity: lang === 'en' ? 'wise' : settings.company_entity, vat_regime: settings.vat_regime, valid_until: valid,
      payment_method: settings.payment_method, payment_agreement: settings.payment_agreement,
      include_certification: settings.include_certification, include_warranty: settings.include_warranty, warranty_years: settings.warranty_years,
      inclusions: settings.inclusions, exclusions: [t.exclusion, settings.exclusions].filter(Boolean).join('\n'),
      timeline_produzione: settings.timeline_produzione, timeline_consegna: settings.timeline_consegna,
      timeline_installazione: settings.timeline_installazione, timeline_collaudo: settings.timeline_collaudo,
      items: [{ id: crypto.randomUUID(), product_id: null, product_name: model, description, image_url: images[0] || '', quantity: 1, unit_price: price, discount_percent: 0, notes: '' }],
      settings_snapshot: settings,
    }
    const id = crypto.randomUUID()
    const initials = customerName.split(/\s+/).map((w) => w.charAt(0).toUpperCase()).join('').replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'CLI'
    const number = `OFF-${initials}-${new Date().getFullYear()}-${id.slice(0, 8).toUpperCase()}`
    const { data: offer, error: offerErr } = await supabase.from('commercial_offers').insert({
      id, number, lead_id: lead?.id ?? null, customer_name: customerName, title: document.title, status: 'offerta_inviata',
      document, amount: offerTotals(document).subtotal, currency, public_enabled: true,
    }).select('id,number,public_code').single()
    if (offerErr) throw offerErr
    const offerUrl = `${SITE}/offerta/${offer.public_code}`
    const pdfUrl = `${offerUrl}?pdf=1`

    await supabase.from('website_leads').insert({
      first_name: firstName, last_name: lastName, email, phone, city: city || null,
      oven_type: `${rts.model_name} (${rts.diameter}cm - ${rts.coating || 'N/A'})`, form_type: 'ready_to_ship',
      notes: `Offerta auto-generata: ${offer.number}`, metadata: { ready_to_ship_oven_id: readyToShipOvenId, offer_id: offer.id, offer_number: offer.number },
    })

    const priceTxt = new Intl.NumberFormat(lang === 'en' ? 'en-GB' : `${lang}-${lang.toUpperCase()}`, { style: 'currency', currency, minimumFractionDigits: 2 }).format(price)
    const fxNote = currency !== 'EUR' && fx ? `${t.fx} ${fx.date} (1 EUR = ${fx.rate} ${currency})` : ''
    // Mail clients only reliably load images from our own domain: serve storage through vesuvianoforni.com/media
    const onDomain = (u: string) => u.replace(/^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\//, `${MEDIA}/`).replace(/^https:\/\/vesuvianoforni\.com\//, `${WWW}/`)
    const pics = images.slice(0, 5).map(onDomain)
    const C = { bg: '#f3f4f5', paper: '#ffffff', ink: '#242424', muted: '#686868', border: '#dedede', brand: '#8B4513', header: '#272321', soft: '#faf6f2' }
    const hero = pics[0] ? `<tr><td style="padding:0"><img src="${esc(pics[0])}" width="600" alt="${esc(model)}" style="display:block;width:100%;max-width:600px;height:auto;border:0"></td></tr>` : ''
    const thumbs = pics.slice(1, 5).map((u) => `<td width="25%" style="padding:3px"><img src="${esc(u)}" width="138" alt="${esc(model)}" style="display:block;width:100%;height:auto;border:0;border-radius:3px"></td>`).join('')
    const btn = (href: string, label: string, bg: string, color = C.paper) => `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto"><tr><td bgcolor="${bg}" style="background:${bg};border-radius:4px"><a href="${esc(href)}" style="display:inline-block;padding:15px 34px;color:${color};font-size:16px;font-weight:bold;text-decoration:none">${label}</a></td></tr></table>`
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(t.subject(model))}</title></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:Arial,Helvetica,sans-serif;color:${C.ink}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${C.paper}">
  <tr><td style="padding:22px 28px;background:${C.header};border-bottom:3px solid ${C.brand}"><a href="${WWW}" style="text-decoration:none"><img src="${LOGO}" width="120" height="77" alt="Vesuviano Forni" style="display:block;width:120px;height:77px;border:0"></a></td></tr>
  ${hero}
  <tr><td style="padding:30px 28px 10px;font-size:15px;line-height:1.75">
    <p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${C.brand};font-weight:bold">${t.title}</p>
    <h1 style="margin:0 0 18px;font-size:24px;line-height:1.3;color:${C.ink}">${esc(model)}</h1>
    <p style="margin:0 0 14px">${esc(t.greet(customerName))}</p><p style="margin:0 0 18px">${t.intro}</p>
  </td></tr>
  ${thumbs ? `<tr><td style="padding:0 25px 10px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${thumbs}</tr></table></td></tr>` : ''}
  <tr><td style="padding:10px 28px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.soft};border-left:3px solid ${C.brand}"><tr><td style="padding:18px 20px;font-size:14px;line-height:1.7">
      <p style="margin:0 0 6px;color:${C.muted}">${esc(specs)}</p>
      <p style="margin:0 0 4px;font-size:20px;font-weight:bold;color:${C.ink}">${t.price}: ${priceTxt}</p>
      <p style="margin:0 0 12px;color:${C.muted}">${t.shipping} · ${esc(offer.number)}${fxNote ? `<br><span style="font-size:12px">${esc(fxNote)}</span>` : ''}</p>
      <p style="margin:0"><a href="${offerUrl}" style="color:${C.brand};font-weight:bold">${t.view} &rarr;</a> &nbsp;&nbsp; <a href="${pdfUrl}" style="color:${C.brand};font-weight:bold">${t.pdf} &rarr;</a></p>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:26px 28px 8px;text-align:center;font-size:15px;line-height:1.7"><p style="margin:0 0 16px">${t.ctaText}</p>${btn(BOOKING_URL, t.cta, C.brand)}</td></tr>
  <tr><td style="padding:24px 28px 28px;font-size:13px;line-height:1.7;color:${C.muted}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.border}"><tr><td style="padding-top:18px">
      <p style="margin:0 0 4px;font-size:16px;font-weight:bold;color:${C.ink}">Gennaro Caglione</p>
      <p style="margin:0 0 10px">Sales &amp; Export Manager · <span style="color:${C.brand};font-weight:bold">Vesuviano Forni</span></p>
      <p style="margin:0">${t.contact} <a href="mailto:info@vesuvianoforni.com" style="color:${C.ink}">info@vesuvianoforni.com</a> · <a href="tel:+3908119231684" style="color:${C.ink}">+39 081 19231684</a> · <a href="${WWW}" style="color:${C.ink}">vesuvianoforni.com</a></p>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:16px 28px;background:${C.header};color:#bdb6b0;font-size:12px;text-align:center">© ${new Date().getFullYear()} Vesuviano Forni · Made in Naples</td></tr>
</table></td></tr></table></body></html>`

    const sent = await resend.emails.send({ from: 'Vesuviano Forni <noreply@vesuvianoforni.com>', ...withCompanyEmailCopy({ to: [email] }), subject: t.subject(model), html })
    if (sent.error) console.error('Ready-to-ship offer email failed:', offer.number, JSON.stringify(sent.error))

    // Gennaro's WhatsApp follow-up (WaSender), only after the email was accepted
    if (!sent.error && String(phone).replace(/\D/g, '').length >= 7) {
      const { data: wl } = await supabase.from('website_leads').select('id').eq('email', email).eq('form_type', 'ready_to_ship').order('created_at', { ascending: false }).limit(1).maybeSingle()
      const { error: fuErr } = await supabase.from('ready_to_ship_followups').insert({
        website_lead_id: wl?.id ?? null, customer_name: firstName, phone, email, language: lang, model_name: model, due_at: followupDueAt(new Date()).toISOString(),
      })
      if (fuErr) console.error('Follow-up queue failed:', fuErr.message)
      else if (isWorkingTime(new Date())) {
        try { await fetch(`${supabaseUrl}/functions/v1/ready-to-ship-followup`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supabaseServiceKey}` }, body: '{}', signal: AbortSignal.timeout(20000) }) }
        catch (e) { console.error('Follow-up wake failed:', e instanceof Error ? e.message : e) }
      }
    }

    await resend.emails.send({
      from: 'Sistema Pronta Consegna <system@vesuvianoforni.com>', ...withCompanyEmailCopy({ to: ['info@vesuvianoforni.com', 'commerciale@vesuviano.it'] }),
      subject: `🏷️ Nuova Richiesta Pronta Consegna: ${customerName} - ${model}`,
      html: `<h2>Nuova richiesta Pronta Consegna</h2><p>Offerta inviata automaticamente: <a href="${offerUrl}">${esc(offer.number)}</a></p>
<p><b>Nome:</b> ${esc(customerName)}<br><b>Email:</b> ${esc(email)}<br><b>Telefono:</b> ${esc(phone)}<br>${city ? `<b>Città:</b> ${esc(city)}<br>` : ''}
<b>Forno:</b> ${esc(model)} Ø${esc(rts.diameter)}cm · ${esc(rts.coating || 'N/A')}<br><b>Prezzo:</b> ${priceTxt}${currency !== 'EUR' ? ` (da € ${priceEur})` : ''} · spedizione esclusa</p>`,
    })

    const erpWebhookUrl = Deno.env.get('ERP_WEBHOOK_URL')
    if (erpWebhookUrl) {
      try {
        await fetch(erpWebhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          source: 'vesuviano_website', event_type: 'website_lead_created', form_type: 'ready_to_ship', customer_name: customerName,
          first_name: firstName, last_name: lastName, email, phone, city: city || null, oven_type: `${rts.model_name} - Ø${rts.diameter}cm`,
          notes: `Pronta consegna - ${rts.coating || 'N/A'} - Offerta: ${offer.number}`,
          metadata: { ready_to_ship_oven_id: readyToShipOvenId, offer_id: offer.id, offer_number: offer.number, model_name: rts.model_name, diameter: rts.diameter, coating: rts.coating, price },
          timestamp: new Date().toISOString() }) })
      } catch (err) { console.error('ERP webhook error:', err instanceof Error ? err.message : err) }
    }

    return json({ success: true, offerId: offer.id, offerNumber: offer.number, offerUrl })
  } catch (error) {
    console.error('Error creating ready-to-ship offer:', error instanceof Error ? error.message : error)
    return json({ error: 'Impossibile completare la richiesta' }, 500)
  }
})
