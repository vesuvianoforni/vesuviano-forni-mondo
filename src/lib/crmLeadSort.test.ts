import { describe, it as test } from "node:test";
import { strict as assert } from "node:assert";
import { sortCRMLeads } from "./crmLeadSort";

const leads = [
  { id: "a", contact_name: "Zeta", created_at: "2026-10-01T00:00:00Z", next_activity_date: "2026-11-10T00:00:00Z", value: 100 },
  { id: "b", contact_name: "Alfa", created_at: "2026-10-20T00:00:00Z" },
  { id: "c", contact_name: "Mario", created_at: "2026-09-01T00:00:00Z", next_activity_date: "2026-11-03T00:00:00Z", value: 500 },
];
const contacts = { a: { at: "2026-10-30T00:00:00Z" }, c: { at: "2026-11-01T00:00:00Z" } };
const ids = (sort: Parameters<typeof sortCRMLeads>[1]) => sortCRMLeads(leads, sort, contacts).map(l => l.id);

describe("ordinamento lead CRM", () => {
  test("ultimo contatto: più recente prima, senza contatto in fondo", () => assert.deepEqual(ids("last_contact"), ["c", "a", "b"]));
  test("ultimo ingresso: lead più nuovo prima", () => assert.deepEqual(ids("newest"), ["b", "a", "c"]));
  test("prossima attività: più vicina prima, senza attività in fondo", () => assert.deepEqual(ids("next_activity"), ["c", "a", "b"]));
  test("nome alfabetico", () => assert.deepEqual(ids("name"), ["b", "c", "a"]));
});
