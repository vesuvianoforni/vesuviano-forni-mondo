import { describe, expect, it } from "vitest";
import { communicationCount, matchesCommunicationFilter, parseBrunoCommunicationFilter } from "./brunoCommunicationFilters";

describe("Bruno communication platform filters", () => {
  it("filters email conversations even when the latest message is on another platform", () => {
    expect(matchesCommunicationFilter({ email: 2, wasender: 9 }, "email")).toBe(true);
    expect(matchesCommunicationFilter({ wasender: 9 }, "email")).toBe(false);
  });

  it("keeps Gennaro separate from both Bruno lines", () => {
    expect(matchesCommunicationFilter({ wasender: 1 }, "wasender")).toBe(true);
    expect(matchesCommunicationFilter({ whatsapp_api: 1, whatsapp_uk: 3 }, "wasender")).toBe(false);
  });

  it("never includes UK-only conversations in the Italian line", () => {
    expect(matchesCommunicationFilter({ whatsapp_uk: 4 }, "whatsapp_api")).toBe(false);
    expect(matchesCommunicationFilter({ whatsapp_api: 1 }, "whatsapp_api")).toBe(true);
  });

  it("never includes Italian-only conversations in the UK line", () => {
    expect(matchesCommunicationFilter({ whatsapp_api: 4 }, "whatsapp_uk")).toBe(false);
    expect(matchesCommunicationFilter({ whatsapp_uk: 1 }, "whatsapp_uk")).toBe(true);
  });

  it("keeps clients with no messages only in the unfiltered list", () => {
    expect(matchesCommunicationFilter(undefined, "all")).toBe(true);
    expect(matchesCommunicationFilter(undefined, "email")).toBe(false);
    expect(matchesCommunicationFilter({ email: 0 }, "email")).toBe(false);
  });

  it("reports the selected platform count without adding other platforms", () => {
    expect(communicationCount({ email: 2, whatsapp_uk: 5 }, "whatsapp_uk", 7)).toBe(5);
    expect(communicationCount({ email: 2, whatsapp_uk: 5 }, "all", 7)).toBe(7);
    expect(communicationCount({ email: 2 }, "wasender", 2)).toBe(0);
  });

  it("restores a valid URL filter and rejects unknown values", () => {
    expect(parseBrunoCommunicationFilter("whatsapp_uk")).toBe("whatsapp_uk");
    expect(parseBrunoCommunicationFilter("email")).toBe("email");
    expect(parseBrunoCommunicationFilter("invalid")).toBe("all");
    expect(parseBrunoCommunicationFilter(null)).toBe("all");
  });
});