import { describe, expect, test } from "bun:test";
import { composerChannelForFilter } from "./brunoComposer";

describe("Canale di risposta Bruno", () => {
  test("il filtro WhatsApp Gennaro seleziona WaSender a bozza vuota", () => {
    expect(composerChannelForFilter("wasender", "whatsapp_api", "")).toBe("wasender");
  });
  test("cambiare filtro non cambia il destinatario di una bozza già scritta", () => {
    expect(composerChannelForFilter("email", "wasender", "Buongiorno, confermo la disponibilità")).toBe("wasender");
  });
  test("il filtro chiamate non trasforma una bozza in un invio telefonico", () => {
    expect(composerChannelForFilter("call", "wasender", "")).toBe("wasender");
  });
  test("tutti i canali conserva la scelta di invio", () => {
    expect(composerChannelForFilter("all", "email", "")).toBe("email");
  });
});