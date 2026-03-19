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

const BLOCKED_UPSTREAM_HEADERS = new Set([
  "content-type",
  "x-content-type-options",
  "x-served-by",
  "x-sb-edge-region",
  "sb-gateway-version",
  "sb-project-ref",
  "sb-request-id",
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
      "content-type": "text/html; charset=utf-8",
      "x-content-type-options": "nosniff",
      "cache-control": "no-store",
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
      const normalizedKey = key.toLowerCase();
      if (HOP_BY_HOP_HEADERS.has(normalizedKey)) return;
      if (BLOCKED_UPSTREAM_HEADERS.has(normalizedKey)) return;
      headers[normalizedKey] = value;
    });

    headers["content-type"] = "text/html; charset=utf-8";
    headers["x-content-type-options"] = "nosniff";

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
