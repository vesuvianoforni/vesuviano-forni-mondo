const SUPABASE_RENDER_ENDPOINT = "https://lgueucxznbqgvhpjzurf.supabase.co/functions/v1/render-blog-post";
const SUPPORTED_LANGS = new Set(["it", "en", "fr", "de", "es"]);

function htmlErrorResponse(status: number, title: string): Response {
  return new Response(`<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><h1>${title}</h1></body></html>`, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export default async function blogHtmlProxy(request: Request): Promise<Response> {
  try {
    const requestUrl = new URL(request.url);
    const lang = requestUrl.searchParams.get("lang") ?? "it";
    const slug = requestUrl.searchParams.get("slug");

    if (!slug) {
      return htmlErrorResponse(400, "400 - Missing slug");
    }

    if (!SUPPORTED_LANGS.has(lang)) {
      return htmlErrorResponse(400, "400 - Invalid language");
    }

    const upstreamUrl = new URL(SUPABASE_RENDER_ENDPOINT);
    upstreamUrl.searchParams.set("lang", lang);
    upstreamUrl.searchParams.set("slug", slug);

    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
      },
    });

    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.set("Content-Type", "text/html; charset=utf-8");
    responseHeaders.set("X-Content-Type-Options", "nosniff");

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("blog-html-proxy error", error);
    return htmlErrorResponse(500, "500 - Internal Server Error");
  }
}
