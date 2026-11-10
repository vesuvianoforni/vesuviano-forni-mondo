const SUPPORTED_LANGUAGES = new Set(["it", "en", "fr", "de", "es"]);

/** Choose the first supported browser preference, with the site's Italian fallback. */
export function selectBrowserLanguage(preferences: readonly string[]): string {
  for (const preference of preferences) {
    const language = preference.split("-")[0]?.toLowerCase();
    if (language && SUPPORTED_LANGUAGES.has(language)) return language;
  }
  return "it";
}