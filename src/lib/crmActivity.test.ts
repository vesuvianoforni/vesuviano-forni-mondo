import { describe, it as test } from "node:test";
import { strict as assert } from "node:assert";
import { activityTiming, interactionRelativeTime, latestInteractions } from "./crmActivity";

describe("CRM activity deadlines", () => {
  const now = new Date(2026, 9, 28, 12, 0);
  const at = (day: number, hour: number) => new Date(2026, 9, day, hour).toISOString();
  test("overdue activities are identified even earlier on the same day", () => {
    assert.equal(activityTiming(at(28, 10), now).state, "overdue");
    assert.equal(activityTiming(at(26, 10), now).state, "overdue");
    assert.equal(activityTiming(at(26, 10), now).label, "Scaduta da 2 giorni");
  });
  test("today and tomorrow use calendar dates rather than a 24-hour interval", () => {
    assert.equal(activityTiming(at(28, 15), now).state, "today");
    assert.equal(activityTiming(at(29, 9), now).label, "Domani · 09:00");
  });
  test("empty and invalid deadlines remain unscheduled instead of failing", () => {
    assert.equal(activityTiming(null, now).state, "unscheduled");
    assert.equal(activityTiming("invalid", now).state, "unscheduled");
  });
  test("interaction dates are relative and never invented from a lead edit", () => {
    assert.equal(interactionRelativeTime(at(27, 10), now), "Ieri · 10:00");
    assert.equal(latestInteractions([{ id: "lead", email: "test@example.invalid" }], []).lead, null);
  });
  test("matches contact identity and selects the newest real interaction across channels", () => {
    const result = latestInteractions([{ id: "lead", email: "TEST@example.invalid", phone: "+39 350 1234567", website_lead_id: "form1" }], [
      { kind: "form", at: at(24, 10), websiteLeadId: "form1" },
      { kind: "email", at: at(26, 10), email: " test@example.invalid " },
      { kind: "chat", at: at(27, 10), phone: "00393501234567" },
      { kind: "email", at: "invalid", email: "test@example.invalid" },
    ]);
    assert.equal(result.lead?.kind, "chat");
    assert.equal(result.lead?.at, at(27, 10));
  });
  test("does not conflate numbers from different countries by their suffix", () => {
    const result = latestInteractions([{ id: "lead", phone: "+39 3501234567" }], [{ kind: "chat", at: at(27, 10), phone: "+44 3501234567" }]);
    assert.equal(result.lead, null);
  });
});