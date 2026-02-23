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

const BlogSEO = ({ post, lang, isList }: BlogSEOProps) => {
  useEffect(() => {
    const baseUrl = window.location.origin;

    // Clean up previous SEO tags
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    document.querySelectorAll('link[rel="canonical"]').forEach(el => el.remove());
    document.querySelectorAll('script[type="application/ld+json"][data-blog]').forEach(el => el.remove());

    if (isList) {
      // Blog list page SEO
      document.title = lang === 'it' ? 'Blog - Vesuviano Forni' : `Blog - Vesuviano Ovens`;

      // Canonical
      const canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = `${baseUrl}${getBlogPath(lang)}`;
      document.head.appendChild(canonical);

      // Hreflang for list
      Object.entries(LANG_HREFLANG).forEach(([l, hl]) => {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = hl;
        link.href = `${baseUrl}${getBlogPath(l)}`;
        document.head.appendChild(link);
      });

      return;
    }

    if (!post) return;

    const title = getLocalizedField(post, 'title', lang);
    const description = getLocalizedField(post, 'meta_description', lang);

    // Title & meta description
    document.title = `${title} - Vesuviano`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);

    // Canonical URL
    const slug = getLocalizedField(post, 'slug', lang);
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = `${baseUrl}/${lang}/blog/${slug}`;
    document.head.appendChild(canonical);

    // Hreflang tags
    Object.entries(LANG_HREFLANG).forEach(([l, hl]) => {
      const altSlug = getLocalizedField(post, 'slug', l);
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = hl;
      link.href = `${baseUrl}/${l}/blog/${altSlug}`;
      document.head.appendChild(link);
    });

    // x-default hreflang
    const xDefault = document.createElement('link');
    xDefault.rel = 'alternate';
    xDefault.hreflang = 'x-default';
    xDefault.href = `${baseUrl}/it/blog/${post.slug_it}`;
    document.head.appendChild(xDefault);

    // JSON-LD Article schema
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: description,
      image: post.featured_image || `${baseUrl}/lovable-uploads/vesuviano-social-banner.jpg`,
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
      mainEntityOfPage: `${baseUrl}/${lang}/blog/${slug}`,
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
        { '@type': 'ListItem', position: 3, name: title, item: `${baseUrl}/${lang}/blog/${slug}` },
      ],
    };

    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.setAttribute('data-blog', 'true');
    breadcrumbScript.textContent = JSON.stringify(breadcrumbLd);
    document.head.appendChild(breadcrumbScript);

    return () => {
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
      document.querySelectorAll('link[rel="canonical"]').forEach(el => el.remove());
      document.querySelectorAll('script[type="application/ld+json"][data-blog]').forEach(el => el.remove());
    };
  }, [post, lang, isList]);

  return null;
};

export default BlogSEO;
