import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ArrowLeft, Tag, User, Clock, Share2, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import { useBlogPost, getLocalizedField } from '@/hooks/useBlogPosts';
import BlogSEO from '@/components/blog/BlogSEO';
import LazyImage from '@/components/LazyImage';
import AIChatWidget from '@/components/chat/AIChatWidget';
import NotFound from './NotFound';

interface BlogPostProps {
  lang: string;
}

const categoryLabels: Record<string, Record<string, string>> = {
  general: { it: 'Generale', en: 'General', fr: 'Général', de: 'Allgemein', es: 'General' },
  guide: { it: 'Guide', en: 'Guides', fr: 'Guides', de: 'Anleitungen', es: 'Guías' },
  ricette: { it: 'Ricette', en: 'Recipes', fr: 'Recettes', de: 'Rezepte', es: 'Recetas' },
  novita: { it: 'Novità', en: 'News', fr: 'Nouveautés', de: 'Neuheiten', es: 'Novedades' },
  tecnica: { it: 'Tecnica', en: 'Technical', fr: 'Technique', de: 'Technik', es: 'Técnica' },
};

const readTimeLabels: Record<string, string> = {
  it: 'min di lettura', en: 'min read', fr: 'min de lecture', de: 'Min. Lesezeit', es: 'min de lectura',
};

