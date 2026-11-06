export type CRMLeadSort = "last_contact" | "newest" | "next_activity" | "name" | "value";

export const crmLeadSortLabels: Record<CRMLeadSort, string> = {
  last_contact: "Ultimo contatto",
  newest: "Ultimo ingresso",
  next_activity: "Prossima attività",
  name: "Nome A–Z",
  value: "Valore",
};

interface SortableLead {
  id: string;
  company_name?: string | undefined;
  contact_name?: string | undefined;
  value?: number | undefined;
  created_at: string;
  next_activity_date?: string | undefined;
}

const time = (value?: string | null) => {
  const t = value ? Date.parse(value) : NaN;
  return Number.isFinite(t) ? t : null;
};

/** Sort leads; missing values always go last; ties broken by newest entry then id. */
export function sortCRMLeads<T extends SortableLead>(leads: T[], sort: CRMLeadSort, lastContact: Record<string, { at: string } | null | undefined>): T[] {
  const key = (lead: T): number | string | null => {
    switch (sort) {
      case "last_contact": return time(lastContact[lead.id]?.at);
      case "newest": return time(lead.created_at);
      case "next_activity": return time(lead.next_activity_date);
      case "value": return lead.value ?? null;
      case "name": return (lead.company_name || lead.contact_name || "").trim().toLocaleLowerCase("it") || null;
    }
  };
  const ascending = sort === "next_activity" || sort === "name";
  return [...leads].sort((a, b) => {
    const ka = key(a), kb = key(b);
    if (ka !== kb) {
      if (ka === null) return 1;
      if (kb === null) return -1;
      const cmp = typeof ka === "string" ? ka.localeCompare(kb as string, "it") : (ka as number) - (kb as number);
      if (cmp !== 0) return ascending ? cmp : -cmp;
    }
    return (time(b.created_at) ?? 0) - (time(a.created_at) ?? 0) || a.id.localeCompare(b.id);
  });
}
