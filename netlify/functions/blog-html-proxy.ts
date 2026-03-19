const SUPABASE_RENDER_URL = "https://lgueucxznbqgvhpjzurf.supabase.co/functions/v1/render-blog-post";
const SUPPORTED_LANGS = new Set(["it", "en", "fr", "de", "es"]);

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "content-length",
  "content-encoding",
]);

type NetlifyEvent = {
  queryStringParameters?: Record<string, string | undefined>;
};

type NetlifyResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

function buildHtmlError(statusCode: number, message: string): NetlifyResponse {
  return {
    statusCode,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
    body: `<!DOCTYPE html><html><body><h1>${statusCode} - ${message}</h1></body></html>`,
  };
}

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  try {
    const langRaw = event.queryStringParameters?.lang ?? "it";
    const slug = event.queryStringParameters?.slug;

    if (!slug) {
      return buildHtmlError(400, "Missing slug");
    }

    const lang = SUPPORTED_LANGS.has(langRaw) ? langRaw : "it";

    const upstreamUrl = new URL(SUPABASE_RENDER_URL);
    upstreamUrl.searchParams.set("lang", lang);
    upstreamUrl.searchParams.set("slug", slug);

    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const htmlBody = await upstreamResponse.text();
    const headers: Record<string, string> = {};

    upstreamResponse.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    headers["Content-Type"] = "text/html; charset=utf-8";
    headers["X-Content-Type-Options"] = "nosniff";

    return {
      statusCode: upstreamResponse.status,
      headers,
      body: htmlBody,
    };
  } catch (error) {
    console.error("blog-html-proxy error", error);
    return buildHtmlError(500, "Internal Server Error");
  }
};
