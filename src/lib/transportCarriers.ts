export interface TransportCarrier {
  id?: string;
  country: string;
  served_areas: string[];
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  is_active: boolean;
}

export type CarrierStatus = "all" | "active" | "inactive";

export function normalizeArea(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, " ");
}

const areaAliases: Record<string, string[]> = {
  inghilterra: ["england"], scozia: ["scotland"], galles: ["wales"],
  "irlanda del nord": ["northern ireland"], francia: ["france"], germania: ["germany"],
};

export function areaMatches(area: string, query: string): boolean {
  const normalized = normalizeArea(area);
  const search = normalizeArea(query);
  if (!search || normalized.includes(search)) return true;
  if (normalized.startsWith("regno unito") && ["uk", "united kingdom", "gran bretagna"].includes(search)) return true;
  return Object.entries(areaAliases).some(([key, aliases]) => normalized.includes(key) && aliases.some(alias => alias.includes(search)));
}

export function carrierAreas(carrier: Pick<TransportCarrier, "served_areas" | "country">): string[] {
  return carrier.served_areas ?? (carrier.country && carrier.country !== "Da definire" ? [carrier.country] : []);
}

export function uniqueAreas(areas: string[]): string[] {
  const seen = new Set<string>();
  return areas.map(area => area.trim()).filter(area => {
    const key = normalizeArea(area);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => a.localeCompare(b, "it"));
}

export function toggleCarrierArea(areas: string[], area: string): string[] {
  return areas.some(item => normalizeArea(item) === normalizeArea(area))
    ? areas.filter(item => normalizeArea(item) !== normalizeArea(area))
    : uniqueAreas([...areas, area]);
}

export function filterCarriers(rows: TransportCarrier[], query: string, area: string, status: CarrierStatus): TransportCarrier[] {
  const search = normalizeArea(query);
  return rows.filter(carrier => {
    if (status === "active" && !carrier.is_active || status === "inactive" && carrier.is_active) return false;
    const areas = carrierAreas(carrier);
    if (area === "unassigned" && areas.length) return false;
    if (area !== "all" && area !== "unassigned" && !areas.some(item => areaMatches(item, area))) return false;
    // Notes may mention other operators' routes: only the explicit coverage determines area matches.
    return !search || normalizeArea(`${carrier.name} ${carrier.company ?? ""} ${carrier.phone ?? ""} ${carrier.email ?? ""}`).includes(search)
      || areas.some(item => areaMatches(item, search));
  });
}

export function carrierSaveFields(carrier: TransportCarrier) {
  const { id: _id, ...fields } = carrier;
  const areas = uniqueAreas(carrier.served_areas);
  return { ...fields, name: fields.name.trim(), served_areas: areas, country: areas[0] ?? "Da definire" };
}