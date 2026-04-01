import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ArrowRight } from 'lucide-react';
import { useBlogPosts, getLocalizedField } from '@/hooks/useBlogPosts';
import LazyImage from '@/components/LazyImage';

const labels: Record<string, { title: string; subtitle: string; cta: string; readMore: string }> = {
  it: {
    title: 'Dal Nostro Blog',
    subtitle: 'Guide, ricette e approfondimenti sul mondo dei forni artigianali',
    cta: 'Vai al Blog',
    readMore: 'Leggi di più',
  },
  en: {
    title: 'From Our Blog',
    subtitle: 'Guides, recipes and insights about artisan ovens',
    cta: 'Visit the Blog',
    readMore: 'Read more',
  },
  fr: {
    title: 'Notre Blog',
    subtitle: 'Guides, recettes et informations sur les fours artisanaux',
    cta: 'Visiter le Blog',
    readMore: 'Lire la suite',
  },
  de: {
    title: 'Aus Unserem Blog',
    subtitle: 'Anleitungen, Rezepte und Einblicke in Handwerksöfen',
    cta: 'Zum Blog',
    readMore: 'Mehr lesen',
  },
  es: {
    title: 'Desde Nuestro Blog',
    subtitle: 'Guías, recetas e información sobre hornos artesanales',
    cta: 'Ir al Blog',
    readMore: 'Leer más',
  },
};

const HomeBlogSection = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.substring(0, 2) || 'it';
  const { data: posts, isLoading } = useBlogPosts();
  const l = labels[lang] || labels.it;

  const latestPosts = posts?.slice(0, 3);

  if (!isLoading && (!latestPosts || latestPosts.length === 0)) return null;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-stone-50 to-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-playfair mb-3">
            {l.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {l.subtitle}
          </p>
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-5 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {latestPosts!.map((post) => {
              const title = getLocalizedField(post, 'title', lang);
              const description = getLocalizedField(post, 'meta_description', lang);
              const slug = getLocalizedField(post, 'slug', lang);

              return (
                <Link
                  key={post.id}
                  to={`/${lang}/blog/${slug}`}
                  className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border hover:-translate-y-1"
                >
                  {post.featured_image && (
                    <div className="overflow-hidden h-48">
                      <LazyImage
                        src={post.featured_image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    {post.published_at && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.published_at).toLocaleDateString(lang)}
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-vesuviano-600 transition-colors line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {description}
                    </p>
                    <span className="inline-flex items-center text-vesuviano-600 font-medium text-sm gap-1 group-hover:gap-2 transition-all">
                      {l.readMore}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            to={`/${lang}/blog`}
            className="inline-flex items-center gap-2 bg-vesuviano-500 hover:bg-vesuviano-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-md"
          >
            {l.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeBlogSection;
