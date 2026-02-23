import type { BlogPost } from '@/hooks/useBlogPosts';

export interface SEOCheck {
  label: string;
  passed: boolean;
  detail: string;
  weight: number;
}

export interface SEOResult {
  score: number;
  checks: SEOCheck[];
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

const LANGS = ['it', 'en', 'fr', 'de', 'es'] as const;

function getField(post: Partial<BlogPost>, field: string, lang: string): string {
  return ((post as any)[`${field}_${lang}`] as string) || '';
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').length : 0;
}

function countHeadings(html: string, tag: string): number {
  const regex = new RegExp(`<${tag}[^>]*>`, 'gi');
  return (html.match(regex) || []).length;
}

function countImages(html: string): number {
  return (html.match(/<img[^>]*>/gi) || []).length;
}

function countLinks(html: string): number {
  return (html.match(/<a[^>]*href/gi) || []).length;
}

export function calculateSEOScore(post: Partial<BlogPost>, lang: string = 'it'): SEOResult {
  const checks: SEOCheck[] = [];

  const title = getField(post, 'title', lang);
  const meta = getField(post, 'meta_description', lang);
  const content = getField(post, 'content', lang);
  const slug = getField(post, 'slug', lang);
  const image = post.featured_image || '';

  // 1. Title length (10 pts)
  const titleLen = title.length;
  checks.push({
    label: 'Titolo',
    passed: titleLen >= 30 && titleLen <= 65,
    detail: `${titleLen} caratteri (ideale: 30-65)`,
    weight: 10,
  });

  // 2. Meta description (10 pts)
  const metaLen = meta.length;
  checks.push({
    label: 'Meta Description',
    passed: metaLen >= 80 && metaLen <= 160,
    detail: `${metaLen} caratteri (ideale: 80-160)`,
    weight: 10,
  });

  // 3. Content length (15 pts)
  const words = countWords(content);
  checks.push({
    label: 'Lunghezza contenuto',
    passed: words >= 600,
    detail: `${words} parole (min. 600)`,
    weight: 15,
  });

  // 4. H2 headings (10 pts)
  const h2Count = countHeadings(content, 'h2');
  checks.push({
    label: 'Sottotitoli H2',
    passed: h2Count >= 2,
    detail: `${h2Count} trovati (min. 2)`,
    weight: 10,
  });

  // 5. H3 headings (5 pts)
  const h3Count = countHeadings(content, 'h3');
  checks.push({
    label: 'Sottotitoli H3',
    passed: h3Count >= 1,
    detail: `${h3Count} trovati (min. 1)`,
    weight: 5,
  });

  // 6. Featured image (10 pts)
  checks.push({
    label: 'Immagine di copertina',
    passed: !!image,
    detail: image ? 'Presente' : 'Mancante',
    weight: 10,
  });

  // 7. Images in content (5 pts)
  const imgCount = countImages(content);
  checks.push({
    label: 'Immagini nel contenuto',
    passed: imgCount >= 1,
    detail: `${imgCount} trovate (min. 1)`,
    weight: 5,
  });

  // 8. Internal links (5 pts)
  const linkCount = countLinks(content);
  checks.push({
    label: 'Link nel contenuto',
    passed: linkCount >= 1,
    detail: `${linkCount} trovati (min. 1)`,
    weight: 5,
  });

  // 9. Slug SEO-friendly (10 pts)
  const slugOk = slug.length > 5 && slug.length < 80 && /^[a-z0-9-]+$/.test(slug);
  checks.push({
    label: 'Slug SEO-friendly',
    passed: slugOk,
    detail: slugOk ? `"${slug}"` : `Problemi: ${slug.length <= 5 ? 'troppo corto' : slug.length >= 80 ? 'troppo lungo' : 'caratteri non validi'}`,
    weight: 10,
  });

  // 10. All languages filled (10 pts)
  const allLangsFilled = LANGS.every(l => getField(post, 'title', l).length > 0 && getField(post, 'content', l).length > 0);
  checks.push({
    label: 'Tutte le lingue compilate',
    passed: allLangsFilled,
    detail: allLangsFilled ? '5/5 lingue' : `${LANGS.filter(l => getField(post, 'title', l).length > 0 && getField(post, 'content', l).length > 0).length}/5 lingue`,
    weight: 10,
  });

  // 11. Meta descriptions all languages (5 pts)
  const allMetasFilled = LANGS.every(l => getField(post, 'meta_description', l).length >= 50);
  checks.push({
    label: 'Meta description tutte le lingue',
    passed: allMetasFilled,
    detail: allMetasFilled ? '5/5' : `${LANGS.filter(l => getField(post, 'meta_description', l).length >= 50).length}/5`,
    weight: 5,
  });

  // Calculate score
  const maxScore = checks.reduce((sum, c) => sum + c.weight, 0);
  const earned = checks.filter(c => c.passed).reduce((sum, c) => sum + c.weight, 0);
  const score = Math.round((earned / maxScore) * 100);

  const grade: SEOResult['grade'] = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';

  return { score, checks, grade };
}

export function getGradeColor(grade: SEOResult['grade']): string {
  switch (grade) {
    case 'A': return 'text-green-600 bg-green-100';
    case 'B': return 'text-blue-600 bg-blue-100';
    case 'C': return 'text-amber-600 bg-amber-100';
    case 'D': return 'text-orange-600 bg-orange-100';
    case 'F': return 'text-red-600 bg-red-100';
  }
}