const estimateReadTime = (html: string): number => {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

/**
 * Downgrade any <h1> inside article body HTML to <h2> so the page keeps
 * a single H1 (the article title rendered above the content).
 */
const normalizeContentHeadings = (html: string): string =>
  html
    .replace(/<h1(\s[^>]*)?>/gi, '<h2$1>')
    .replace(/<\/h1>/gi, '</h2>');

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
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-10 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="h-80 bg-muted rounded-2xl" />
            <div className="space-y-3 pt-6">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-4/6" />
              <div className="h-4 bg-muted rounded w-3/4" />
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
  const rawContent = getLocalizedField(post, 'content', lang);
  const content = normalizeContentHeadings(rawContent);
  const metaDesc = getLocalizedField(post, 'meta_description', lang);
  const readTime = estimateReadTime(content);
  const categoryLabel = categoryLabels[post.category]?.[lang] || post.category;

  const backLabel: Record<string, string> = {
    it: 'Blog', en: 'Blog', fr: 'Blog', de: 'Blog', es: 'Blog',
  };

  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({ title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <BlogSEO post={post} lang={lang} />
      <Header />

      {/* Preview banner */}
      {isPreview && !post.is_published && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-amber-950 text-center text-sm font-medium py-1.5">
          ⚠️ Anteprima bozza — questo articolo non è ancora pubblicato
        </div>
      )}

      <article className="pt-24 md:pt-28 pb-20">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 max-w-4xl">
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link to={`/${lang}`} className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/${lang}/blog`} className="hover:text-foreground transition-colors">
              {backLabel[lang] || 'Blog'}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{title}</span>
          </nav>
        </div>

        {/* Hero Section */}
        <header className="container mx-auto px-4 max-w-4xl mb-8 md:mb-12">
          {/* Category badge */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 bg-sage-50 text-sage-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-sage-200">
              <Tag className="h-3 w-3" />
              {categoryLabel}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-foreground font-playfair leading-[1.15] mb-6">
            {title}
          </h1>

          {/* Subtitle / Meta description */}
          {metaDesc && (
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 max-w-3xl">
              {metaDesc}
            </p>
          )}

          {/* Author bar */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground border-y border-border py-4">
            {post.author && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-earth-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-earth-500" />
                </div>
                <span className="font-medium text-foreground">{post.author}</span>
              </div>
            )}
            {post.published_at && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString(lang, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{readTime} {readTimeLabels[lang] || readTimeLabels.it}</span>
            </div>
            <button
              onClick={shareArticle}
              className="flex items-center gap-1.5 ml-auto hover:text-foreground transition-colors"
              aria-label="Share"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </header>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="container mx-auto px-4 max-w-4xl mb-10 md:mb-14">
            <figure className="rounded-2xl overflow-hidden shadow-lg">
              <LazyImage
                src={post.featured_image}
                alt={title}
                className="w-full h-auto max-h-[520px] object-cover"
              />
            </figure>
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 max-w-3xl">
          <div
            className="
              prose prose-lg max-w-none
              prose-headings:font-playfair prose-headings:text-foreground prose-headings:font-bold
              prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-3
              prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-8 prose-h3:mb-3
              prose-h4:text-lg prose-h4:md:text-xl prose-h4:mt-6 prose-h4:mb-2
              prose-p:text-foreground/85 prose-p:leading-[1.8] prose-p:text-base prose-p:md:text-[1.0625rem] prose-p:mb-5
              prose-a:text-sage-600 prose-a:font-medium prose-a:underline prose-a:underline-offset-2 prose-a:decoration-sage-300 hover:prose-a:decoration-sage-600 hover:prose-a:text-sage-700
              prose-strong:text-foreground prose-strong:font-semibold
              prose-blockquote:border-l-4 prose-blockquote:border-sage-400 prose-blockquote:bg-sage-50 prose-blockquote:rounded-r-lg prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-foreground/80
              prose-ul:my-4 prose-ol:my-4 prose-li:text-foreground/85 prose-li:leading-[1.8] prose-li:marker:text-sage-500
              prose-img:rounded-xl prose-img:shadow-md prose-img:my-8
              prose-hr:border-border prose-hr:my-10
              prose-table:border-collapse prose-th:bg-muted prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2 prose-td:border-b prose-td:border-border
              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-medium
              prose-pre:bg-foreground prose-pre:text-background prose-pre:rounded-xl
              prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-muted-foreground prose-figcaption:mt-2
            "
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Tags / Category CTA */}
          <div className="mt-14 pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              {/* Back to blog */}
              <Link
                to={`/${lang}/blog`}
                className="inline-flex items-center gap-2 text-sage-600 hover:text-sage-700 font-medium text-sm transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                {lang === 'it' ? 'Torna al blog' : lang === 'en' ? 'Back to blog' : lang === 'fr' ? 'Retour au blog' : lang === 'de' ? 'Zurück zum Blog' : 'Volver al blog'}
              </Link>

              {/* Language switcher */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">
                  {lang === 'it' ? 'Leggi in:' : 'Read in:'}
                </span>
                {(['it', 'en', 'fr', 'de', 'es'] as const).map((l) => {
                  if (l === lang) return null;
                  const altSlug = getLocalizedField(post, 'slug', l);
                  return (
                    <Link
                      key={l}
                      to={`/${l}/blog/${altSlug}`}
                      className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-sage-50 text-muted-foreground hover:text-sage-700 transition-colors font-medium"
                    >
                      {l.toUpperCase()}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 bg-earth-50 rounded-2xl p-6 md:p-8 text-center border border-earth-200">
            <h3 className="text-xl md:text-2xl font-playfair font-bold text-foreground mb-2">
              {lang === 'it' ? 'Hai bisogno di un forno professionale?' : 
               lang === 'en' ? 'Need a professional oven?' :
               lang === 'fr' ? 'Besoin d\'un four professionnel ?' :
               lang === 'de' ? 'Brauchen Sie einen professionellen Ofen?' :
               '¿Necesita un horno profesional?'}
            </h3>
            <p className="text-muted-foreground mb-5 max-w-lg mx-auto text-sm md:text-base">
              {lang === 'it' ? 'Scopri la nostra gamma di forni artigianali napoletani, realizzati a mano nel nostro laboratorio ai piedi del Vesuvio.' :
               lang === 'en' ? 'Discover our range of Neapolitan artisan ovens, handcrafted in our workshop at the foot of Vesuvius.' :
               lang === 'fr' ? 'Découvrez notre gamme de fours artisanaux napolitains, fabriqués à la main au pied du Vésuve.' :
               lang === 'de' ? 'Entdecken Sie unsere handgefertigten neapolitanischen Öfen am Fuße des Vesuvs.' :
               'Descubra nuestra gama de hornos artesanales napolitanos, hechos a mano al pie del Vesubio.'}
            </p>
            <Link
              to={`/${lang}`}
              className="inline-flex items-center gap-2 bg-earth-500 hover:bg-earth-600 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm"
            >
              {lang === 'it' ? 'Scopri i nostri forni' : 
               lang === 'en' ? 'Discover our ovens' :
               lang === 'fr' ? 'Découvrir nos fours' :
               lang === 'de' ? 'Unsere Öfen entdecken' :
               'Descubrir nuestros hornos'}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      <AIChatWidget />
    </div>
  );
};

export default BlogPostPage;
