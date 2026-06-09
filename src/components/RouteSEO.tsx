import { useEffect } from 'react';

interface RouteSEOProps {
  title: string;
  description: string;
  /** Path beginning with "/" — used to build canonical and og:url */
  path: string;
  /** Absolute URL of social image. Optional. */
  image?: string;
  lang?: string;
}

const BASE_URL = 'https://vesuvianoforni.com';

const upsert = (selector: string, create: () => HTMLElement, apply: (el: HTMLElement) => void) => {
  let el = document.head.querySelector(selector) as HTMLElement | null;
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  apply(el);
};

const setMeta = (key: 'name' | 'property', name: string, content: string) => {
  upsert(`meta[${key}="${name}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute(key, name);
    return m;
  }, (el) => el.setAttribute('content', content));
};

const setLink = (rel: string, href: string) => {
  upsert(`link[rel="${rel}"]`, () => {
    const l = document.createElement('link');
    l.setAttribute('rel', rel);
    return l;
  }, (el) => el.setAttribute('href', href));
};

/**
 * Sets per-route SEO and Open Graph meta tags. Overrides the static
 * head shipped in index.html for the current route. Reverts to the
 * original homepage values when the component unmounts.
 */
const RouteSEO = ({ title, description, path, image, lang }: RouteSEOProps) => {
  useEffect(() => {
    const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const img = image || `${BASE_URL}/lovable-uploads/vesuviano-social-banner.jpg`;

    const prevTitle = document.title;
    document.title = title;
    if (lang) document.documentElement.lang = lang;

    setMeta('name', 'description', description);
    setLink('canonical', url);

    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', img);
    setMeta('property', 'og:type', 'website');

    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:url', url);
    setMeta('name', 'twitter:image', img);

    return () => {
      document.title = prevTitle;
    };
  }, [title, description, path, image, lang]);

  return null;
};

export default RouteSEO;
