import { describe, it as test } from "node:test";
import { strict as assert } from "node:assert";
import { brunoCanContact, isBrunoPaused } from "./brunoObjectives";

describe("Bruno rules", () => {
  test("never contacts lost leads", () => {
    assert.equal(brunoCanContact("perso"), false);
    assert.equal(brunoCanContact("trattativa"), true);
  });
  test("pauses while Gennaro's 48h takeover is active", () => {
    const now = new Date("2026-10-28T12:00:00Z");
    assert.equal(isBrunoPaused("draft", "2026-10-29T12:00:00Z", now), true);
    assert.equal(isBrunoPaused("draft", "2026-10-27T12:00:00Z", now), false);
    assert.equal(isBrunoPaused("paused", null, now), true);
  });
});
