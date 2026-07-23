// netlify/edge-functions/lovablehtml.js (Netlify Edge Function)
export default async (request, context) => {
  // Only handle public GET navigations.
  // Treat missing/empty Accept and bare '*/*' as HTML so crawler tests
  // (curl without -H, default fetch) still route through prerender.
  // Asset requests from browsers send specific Accept (e.g. 'text/css,*/*;q=0.1')
  // so they won't match.
  const accept = (request.headers.get('accept') || '').trim();
  const isHtmlRequest = !accept || accept === '*/*' || accept.includes('text/html');
  if (request.method !== 'GET' || !isHtmlRequest) return context.next();




  const apiKey = Deno.env.get('LOVABLEHTML_API_KEY') || '';
  const headers = {
    'x-lovablehtml-api-key': apiKey,
    accept: 'text/html',
    'accept-language': request.headers.get('accept-language') || '',
    'sec-fetch-mode': request.headers.get('sec-fetch-mode') || '',
    'sec-fetch-site': request.headers.get('sec-fetch-site') || '',
    'sec-fetch-dest': request.headers.get('sec-fetch-dest') || '',
    'sec-fetch-user': request.headers.get('sec-fetch-user') || '',
    'upgrade-insecure-requests': request.headers.get('upgrade-insecure-requests') || '',
    referer: request.headers.get('referer') || '',
    'user-agent': request.headers.get('user-agent') || '',
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const r = await fetch('https://encited.com/api/prerender/render?url=' + encodeURIComponent(request.url), { headers, signal: controller.signal });
    clearTimeout(timeout);

    // 301 = configured redirect rule matched — forward to client
    if (r.status === 301) {
      const loc = r.headers.get('location');
      if (loc) {
        return new Response(null, {
          status: 301,
          headers: { location: loc, 'cache-control': 'no-store' },
        });
      }
    }

    // 304 = not pre-rendered, pass through to origin
    if (r.status === 304) {
      return context.next();
    }

    if ((r.headers.get('content-type') || '').includes('text/html')) {
      return new Response(await r.text(), { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }

    return context.next();
  } catch (err) {
    // Prerender service unreachable/timeout — never crash the edge; fall back to origin.
    console.error('lovablehtml prerender failed:', err && err.message);
    return context.next();
  }
};

export const config = {
  path: "/*",
};
