import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const crmWebhookUrl = Deno.env.get('CRM_WEBHOOK_URL')
    const erpWebhookUrl = Deno.env.get('ERP_WEBHOOK_URL')

    if (!crmWebhookUrl && !erpWebhookUrl) {
      return new Response(JSON.stringify({ error: 'No webhook URLs configured' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch all leads
    const { data: leads, error } = await supabase
      .from('website_leads')
      .select('*')
      .neq('form_type', 'health_check')
      .order('created_at', { ascending: true })

    if (error) throw error

    console.log(`Found ${leads?.length || 0} leads to sync`)

    let successCount = 0
    let failCount = 0

    // Send in batches of 5 concurrently
    const batchSize = 5
    for (let i = 0; i < (leads?.length || 0); i += batchSize) {
      const batch = leads!.slice(i, i + batchSize)
      const promises = batch.map(async (lead) => {
        const payload = {
          id: lead.id,
          source: 'vesuviano_website',
          event_type: 'bulk_sync',
          form_type: lead.form_type,
          first_name: lead.first_name,
          last_name: lead.last_name,
          customer_name: [lead.first_name, lead.last_name].filter(Boolean).join(' ') || null,
          email: lead.email,
          phone: lead.phone,
          city: lead.city,
          company: lead.company,
          website: lead.website,
          oven_type: lead.oven_type,
          notes: lead.notes,
          metadata: lead.metadata,
          created_at: lead.created_at,
          timestamp: new Date().toISOString()
        }

        try {
          const targetUrl = erpWebhookUrl || crmWebhookUrl
          const res = await fetch(targetUrl!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          if (res.ok) {
            successCount++
          } else {
            const text = await res.text()
            console.error(`Failed lead ${lead.id}: ${res.status} ${text}`)
            failCount++
          }
          // Always consume body
          if (res.ok) await res.text().catch(() => {})
        } catch (err) {
          console.error(`Error sending lead ${lead.id}:`, err)
          failCount++
        }
      })
      await Promise.all(promises)
    }

    console.log(`Sync complete: ${successCount} success, ${failCount} failed`)

    return new Response(JSON.stringify({
      success: true,
      total: leads?.length || 0,
      sent: successCount,
      failed: failCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Sync error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
