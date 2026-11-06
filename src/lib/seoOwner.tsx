import { createContext, useContext, useId, useRef, type ReactNode } from "react";

/**
 * One page = one set of SEO tags.
 *
 * Several pages wrap another page (e.g. LocalizedIndex renders <SEOHead lang="en">
 * and then <Index />, which carries its own Italian default). Without arbitration
 * every SEOHead is emitted, producing multiple <title>/description/canonical.
 * The first SEOHead rendered for a pathname (the outermost, most specific one)
 * owns the head; later ones render nothing. Render order is identical on the
 * server and during hydration, so both pick the same owner.
 */
interface SeoOwnerStore {
  path: string;
  owner: string | null;
}

const SeoOwnerContext = createContext<{ current: SeoOwnerStore } | null>(null);

export function SeoOwnerProvider({ children }: { children: ReactNode }) {
  const store = useRef<SeoOwnerStore>({ path: "", owner: null });
  return <SeoOwnerContext.Provider value={store}>{children}</SeoOwnerContext.Provider>;
}

export function useSeoOwnership(pathname: string): boolean {
  const id = useId();
  const store = useContext(SeoOwnerContext);
  if (!store) return true;
  const s = store.current;
  if (s.path !== pathname || s.owner === null) {
    s.path = pathname;
    s.owner = id;
  }
  return s.owner === id;
}
