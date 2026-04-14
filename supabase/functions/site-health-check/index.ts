import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ALERT_EMAIL = 'stanislaoelefante@gmail.com'
const SITE_URL = 'https://vesuvianoforni.com'
const SUPABASE_HEALTH_URL = 'https://lgueucxznbqgvhpjzurf.supabase.co/rest/v1/'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const issues: string[] = []

  // 1. Check if the website is reachable (with retry to avoid false positives)
  let siteOk = false
  let lastSiteError = ''
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 20000)
      const siteRes = await fetch(SITE_URL, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'VesuvianoHealthCheck/1.0',
          'Accept': 'text/html',
        },
        redirect: 'follow',
      })
      clearTimeout(timeout)
      
      if (siteRes.ok) {
        siteOk = true
        break
      } else {
        lastSiteError = `HTTP ${siteRes.status} ${siteRes.statusText}`
      }
    } catch (err) {
      lastSiteError = err instanceof Error ? err.message : String(err)
    }
    // Wait 5s before retry
    if (attempt < 3) await new Promise(r => setTimeout(r, 5000))
  }
  if (!siteOk) {
    issues.push(`🔴 Sito web DOWN dopo 3 tentativi - Ultimo errore: ${lastSiteError}`)
  }

  // 2. Check Supabase database connectivity
  try {
    const { error } = await supabase.from('website_leads').select('id').limit(1)
    if (error) {
      issues.push(`⚠️ Database Supabase non raggiungibile - Errore: ${error.message}`)
    }
  } catch (err) {
    issues.push(`🔴 Database Supabase DOWN - Errore: ${err instanceof Error ? err.message : String(err)}`)
  }

  // 3. Check Supabase storage (egress quota issue detection)
  try {
    const { data, error } = await supabase.storage.from('oven-gallery').list('', { limit: 1 })
    if (error) {
      issues.push(`⚠️ Storage Supabase non funzionante - Errore: ${error.message}`)
    }
  } catch (err) {
    issues.push(`🔴 Storage Supabase DOWN - Errore: ${err instanceof Error ? err.message : String(err)}`)
  }

  // 4. Check if form submissions work (test write capability)
  try {
    const testDate = new Date().toISOString()
    const { error: writeError } = await supabase
      .from('website_leads')
      .insert({
        form_type: 'health_check',
        first_name: 'HEALTH_CHECK',
        last_name: 'AUTO_DELETE',
        email: 'healthcheck@test.internal',
        status: 'test'
      })
      .select('id')
      .single()

    if (writeError) {
      issues.push(`🔴 CRITICO: Database in SOLA LETTURA - I form non possono salvare dati! Errore: ${writeError.message}`)
    } else {
      // Clean up test entry
      await supabase
        .from('website_leads')
        .delete()
        .eq('form_type', 'health_check')
        .eq('first_name', 'HEALTH_CHECK')
    }
  } catch (err) {
    issues.push(`🔴 CRITICO: Impossibile scrivere nel database - Errore: ${err instanceof Error ? err.message : String(err)}`)
  }

  console.log(`Health check completed. Issues found: ${issues.length}`)

  // Send alert email if there are issues
  if (issues.length > 0) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><title>Alert Vesuviano</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px; text-align: center;">
              <h1>🚨 Alert Sistema Vesuviano</h1>
              <p>Sono state rilevate anomalie sul sito</p>
            </div>
            
            <div style="background: white; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px; margin-top: 15px;">
              <h2>Problemi rilevati:</h2>
              <ul style="list-style: none; padding: 0;">
                ${issues.map(i => `<li style="padding: 10px; margin: 8px 0; background: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;">${i}</li>`).join('')}
              </ul>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 20px;">
                <strong>⚡ Azione richiesta:</strong> Verificare immediatamente lo stato dei servizi.
                <br><br>
                <a href="https://supabase.com/dashboard/project/lgueucxznbqgvhpjzurf" style="color: #d97706;">Dashboard Supabase</a> |
                <a href="${SITE_URL}" style="color: #d97706;">Sito Web</a>
              </div>
            </div>
            
            <div style="text-align: center; padding: 15px; color: #6b7280; font-size: 12px; margin-top: 15px;">
              <p>Controllo automatico eseguito il ${new Date().toLocaleString('it-IT')}</p>
              <p>Sistema di Monitoraggio Vesuviano Forni</p>
            </div>
          </div>
        </body>
      </html>
    `

    try {
      await resend.emails.send({
        from: 'Sistema Alert <system@vesuvianoforni.com>',
        to: [ALERT_EMAIL],
        subject: `🚨 ALERT: ${issues.length} anomalia/e rilevate su Vesuviano Forni`,
        html: htmlContent,
      })
      console.log('Alert email sent successfully')
    } catch (emailErr) {
      console.error('Failed to send alert email:', emailErr)
    }
  }

  return new Response(
    JSON.stringify({
      status: issues.length === 0 ? 'healthy' : 'unhealthy',
      issues,
      checked_at: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
})
