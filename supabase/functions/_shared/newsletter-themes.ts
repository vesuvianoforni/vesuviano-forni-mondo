/** Browser-safe editorial catalog; period keys, not draft counts, own the rotation. */
export type EditorialLanguage = 'it' | 'en' | 'fr' | 'de' | 'es';
export type EditorialThemeId = 'ingredients' | 'technology' | 'management' | 'trends';
export const EDITORIAL_START = '2026-11-21';
const WEEK_MS = 7 * 86400000;
export const NEWSLETTER_THEMES = [
  {
    id: 'ingredients',
    labels: { it: 'Prodotti e materie prime', en: 'Ingredients & produce', fr: 'Produits et matières premières', de: 'Produkte und Zutaten', es: 'Productos y materias primas' },
    description: 'Farine, impasti, pomodoro, mozzarella e ingredienti di stagione.',
    scope: 'Novità documentate su farine, impasti, pomodoro, mozzarella, altri ingredienti e filiere alimentari pertinenti alla pizza. Prodotti significa ingredienti alimentari, non forni Vesuviano. Non inventare ricette o valori nutrizionali.',
    query: 'pizza pizzeria ingredients flour dough tomato mozzarella food sourcing industry news',
    relevance: /flour|dough|ingredient|tomato|mozzarella|cheese|wheat|grain|topping|farin|impast|pomodor|latticin|mati[eè]re premi[eè]re|ingr[eé]dient|fromage|mehl|teig|zutat|harina|masa madre/iu,
  },
  {
    id: 'technology',
    labels: { it: 'Tecnologia e attrezzature', en: 'Technology & equipment', fr: 'Technologie et équipements', de: 'Technologie und Ausstattung', es: 'Tecnología y equipamiento' },
    description: 'Cottura, attrezzature, efficienza energetica e strumenti digitali.',
    scope: 'Innovazioni verificate su cottura, attrezzature per pizzerie, efficienza energetica, software, automazione e strumenti digitali per la ristorazione. Distingui dati documentati e consigli; non promettere risparmi o promuovere il catalogo Vesuviano.',
    query: 'pizza pizzeria restaurant technology equipment ovens automation energy efficiency industry news',
    relevance: /technolog|equipment|oven|automat|software|digital|energy|robot|platform|\bAI\b|tecnolog|attrezz|forn[oi]|energia|[eé]quipement|[eé]nergie|of[eé]n|ausstattung|energ[ií]a|horno/iu,
  },
  {
    id: 'management',
    labels: { it: 'Gestione della pizzeria', en: 'Running a pizzeria', fr: 'Gestion de la pizzeria', de: 'Pizzeria-Management', es: 'Gestión de la pizzería' },
    description: 'Organizzazione, servizio, personale, ordini e fidelizzazione.',
    scope: 'Notizie utili sulla gestione operativa della pizzeria: organizzazione del servizio, personale, ordini, delivery, fidelizzazione e riduzione degli sprechi. Non inventare norme, benchmark, margini o cifre economiche.',
    query: 'pizza pizzeria restaurant operations staffing service delivery customer loyalty food waste industry news',
    relevance: /operat|staff|service|delivery|loyalty|waste|workforce|labor|labour|order|management|gestione|personale|servizio|sprechi|ordini|gestion|personnel|livraison|fid[eé]lis|bestell|personal|liefer|gesti[oó]n|desperdici/iu,
  },
  {
    id: 'trends',
    labels: { it: 'Tendenze gastronomiche', en: 'Food trends & pizza culture', fr: 'Tendances gastronomiques', de: 'Gastronomische Trends', es: 'Tendencias gastronómicas' },
    description: 'Stili di pizza, abitudini dei clienti e cultura gastronomica.',
    scope: 'Tendenze documentate su stili di pizza, abitudini di consumo, menu e cultura gastronomica. Preferisci sviluppi di settore a classifiche locali. Una tendenza locale non è universale; non inventare sondaggi o statistiche.',
    query: 'pizza pizzeria food dining trends consumer preferences pizza styles menu culture industry news',
    relevance: /trend|consumer|dining|menu|style|culture|neapolitan|detroit|sicilian|preferenc|tendenz|gastronom|consum|stili|cultur|napoletan|tendance|pr[eé]f[eé]r|tendencia|estilo/iu,
  },
] as const;

export type EditorialTheme = typeof NEWSLETTER_THEMES[number];
export function editorialTheme(id?: string | null): EditorialTheme | null {
  return NEWSLETTER_THEMES.find((theme) => theme.id === id) || null;
}
export function themeLabel(theme: EditorialTheme, language: string) {
  return theme.labels[language as EditorialLanguage] || theme.labels.it;
}
export function nextEditorialTheme(theme: EditorialTheme): EditorialTheme {
  return NEWSLETTER_THEMES[(NEWSLETTER_THEMES.indexOf(theme) + 1) % NEWSLETTER_THEMES.length] ?? NEWSLETTER_THEMES[0];
}

function dateValue(raw: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const value = Date.parse(`${raw}T00:00:00Z`);
  return Number.isFinite(value) && new Date(value).toISOString().slice(0, 10) === raw ? value : null;
}

export function weeklyEditorialTheme(periodKey: string): EditorialTheme | null {
  if (!periodKey.startsWith('news-')) return null;
  const value = dateValue(periodKey.slice(5));
  const start = Date.parse(`${EDITORIAL_START}T00:00:00Z`);
  if (value === null || value < start || (value - start) % WEEK_MS !== 0) return null;
  return NEWSLETTER_THEMES[((value - start) / WEEK_MS) % NEWSLETTER_THEMES.length] ?? null;
}

export function editorialCalendar(now: Date) {
  const romeDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const today = dateValue(romeDate);
  const start = Date.parse(`${EDITORIAL_START}T00:00:00Z`);
  const currentWeek = Math.max(0, Math.floor(((today ?? start) - start) / WEEK_MS));
  return Array.from({ length: 4 }, (_, offset) => {
    const date = new Date(start + (currentWeek + offset) * WEEK_MS).toISOString().slice(0, 10);
    return { date, theme: NEWSLETTER_THEMES[(currentWeek + offset) % NEWSLETTER_THEMES.length] ?? NEWSLETTER_THEMES[0] };
  });
}

export function themedSubject(subject: string, theme: EditorialTheme, language: string) {
  const prefixes = Object.values(theme.labels);
  const content = subject.replace(/^\[[^\]]+\]\s*/, '').trim();
  const withoutLabel = prefixes.reduce((value, label) => value.startsWith(`${label}:`) ? value.slice(label.length + 1).trim() : value, content);
  return `${themeLabel(theme, language)}: ${withoutLabel}`;
}

export function editorialTeaser(theme: EditorialTheme, language: string) {
  const labels: Record<string, string> = { it: 'Prossima rubrica', en: 'Next in the series', fr: 'Prochaine rubrique', de: 'Nächste Rubrik', es: 'Próxima sección' };
  return `${labels[language] || labels['it']}: ${themeLabel(nextEditorialTheme(theme), language)}.`;
}