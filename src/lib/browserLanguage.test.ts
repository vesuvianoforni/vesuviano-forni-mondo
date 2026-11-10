import { describe, expect, it } from "vitest";
import { selectBrowserLanguage } from "./browserLanguage";

describe("Homepage browser language selection", () => {
  it.each([
    ["it-IT", "it"],
    ["en-GB", "en"],
    ["fr-FR", "fr"],
    ["de-DE", "de"],
    ["es-ES", "es"],
  ])("supports %s as %s", (preference, language) => {
    expect(selectBrowserLanguage([preference])).toBe(language);
  });

  it("respects browser preference order rather than the supported language catalog", () => {
    expect(selectBrowserLanguage(["nl-NL", "fr-CA", "en-GB"])).toBe("fr");
  });

  it("uses Italian for unsupported browser languages", () => {
    expect(selectBrowserLanguage(["nl-NL", "ja-JP"])).toBe("it");
  });

  it("uses Italian without browser language preferences", () => {
    expect(selectBrowserLanguage([])).toBe("it");
  });
});