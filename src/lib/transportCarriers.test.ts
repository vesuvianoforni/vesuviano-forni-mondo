import { describe, expect, it } from "vitest";
import { carrierSaveFields, filterCarriers, toggleCarrierArea, type TransportCarrier } from "./transportCarriers";

const carrier: TransportCarrier = {
  id: "sugros", name: "Sugros", country: "Francia", company: null, phone: null, email: null,
  notes: "Altri vettori da quotare per la Germania", is_active: false,
  served_areas: ["Francia", "Regno Unito – Inghilterra"],
};

describe("Aree servite dai vettori", () => {
  it("trova il vettore cercando Inghilterra anche se il paese principale è Francia", () => {
    expect(filterCarriers([carrier], "Inghilterra", "all", "all").map(c => c.id)).toEqual(["sugros"]);
  });
  it("mantiene una sola scheda ricercabile da più aree", () => {
    expect(filterCarriers([carrier], "", "Francia", "all")).toHaveLength(1);
    expect(filterCarriers([carrier], "", "Inghilterra", "all")).toHaveLength(1);
    expect(filterCarriers([carrier], "", "Germania", "all")).toHaveLength(0);
  });
  it("salva più aree senza cambiare lo stato non attivo", () => {
    const fields = carrierSaveFields({ ...carrier, served_areas: [" Francia ", "francia", "Regno Unito – Inghilterra"] });
    expect(fields.served_areas).toEqual(["Francia", "Regno Unito – Inghilterra"]);
    expect(fields.is_active).toBe(false);
    expect(fields).not.toHaveProperty("id");
  });
  it("rimuove una sola area senza perdere le altre", () => {
    expect(toggleCarrierArea(carrier.served_areas, "Francia")).toEqual(["Regno Unito – Inghilterra"]);
  });
  it("ricerca anche UK ed England rispettando il filtro di stato", () => {
    expect(filterCarriers([carrier], "UK", "all", "inactive")).toHaveLength(1);
    expect(filterCarriers([carrier], "England", "all", "all")).toHaveLength(1);
    expect(filterCarriers([carrier], "Inghilterra", "all", "active")).toHaveLength(0);
  });
  it("conserva i contatti senza destinazione senza inventare aree", () => {
    const unassigned = { ...carrier, country: "Da definire", served_areas: [] };
    expect(filterCarriers([unassigned], "", "unassigned", "all")).toHaveLength(1);
    expect(filterCarriers([unassigned], "Inghilterra", "all", "all")).toHaveLength(0);
    expect(carrierSaveFields(unassigned).country).toBe("Da definire");
  });
});