import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { url, bucket, path } = await req.json();
    if (!url || !bucket || !path) {
      return new Response(JSON.stringify({ error: 'missing url/bucket/path' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Check if already uploaded
    const { data: existing } = await supabase.storage.from(bucket).list(path.split('/').slice(0, -1).join('/') || '', {
      search: path.split('/').pop(),
    });
    if (existing && existing.some((f: any) => f.name === path.split('/').pop())) {
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      return new Response(JSON.stringify({ ok: true, skipped: true, publicUrl: pub.publicUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resp = await fetch(url);
    if (!resp.ok) {
      const body = await resp.text();
      return new Response(JSON.stringify({ error: `fetch failed ${resp.status}`, body: body.slice(0, 200) }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const contentType = resp.headers.get('content-type') || 'application/octet-stream';
    const buf = new Uint8Array(await resp.arrayBuffer());

    const { error } = await supabase.storage.from(bucket).upload(path, buf, {
      contentType, upsert: true, cacheControl: '31536000',
    });
    if (error) throw error;

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    return new Response(JSON.stringify({ ok: true, publicUrl: pub.publicUrl, size: buf.byteLength, contentType }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
