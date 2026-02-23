import { useEffect } from 'react';
import { BlogPost, getLocalizedField } from '@/hooks/useBlogPosts';

interface BlogSEOProps {
  post?: BlogPost;
  lang: string;
  isList?: boolean;
}

const LANG_HREFLANG: Record<string, string> = {
  it: 'it',
  en: 'en',
  fr: 'fr',
  de: 'de',
  es: 'es',
};

const getBlogPath = (lang: string) => {
  const paths: Record<string, string> = {
    it: '/it/blog',
    en: '/en/blog',
    fr: '/fr/blog',
    de: '/de/blog',
    es: '/es/blog',
  };
  return paths[lang] || paths.it;
};

const setOrCreateMeta = (property: string, content: string, isName = false) => {
  const attr = isName ? 'name' : 'property';
  let el = document.querySelector(`meta[${attr}="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const BlogSEO = ({ post, lang, isList }: BlogSEOProps) => {
  useEffect(() => {
    const baseUrl = 'https://www.vesuvianoforni.com';

    // Clean up previous SEO tags
    document.querySelectorAll('link[rel="alternate"][hreflang][data-blog]').forEach(el => el.remove());
    document.querySelectorAll('link[rel="canonical"][data-blog]').forEach(el => el.remove());
    document.querySelectorAll('script[type="application/ld+json"][data-blog]').forEach(el => el.remove());

    if (isList) {
      // Blog list page SEO
      document.title = lang === 'it' ? 'Blog - Vesuviano Forni' : `Blog - Vesuviano Ovens`;

      const listDesc = lang === 'it'
        ? 'Articoli, guide e ricette sui forni napoletani artigianali. Scopri consigli tecnici e novità dal mondo Vesuviano.'
        : 'Articles, guides and recipes about Neapolitan artisan ovens. Discover technical tips and news from Vesuviano.';
      setOrCreateMeta('description', listDesc, true);
      setOrCreateMeta('og:title', document.title);
      setOrCreateMeta('og:description', listDesc);
      setOrCreateMeta('og:type', 'website');
      setOrCreateMeta('og:url', `${baseUrl}${getBlogPath(lang)}`);
      setOrCreateMeta('og:image', `${baseUrl}/lovable-uploads/vesuviano-social-banner.jpg`);

      // Canonical
      const canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = `${baseUrl}${getBlogPath(lang)}`;
      canonical.setAttribute('data-blog', 'true');
      document.head.appendChild(canonical);

      // Hreflang for list
      Object.entries(LANG_HREFLANG).forEach(([l, hl]) => {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = hl;
        link.href = `${baseUrl}${getBlogPath(l)}`;
        link.setAttribute('data-blog', 'true');
        document.head.appendChild(link);
      });

      return;
    }

    if (!post) return;

    const title = getLocalizedField(post, 'title', lang);
    const description = getLocalizedField(post, 'meta_description', lang) || title;
    const slug = getLocalizedField(post, 'slug', lang);
    const articleUrl = `${baseUrl}/${lang}/blog/${slug}`;
    const image = post.featured_image || `${baseUrl}/lovable-uploads/vesuviano-social-banner.jpg`;

    // Title & meta description
    document.title = `${title} - Vesuviano`;
    setOrCreateMeta('description', description, true);

    // OG tags
    setOrCreateMeta('og:title', title);
    setOrCreateMeta('og:description', description);
    setOrCreateMeta('og:type', 'article');
    setOrCreateMeta('og:url', articleUrl);
    setOrCreateMeta('og:image', image);
    setOrCreateMeta('og:site_name', 'Vesuviano Forni');
    setOrCreateMeta('og:locale', lang === 'it' ? 'it_IT' : lang === 'en' ? 'en_US' : lang === 'fr' ? 'fr_FR' : lang === 'de' ? 'de_DE' : 'es_ES');
    if (post.published_at) {
      setOrCreateMeta('article:published_time', post.published_at);
    }
    if (post.updated_at) {
      setOrCreateMeta('article:modified_time', post.updated_at);
    }

    // Twitter tags
    setOrCreateMeta('twitter:card', 'summary_large_image', true);
    setOrCreateMeta('twitter:title', title, true);
    setOrCreateMeta('twitter:description', description, true);
    setOrCreateMeta('twitter:image', image, true);

    // Canonical URL
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = articleUrl;
    canonical.setAttribute('data-blog', 'true');
    document.head.appendChild(canonical);

    // Hreflang tags
    Object.entries(LANG_HREFLANG).forEach(([l, hl]) => {
      const altSlug = getLocalizedField(post, 'slug', l);
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = hl;
      link.href = `${baseUrl}/${l}/blog/${altSlug}`;
      link.setAttribute('data-blog', 'true');
      document.head.appendChild(link);
    });

    // x-default hreflang
    const xDefault = document.createElement('link');
    xDefault.rel = 'alternate';
    xDefault.hreflang = 'x-default';
    xDefault.href = `${baseUrl}/it/blog/${post.slug_it}`;
    xDefault.setAttribute('data-blog', 'true');
    document.head.appendChild(xDefault);

    // JSON-LD Article schema
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: description,
      image: image,
      author: {
        '@type': 'Organization',
        name: post.author || 'Vesuviano',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Vesuviano Forni',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/lovable-uploads/255a7344-f5ab-411b-8b37-6ed61e01d472.png`,
        },
      },
      datePublished: post.published_at,
      dateModified: post.updated_at,
      mainEntityOfPage: articleUrl,
      inLanguage: lang,
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-blog', 'true');
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    // Breadcrumb JSON-LD
    const breadcrumbLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/${lang}` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/${lang}/blog` },
        { '@type': 'ListItem', position: 3, name: title, item: articleUrl },
      ],
    };

    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.setAttribute('data-blog', 'true');
    breadcrumbScript.textContent = JSON.stringify(breadcrumbLd);
    document.head.appendChild(breadcrumbScript);

    return () => {
      document.querySelectorAll('link[rel="alternate"][hreflang][data-blog]').forEach(el => el.remove());
      document.querySelectorAll('link[rel="canonical"][data-blog]').forEach(el => el.remove());
      document.querySelectorAll('script[type="application/ld+json"][data-blog]').forEach(el => el.remove());
    };
  }, [post, lang, isList]);

  return null;
};

export default BlogSEO;
