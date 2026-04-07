import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Tag } from 'lucide-react';
import Header from '@/components/Header';
import { useBlogPosts, getLocalizedField } from '@/hooks/useBlogPosts';
import BlogSEO from '@/components/blog/BlogSEO';
import LazyImage from '@/components/LazyImage';
import AIChatWidget from '@/components/chat/AIChatWidget';

interface BlogListProps {
  lang: string;
}

const CATEGORIES = ['all', 'guide', 'ricette', 'novita', 'tecnica'];

const getCategoryLabel = (cat: string, lang: string): string => {
  const labels: Record<string, Record<string, string>> = {
    all: { it: 'Tutti', en: 'All', fr: 'Tous', de: 'Alle', es: 'Todos' },
    guide: { it: 'Guide', en: 'Guides', fr: 'Guides', de: 'Anleitungen', es: 'Guías' },
    ricette: { it: 'Ricette', en: 'Recipes', fr: 'Recettes', de: 'Rezepte', es: 'Recetas' },
    novita: { it: 'Novità', en: 'News', fr: 'Actualités', de: 'Neuigkeiten', es: 'Novedades' },
    tecnica: { it: 'Tecnica', en: 'Technical', fr: 'Technique', de: 'Technik', es: 'Técnica' },
  };
  return labels[cat]?.[lang] || labels[cat]?.it || cat;
};

const BlogList = ({ lang }: BlogListProps) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data: posts, isLoading } = useBlogPosts(selectedCategory);

  const blogTitle: Record<string, string> = {
    it: 'Il Blog di Vesuviano',
    en: 'Vesuviano Blog',
    fr: 'Le Blog de Vesuviano',
    de: 'Vesuviano Blog',
    es: 'El Blog de Vesuviano',
  };

  const blogSubtitle: Record<string, string> = {
    it: 'Guide, ricette e approfondimenti sul mondo dei forni artigianali napoletani',
    en: 'Guides, recipes and insights about Neapolitan artisan ovens',
    fr: 'Guides, recettes et informations sur les fours artisanaux napolitains',
    de: 'Anleitungen, Rezepte und Einblicke in neapolitanische Handwerksöfen',
    es: 'Guías, recetas e información sobre hornos artesanales napolitanos',
  };

  return (
    <div className="min-h-screen bg-background">
      <BlogSEO lang={lang} isList />
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-stone-100 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-playfair mb-4">
            {blogTitle[lang] || blogTitle.it}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {blogSubtitle[lang] || blogSubtitle.it}
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <div className="container mx-auto px-4 mb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-vesuviano-500 text-white shadow-md'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {getCategoryLabel(cat, lang)}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="container mx-auto px-4 pb-20">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-52 bg-muted" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-6 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
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
                    <div className="overflow-hidden h-52">
                      <LazyImage
                        src={post.featured_image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {getCategoryLabel(post.category, lang)}
                      </span>
                      {post.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.published_at).toLocaleDateString(lang)}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-vesuviano-600 transition-colors line-clamp-2">
                      {title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {description}
                    </p>
                    <span className="inline-flex items-center text-vesuviano-600 font-medium text-sm gap-1 group-hover:gap-2 transition-all">
                      {lang === 'it' ? 'Leggi di più' : lang === 'en' ? 'Read more' : lang === 'fr' ? 'Lire la suite' : lang === 'de' ? 'Mehr lesen' : 'Leer más'}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {lang === 'it' ? 'Nessun articolo disponibile al momento.' : 'No articles available yet.'}
            </p>
          </div>
        )}
      </div>

      <AIChatWidget />
    </div>
  );
};

export default BlogList;
