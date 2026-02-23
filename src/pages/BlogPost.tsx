import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ArrowLeft, Tag, User } from 'lucide-react';
import Header from '@/components/Header';
import { useBlogPost, getLocalizedField } from '@/hooks/useBlogPosts';
import BlogSEO from '@/components/blog/BlogSEO';
import LazyImage from '@/components/LazyImage';
import WhatsAppButton from '@/components/WhatsAppButton';
import NotFound from './NotFound';

interface BlogPostProps {
  lang: string;
}

const BlogPostPage = ({ lang }: BlogPostProps) => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const { data: post, isLoading, error } = useBlogPost(slug || '', lang, isPreview);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-28 container mx-auto px-4 max-w-3xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-2/3" />
            <div className="h-64 bg-muted rounded-2xl" />
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-4/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return <NotFound />;
  }

  const title = getLocalizedField(post, 'title', lang);
  const content = getLocalizedField(post, 'content', lang);

  const backLabel: Record<string, string> = {
    it: 'Torna al blog',
    en: 'Back to blog',
    fr: 'Retour au blog',
    de: 'Zurück zum Blog',
    es: 'Volver al blog',
  };

  return (
    <div className="min-h-screen bg-background">
      <BlogSEO post={post} lang={lang} />
      <Header />

      <article className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Breadcrumb */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <Link
              to={`/${lang}/blog`}
              className="inline-flex items-center gap-2 text-vesuviano-600 hover:text-vesuviano-700 font-medium text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel[lang] || backLabel.it}
            </Link>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1 bg-vesuviano-50 text-vesuviano-700 px-3 py-1 rounded-full">
                <Tag className="h-3 w-3" />
                {post.category}
              </span>
              {post.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.published_at).toLocaleDateString(lang, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
              {post.author && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {post.author}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-playfair leading-tight">
              {title}
            </h1>
          </header>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-10 rounded-2xl overflow-hidden">
              <LazyImage
                src={post.featured_image}
                alt={title}
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-stone prose-lg max-w-none
              prose-headings:font-playfair prose-headings:text-foreground
              prose-a:text-vesuviano-600 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Language alternatives */}
          <div className="mt-16 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              {lang === 'it' ? 'Leggi in altre lingue:' : 'Read in other languages:'}
            </p>
            <div className="flex gap-3 flex-wrap">
              {(['it', 'en', 'fr', 'de', 'es'] as const).map((l) => {
                if (l === lang) return null;
                const altSlug = getLocalizedField(post, 'slug', l);
                return (
                  <Link
                    key={l}
                    to={`/${l}/blog/${altSlug}`}
                    className="text-sm px-3 py-1 rounded-full bg-stone-100 hover:bg-vesuviano-50 text-stone-600 hover:text-vesuviano-700 transition-colors"
                  >
                    {l.toUpperCase()}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </article>

      <WhatsAppButton />
    </div>
  );
};

export default BlogPostPage;
