import { describe, expect, it } from "vitest";
import { communicationCount, matchesCommunicationFilter, parseBrunoCommunicationFilter, composerChannels, matchesSection, messageMatchesSection, sectionCount, sectionFilter, sectionFilters, sectionMessageFilters } from "./brunoCommunicationFilters";
import { compareMessageKeys, mergeMessagePages, unpackMessagePage } from "./brunoMessagePaging";

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

describe("ERP Chat and Mail separation", () => {
  it("excludes email-only conversations from Chat but retains them in Mail", () => {
    expect(matchesSection({ email: 6 }, "chat", "all", "cliente@example.com")).toBe(false);
    expect(matchesSection({ email: 6 }, "mail", "email")).toBe(true);
    expect(matchesSection({ email: 6, wasender: 2 }, "chat", "all")).toBe(true);
  });

  it("removes email from Chat filters and composer without changing the CRM panel", () => {
    expect(sectionFilters("chat")).not.toContain("email");
    expect(composerChannels("chat")).toEqual(["wasender", "whatsapp_api", "whatsapp_uk", "note"]);
    expect(composerChannels("all")).toContain("email");
    expect(sectionFilter("chat", "email")).toBe("all");
  });

  it("locks Mail reads and composition to email even with a WhatsApp URL filter", () => {
    expect(sectionFilters("mail")).toEqual(["email"]);
    expect(composerChannels("mail")).toEqual(["email"]);
    expect(sectionFilter("mail", "whatsapp_uk")).toBe("email");
    expect(sectionMessageFilters("mail", "all")).toEqual(["email"]);
    expect(matchesSection(undefined, "mail", "email", "nuovo@example.com")).toBe(true);
    expect(matchesSection({ wasender: 4 }, "mail", "email")).toBe(false);
  });

  it("counts only messages belonging to each section", () => {
    const counts = { email: 12, wasender: 3, whatsapp_api: 1, whatsapp_uk: 2, call: 1, note: 1 };
    expect(sectionCount(counts, "chat", "all", 20)).toBe(8);
    expect(sectionCount(counts, "mail", "all", 20)).toBe(12);
    expect(sectionCount(counts, "all", "all", 20)).toBe(20);
  });

  it("excludes emails from history and realtime in Chat, and excludes WhatsApp from Mail", () => {
    expect(sectionMessageFilters("chat", "all")).toEqual(["wasender", "whatsapp_api", "whatsapp_uk", "call", "note"]);
    expect(messageMatchesSection({ channel: "email" }, "chat", "all")).toBe(false);
    expect(messageMatchesSection({ channel: "email" }, "mail", "all")).toBe(true);
    expect(messageMatchesSection({ channel: "wasender" }, "mail", "all")).toBe(false);
    const uk = { channel: "whatsapp_api", metadata: { whatsapp_line: "uk" } };
    expect(messageMatchesSection(uk, "chat", "whatsapp_uk")).toBe(true);
    expect(messageMatchesSection(uk, "chat", "whatsapp_api")).toBe(false);
  });

  it("pages mixed Chat channels with one shared cursor and no missing or repeated messages", () => {
    const channels = sectionMessageFilters("chat", "all");
    const rows = Array.from({ length: 120 }, (_, index) => ({
      id: String(index).padStart(4, "0"), created_at: new Date(Date.UTC(2026, 10, 9, 10, 0, index)).toISOString(),
      channel: channels[index % channels.length],
    }));
    const page = (before: { id: string; created_at: string } | null) => unpackMessagePage(mergeMessagePages([], channels.flatMap(channel => rows
      .filter(row => row.channel === channel && (!before || compareMessageKeys(row, before) < 0))
      .sort((a, b) => compareMessageKeys(b, a)).slice(0, 51))).reverse());
    const first = page(null), second = page(first.cursor), third = page(second.cursor);
    expect(first.messages).toHaveLength(50);
    expect(second.messages).toHaveLength(50);
    expect(third.messages).toHaveLength(20);
    expect(first.hasMore).toBe(true);
    expect(third.hasMore).toBe(false);
    const combined = [...first.messages, ...second.messages, ...third.messages];
    expect(new Set(combined.map(row => row.id)).size).toBe(120);
    expect(mergeMessagePages([], combined).map(row => row.id)).toEqual(rows.map(row => row.id));
  });
});