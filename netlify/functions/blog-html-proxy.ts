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
  path?: string;
  rawUrl?: string;
  queryStringParameters?: Record<string, string | undefined>;
};

type NetlifyResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

// Parse lang and slug from the original request path: /:lang/blog/:slug
const BLOG_PATH_RE = /^\/(it|en|fr|de|es)\/blog\/([^/?#]+)/;

function parseFromPath(event: NetlifyEvent): { lang: string; slug: string } | null {
  const path = event.path || "";
  const match = path.match(BLOG_PATH_RE);
  if (match) {
    return { lang: match[1], slug: match[2] };
  }
  // Try rawUrl as fallback
  if (event.rawUrl) {
    try {
      const url = new URL(event.rawUrl);
      const m = url.pathname.match(BLOG_PATH_RE);
      if (m) return { lang: m[1], slug: m[2] };
    } catch { /* ignore */ }
  }
  return null;
}

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
    // Try query params first (from _redirects interpolation), then fallback to path parsing
    let lang = event.queryStringParameters?.lang;
    let slug = event.queryStringParameters?.slug;

    // If slug is missing or is literally ":slug" (not interpolated), parse from path
    if (!slug || slug === ":slug") {
      const parsed = parseFromPath(event);
      if (parsed) {
        lang = parsed.lang;
        slug = parsed.slug;
      }
    }

    if (!slug) {
      console.error("blog-html-proxy: no slug found", {
        path: event.path,
        rawUrl: event.rawUrl,
        qsp: event.queryStringParameters,
      });
      return buildHtmlError(400, "Missing slug");
    }

    const safeLang = lang && SUPPORTED_LANGS.has(lang) ? lang : "it";

    const upstreamUrl = new URL(SUPABASE_RENDER_URL);
    upstreamUrl.searchParams.set("lang", safeLang);
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
