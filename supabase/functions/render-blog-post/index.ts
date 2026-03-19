import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DOMAIN = "https://vesuvianoforni.com";
const LANGS = ["it", "en", "fr", "de", "es"];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getField(post: Record<string, unknown>, field: string, lang: string): string {
  return (post[`${field}_${lang}`] as string) || (post[`${field}_it`] as string) || "";
}

function buildHtml(post: Record<string, unknown>, lang: string, slug: string): string {
  const title = getField(post, "title", lang);
  const description = getField(post, "meta_description", lang) || title;
  const content = getField(post, "content", lang);
  const articleUrl = `${DOMAIN}/${lang}/blog/${slug}`;
  const image = (post.featured_image as string) || `${DOMAIN}/lovable-uploads/vesuviano-social-banner.jpg`;
  const logoUrl = `${DOMAIN}/lovable-uploads/255a7344-f5ab-411b-8b37-6ed61e01d472.png`;

  const ogLocaleMap: Record<string, string> = {
    it: "it_IT", en: "en_US", fr: "fr_FR", de: "de_DE", es: "es_ES",
  };

  const hreflangLinks = LANGS.map((l) => {
    const altSlug = getField(post, "slug", l);
    return `<link rel="alternate" hreflang="${l}" href="${DOMAIN}/${l}/blog/${altSlug}" />`;
  }).join("\n    ");

  const xDefaultSlug = getField(post, "slug", "it");

  const articleLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image,
    author: { "@type": "Organization", name: (post.author as string) || "Vesuviano" },
    publisher: {
      "@type": "Organization",
      name: "Vesuviano Forni",
      logo: { "@type": "ImageObject", url: logoUrl },
    },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    mainEntityOfPage: articleUrl,
    inLanguage: lang,
  });

  const breadcrumbLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${DOMAIN}/${lang}` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${DOMAIN}/${lang}/blog` },
      { "@type": "ListItem", position: 3, name: title, item: articleUrl },
    ],
  });

  const readMoreLabels: Record<string, string> = {
    it: "Torna al Blog", en: "Back to Blog", fr: "Retour au Blog",
    de: "Zurück zum Blog", es: "Volver al Blog",
  };

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} - Vesuviano</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${articleUrl}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:site_name" content="Vesuviano Forni" />
    <meta property="og:locale" content="${ogLocaleMap[lang] || "it_IT"}" />
    ${post.published_at ? `<meta property="article:published_time" content="${post.published_at}" />` : ""}
    ${post.updated_at ? `<meta property="article:modified_time" content="${post.updated_at}" />` : ""}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${image}" />
    <link rel="canonical" href="${articleUrl}" />
    ${hreflangLinks}
    <link rel="alternate" hreflang="x-default" href="${DOMAIN}/it/blog/${xDefaultSlug}" />
    <script type="application/ld+json">${articleLd}</script>
    <script type="application/ld+json">${breadcrumbLd}</script>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;background:#faf9f7;color:#1a1a1a;line-height:1.8}.header{background:#1a1a1a;padding:16px 24px;text-align:center}.header a{color:#fff;text-decoration:none;font-size:1.1rem;font-weight:bold}.hero-img{width:100%;max-height:480px;object-fit:cover}.container{max-width:780px;margin:0 auto;padding:32px 20px}.breadcrumb{font-size:.85rem;color:#888;margin-bottom:20px}.breadcrumb a{color:#c75b2a;text-decoration:none}h1{font-size:2.2rem;line-height:1.25;margin-bottom:16px}.meta{font-size:.85rem;color:#888;margin-bottom:32px}.content{font-size:1.08rem}.content h2{font-size:1.5rem;margin:32px 0 12px}.content h3{font-size:1.25rem;margin:24px 0 8px}.content p{margin-bottom:16px}.content ul,.content ol{margin:0 0 16px 24px}.content img{max-width:100%;border-radius:8px;margin:16px 0}.back-link{display:inline-block;margin-top:40px;color:#c75b2a;font-weight:bold;text-decoration:none}.footer{background:#1a1a1a;color:#aaa;text-align:center;padding:24px;margin-top:60px;font-size:.85rem}
    </style>
</head>
<body>
    <header class="header"><a href="${DOMAIN}/${lang}">Vesuviano Forni</a></header>
    ${image ? `<img class="hero-img" src="${image}" alt="${escapeHtml(title)}" />` : ""}
    <main class="container">
      <nav class="breadcrumb">
        <a href="${DOMAIN}/${lang}">Home</a> &rsaquo;
        <a href="${DOMAIN}/${lang}/blog">Blog</a> &rsaquo;
        <span>${escapeHtml(title)}</span>
      </nav>
      <article>
        <h1>${escapeHtml(title)}</h1>
        <div class="meta">
          ${post.published_at ? new Date(post.published_at as string).toLocaleDateString(lang) : ""} 
          ${post.author ? `&middot; ${escapeHtml(post.author as string)}` : ""}
        </div>
        <div class="content">${content}</div>
      </article>
      <a class="back-link" href="${DOMAIN}/${lang}/blog">&larr; ${readMoreLabels[lang] || readMoreLabels.it}</a>
    </main>
    <footer class="footer">&copy; ${new Date().getFullYear()} Vesuviano Forni. All rights reserved.</footer>
</body>
</html>`;
}

function htmlResponse(body: string, status = 200, extraHeaders: Record<string, string> = {}): Response {
  const headers = new Headers({
    "Content-Type": "text/html; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    ...extraHeaders,
  });
  return new Response(body, { status, headers });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "it";
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return htmlResponse("<html><body><h1>400 - Missing slug</h1></body></html>", 400);
    }

    if (!LANGS.includes(lang)) {
      return htmlResponse("<html><body><h1>400 - Invalid language</h1></body></html>", 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq(`slug_${lang}`, slug)
      .eq("is_published", true)
      .single();

    if (error || !post) {
      return htmlResponse("<html><body><h1>404 - Post not found</h1></body></html>", 404);
    }

    const html = buildHtml(post, lang, slug);

    return htmlResponse(html, 200, {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    });
  } catch (err) {
    console.error("Render blog post error:", err);
    return htmlResponse("<html><body><h1>500 - Internal Server Error</h1></body></html>", 500);
  }
});
