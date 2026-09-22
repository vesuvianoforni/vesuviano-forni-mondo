/**
 * Localized thank-you page routes.
 * Used for post-submit redirects so GTM page-based conversion triggers fire.
 */
export const THANK_YOU_ROUTES: Record<string, string> = {
  it: "/it/thank-you-it",
  en: "/en/thank-you-en",
  fr: "/fr/thank-you-fr",
  es: "/es/thank-you-es",
  de: "/de/thank-you-de",
};

export function getThankYouRoute(lang?: string): string {
  const key = (lang || "it").split("-")[0].toLowerCase();
  return THANK_YOU_ROUTES[key] || THANK_YOU_ROUTES.it;
}

/**
 * Real full-page navigation to the thank-you page.
 * A hard navigation guarantees GTM's page-view trigger fires reliably.
 */
export function redirectToThankYou(lang?: string): void {
  window.location.href = getThankYouRoute(lang);
}
