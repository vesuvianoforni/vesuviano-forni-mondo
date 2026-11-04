import { Resend } from "npm:resend@2.0.0"
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
const SITE = 'https://vesuvianoforni.com'

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

const T = {
  it: { subject: (m: string) => `La tua offerta Pronta Consegna — ${m}`, title: 'Il tuo forno è pronto', greet: (n: string) => `Gentile ${n},`, intro: 'grazie per il tuo interesse. Ti inviamo la nostra offerta per il forno che hai scelto dalla collezione <strong>Pronta Consegna</strong>.', diameter: 'Diametro', coating: 'Rivestimento', fuel: 'Combustibile', price: 'Prezzo', shipping: 'Spedizione inclusa', gallery: 'Le foto del tuo forno', view: 'Vedi l’offerta online', pdf: 'Scarica l’offerta in PDF', ctaText: 'Vuoi parlarne con il nostro Export Manager Gennaro Caglione?', cta: 'Prenota una chiamata', contact: 'Per qualsiasi domanda:', inclusion: 'Spedizione inclusa', offerTitle: (m: string) => `Pronta consegna · ${m}` },
  en: { subject: (m: string) => `Your Ready-to-Ship offer — ${m}`, title: 'Your oven is ready', greet: (n: string) => `Dear ${n},`, intro: 'thank you for your interest. Here is our offer for the oven you selected from our <strong>Ready to Ship</strong> collection.', diameter: 'Diameter', coating: 'Coating', fuel: 'Fuel', price: 'Price', shipping: 'Shipping included', gallery: 'Photos of your oven', view: 'View the offer online', pdf: 'Download the offer as PDF', ctaText: 'Would you like to talk it through with our Export Manager Gennaro Caglione?', cta: 'Book a call', contact: 'For any question:', inclusion: 'Shipping included', offerTitle: (m: string) => `Ready to ship · ${m}` },
  fr: { subject: (m: string) => `Votre offre Prêt à Expédier — ${m}`, title: 'Votre four est prêt', greet: (n: string) => `Bonjour ${n},`, intro: 'merci pour votre intérêt. Voici notre offre pour le four choisi dans notre collection <strong>Prêt à Expédier</strong>.', diameter: 'Diamètre', coating: 'Revêtement', fuel: 'Combustible', price: 'Prix', shipping: 'Livraison incluse', gallery: 'Les photos de votre four', view: 'Voir l’offre en ligne', pdf: 'Télécharger l’offre en PDF', ctaText: 'Souhaitez-vous en parler avec notre Export Manager Gennaro Caglione ?', cta: 'Réserver un appel', contact: 'Pour toute question :', inclusion: 'Livraison incluse', offerTitle: (m: string) => `Prêt à expédier · ${m}` },
  de: { subject: (m: string) => `Ihr Angebot Sofort Lieferbar — ${m}`, title: 'Ihr Ofen ist bereit', greet: (n: string) => `Guten Tag ${n},`, intro: 'vielen Dank für Ihr Interesse. Hier ist unser Angebot für den Ofen aus unserer Kollektion <strong>Sofort Lieferbar</strong>.', diameter: 'Durchmesser', coating: 'Beschichtung', fuel: 'Brennstoff', price: 'Preis', shipping: 'Versand inklusive', gallery: 'Fotos Ihres Ofens', view: 'Angebot online ansehen', pdf: 'Angebot als PDF herunterladen', ctaText: 'Möchten Sie mit unserem Export Manager Gennaro Caglione sprechen?', cta: 'Gespräch buchen', contact: 'Bei Fragen:', inclusion: 'Versand inklusive', offerTitle: (m: string) => `Sofort lieferbar · ${m}` },
  es: { subject: (m: string) => `Tu oferta Listo para Envío — ${m}`, title: 'Tu horno está listo', greet: (n: string) => `Hola ${n},`, intro: 'gracias por tu interés. Te enviamos nuestra oferta para el horno que elegiste de la colección <strong>Listo para Envío</strong>.', diameter: 'Diámetro', coating: 'Revestimiento', fuel: 'Combustible', price: 'Precio', shipping: 'Envío incluido', gallery: 'Las fotos de tu horno', view: 'Ver la oferta online', pdf: 'Descargar la oferta en PDF', ctaText: '¿Quieres hablarlo con nuestro Export Manager Gennaro Caglione?', cta: 'Reservar una llamada', contact: 'Para cualquier pregunta:', inclusion: 'Envío incluido', offerTitle: (m: string) => `Listo para envío · ${m}` },
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
    const price = Number(rts.sale_price || rts.list_price || 0)
    const images: string[] = (rts.images || []).map((i: string) => i.startsWith('http') ? i : SITE + i)

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
      language: lang, currency: 'EUR', price_list: settings.price_list,
      company_entity: lang === 'en' ? 'wise' : settings.company_entity, vat_regime: settings.vat_regime, valid_until: valid,
      payment_method: settings.payment_method, payment_agreement: settings.payment_agreement,
      include_certification: settings.include_certification, include_warranty: settings.include_warranty, warranty_years: settings.warranty_years,
      inclusions: [settings.inclusions, t.inclusion].filter(Boolean).join('\n'), exclusions: settings.exclusions,
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
      document, amount: offerTotals(document).subtotal, currency: 'EUR', public_enabled: true,
    }).select('id,number,public_code').single()
    if (offerErr) throw offerErr
    const offerUrl = `${SITE}/offerta/${offer.public_code}`
    const pdfUrl = `${offerUrl}?pdf=1`

    await supabase.from('website_leads').insert({
      first_name: firstName, last_name: lastName, email, phone, city: city || null,
      oven_type: `${rts.model_name} (${rts.diameter}cm - ${rts.coating || 'N/A'})`, form_type: 'ready_to_ship',
      notes: `Offerta auto-generata: ${offer.number}`, metadata: { ready_to_ship_oven_id: readyToShipOvenId, offer_id: offer.id, offer_number: offer.number },
    })

    const priceTxt = `€ ${price.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
    const gallery = images.slice(0, 7).map((u, i) => `<img src="${esc(u)}" alt="${esc(model)}" style="${i === 0 ? 'width:100%;margin:0 0 8px' : 'width:48%;margin:1%'};border-radius:6px">`).join('')
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(t.subject(model))}</title></head>
<body style="margin:0;background:#f5f2ee;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#2b2b2b;line-height:1.6">
<div style="max-width:600px;margin:0 auto;background:#fff">
  <div style="background:linear-gradient(135deg,#d97706,#ea580c);color:#fff;padding:32px;text-align:center">
    <img src="${SITE}/lovable-uploads/vesuviano-logo-bianco.png" alt="Vesuviano" style="width:150px;margin-bottom:12px">
    <h1 style="margin:0;font-size:24px">${t.title}</h1>
  </div>
  <div style="padding:32px">
    <p>${esc(t.greet(customerName))}</p><p>${t.intro}</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin:20px 0">
      <h3 style="margin:0 0 8px">${esc(model)}</h3>
      <p style="margin:0">${esc(specs)}</p>
      <p style="margin:10px 0 0;font-size:18px"><strong>${t.price}: ${priceTxt}</strong> · ${t.shipping}</p>
      <p style="margin:10px 0 0;font-size:14px">📄 <a href="${offerUrl}" style="color:#b45309">${t.view}</a> &nbsp;·&nbsp; 📎 <a href="${pdfUrl}" style="color:#b45309">${t.pdf}</a> (${esc(offer.number)})</p>
    </div>
    ${gallery ? `<p style="font-weight:600;margin:10px 0 6px">${t.gallery}</p><div>${gallery}</div>` : ''}
    <div style="text-align:center;margin:30px 0 10px">
      <p style="margin:0 0 14px">${t.ctaText}</p>
      <a href="${BOOKING_URL}" style="display:inline-block;background:#d97706;color:#fff;padding:16px 40px;text-decoration:none;border-radius:8px;font-size:18px;font-weight:700">📞 ${t.cta}</a>
    </div>
    <p style="font-size:14px;color:#555">${t.contact} info@vesuvianoforni.com · +39 081 19231684</p>
  </div>
  <div style="background:#1f2937;color:#fff;padding:20px;text-align:center;font-size:13px">© ${new Date().getFullYear()} Vesuviano Forni</div>
</div></body></html>`

    const sent = await resend.emails.send({ from: 'Vesuviano Forni <noreply@vesuvianoforni.com>', to: [email], reply_to: 'info@vesuvianoforni.com', subject: t.subject(model), html })
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
      from: 'Sistema Pronta Consegna <system@vesuvianoforni.com>', to: ['info@vesuvianoforni.com', 'commerciale@vesuviano.it'],
      subject: `🏷️ Nuova Richiesta Pronta Consegna: ${customerName} - ${model}`,
      html: `<h2>Nuova richiesta Pronta Consegna</h2><p>Offerta inviata automaticamente: <a href="${offerUrl}">${esc(offer.number)}</a></p>
<p><b>Nome:</b> ${esc(customerName)}<br><b>Email:</b> ${esc(email)}<br><b>Telefono:</b> ${esc(phone)}<br>${city ? `<b>Città:</b> ${esc(city)}<br>` : ''}
<b>Forno:</b> ${esc(model)} Ø${esc(rts.diameter)}cm · ${esc(rts.coating || 'N/A')}<br><b>Prezzo:</b> ${priceTxt}</p>`,
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
