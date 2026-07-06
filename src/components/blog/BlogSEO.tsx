import { BlogPost, getLocalizedField } from '@/hooks/useBlogPosts';
import SEOHead from '@/components/SEOHead';
import { LANGS, type AlternatesMap, type Lang } from '@/lib/hreflang';

interface BlogSEOProps {
  post?: BlogPost;
  lang: string;
  isList?: boolean;
}

const BASE_URL = 'https://vesuvianoforni.com';

const getBlogPath = (lang: string) => {
  const paths: Record<string, string> = {
    it: '/it/blog', en: '/en/blog', fr: '/fr/blog', de: '/de/blog', es: '/es/blog',
  };
  return paths[lang] || paths.it;
};

const BlogSEO = ({ post, lang, isList }: BlogSEOProps) => {
  if (isList) {
    const title = lang === 'it' ? 'Blog - Vesuviano Forni' : 'Blog - Vesuviano Ovens';
    const description = lang === 'it'
      ? 'Articoli, guide e ricette sui forni napoletani artigianali. Scopri consigli tecnici e novità dal mondo Vesuviano.'
      : 'Articles, guides and recipes about Neapolitan artisan ovens. Discover technical tips and news from Vesuviano.';
    return (
      <SEOHead
        title={title}
        description={description}
        canonical={getBlogPath(lang)}
        lang={lang}
      />
    );
  }

  if (!post) return null;

  const title = getLocalizedField(post, 'title', lang);
  const description = getLocalizedField(post, 'meta_description', lang) || title;
  const slug = getLocalizedField(post, 'slug', lang);
  const articleUrl = `${BASE_URL}/${lang}/blog/${slug}`;
  const image = post.featured_image || `${BASE_URL}/lovable-uploads/vesuviano-social-banner.jpg`;

  // Build hreflang alternates from per-language slugs on this post
  const alternates: AlternatesMap = LANGS.reduce((acc, l) => {
    const s = getLocalizedField(post, 'slug', l);
    acc[l] = s ? `/${l}/blog/${s}` : `/${l}/blog`;
    return acc;
  }, {} as AlternatesMap);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image,
    author: { '@type': 'Organization', name: post.author || 'Vesuviano' },
    publisher: {
      '@type': 'Organization',
      name: 'Vesuviano Forni',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/lovable-uploads/255a7344-f5ab-411b-8b37-6ed61e01d472.png` },
    },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    mainEntityOfPage: articleUrl,
    inLanguage: lang,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/${lang}` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/${lang}/blog` },
      { '@type': 'ListItem', position: 3, name: title, item: articleUrl },
    ],
  };

  return (
    <SEOHead
      title={`${title} - Vesuviano`}
      description={description}
      canonical={articleUrl}
      ogImage={image}
      ogType="article"
      lang={lang}
      schemaJson={[articleSchema, breadcrumbSchema]}
    />
  );
};

export default BlogSEO;
