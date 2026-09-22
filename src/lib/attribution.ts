/**
 * Traffic-source attribution for lead/quote forms.
 *
 * UTM params / click ids are captured on the first page load that carries them
 * and kept in sessionStorage so they survive client-side navigation in the SPA.
 * A stored value is only overwritten when the new landing URL actually contains
 * that param (so an internal navigation never wipes a stored gclid).
 */

export const ATTRIBUTION_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
] as const;

export type AttributionParam = (typeof ATTRIBUTION_PARAMS)[number];

export type AttributionFields = Record<AttributionParam, string> & {
  page_path: string;
  referrer: string;
  lead_source: string;
};

const STORAGE_KEY = "vf_attribution";
const REFERRER_KEY = "vf_first_referrer";

function readStored(): Partial<Record<AttributionParam, string>> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<Record<AttributionParam, string>>) : {};
  } catch {
    return {};
  }
}

/** Reads attribution params from the current URL and merges them into storage. */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const stored = readStored();
    let changed = false;

    for (const key of ATTRIBUTION_PARAMS) {
      const value = params.get(key);
      if (value && value.trim()) {
        stored[key] = value.trim();
        changed = true;
      }
    }

    if (changed) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    if (sessionStorage.getItem(REFERRER_KEY) === null) {
      sessionStorage.setItem(REFERRER_KEY, document.referrer || "");
    }
  } catch {
    /* storage unavailable: attribution is best-effort, never blocks anything */
  }
}

function deriveLeadSource(values: Partial<Record<AttributionParam, string>>): string {
  if (values.gclid) return "Google Ads";
  if (values.fbclid) return "Facebook/Meta";
  if (values.utm_source) return values.utm_source;
  return "Direct/Organic";
}

/** Attribution fields to merge into any lead/quote submission. Never throws. */
export function getAttribution(): AttributionFields {
  let stored: Partial<Record<AttributionParam, string>> = {};
  let referrer = "";
  let pagePath = "";

  try {
    stored = readStored();
    referrer = sessionStorage.getItem(REFERRER_KEY) || document.referrer || "";
    pagePath = window.location.pathname;
  } catch {
    try {
      referrer = document.referrer || "";
      pagePath = window.location.pathname;
    } catch {
      /* ignore */
    }
  }

  const fields = {} as AttributionFields;
  for (const key of ATTRIBUTION_PARAMS) {
    fields[key] = stored[key] || "";
  }
  fields.page_path = pagePath;
  fields.referrer = referrer;
  fields.lead_source = deriveLeadSource(stored);

  return fields;
}
