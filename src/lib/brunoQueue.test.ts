import { describe, it as test } from "node:test";
import { strict as assert } from "node:assert";
import { brunoFollowupDays, brunoQueueReason } from "./brunoQueue";

const now = new Date("2026-10-28T12:00:00Z");

describe("Bruno follow-up queue", () => {
  test("never queues lost leads", () => {
    assert.equal(brunoQueueReason({ stage: "perso", createdAt: "2026-01-01T12:00:00Z", now }), null);
  });
  test("stays quiet while Gennaro or a manual pause holds the lead", () => {
    assert.equal(brunoQueueReason({ stage: "trattativa", brunoMode: "paused", createdAt: "2026-01-01T12:00:00Z", now }), null);
    assert.equal(brunoQueueReason({ stage: "trattativa", brunoPausedUntil: "2026-10-29T12:00:00Z", createdAt: "2026-01-01T12:00:00Z", now }), null);
  });
  test("flags an activity whose date has passed", () => {
    assert.deepEqual(
      brunoQueueReason({ stage: "qualificato", nextActivityAt: "2026-10-28T11:00:00Z", createdAt: "2026-10-01T12:00:00Z", now }),
      { severity: "overdue", label: "Attività in ritardo" },
    );
  });
  test("marks a lead nobody has ever contacted", () => {
    assert.deepEqual(
      brunoQueueReason({ stage: "nuovo", createdAt: "2026-10-25T12:00:00Z", now }),
      { severity: "due", label: "Mai contattato" },
    );
    assert.equal(brunoQueueReason({ stage: "nuovo", createdAt: "2026-10-28T11:00:00Z", now }), null);
  });
  test("uses the phase pace for silence", () => {
    assert.equal(brunoFollowupDays("nuovo"), 2);
    assert.equal(brunoFollowupDays("trattativa"), 3);
    assert.deepEqual(
      brunoQueueReason({ stage: "trattativa", lastContactAt: "2026-10-23T12:00:00Z", createdAt: "2026-09-01T12:00:00Z", now }),
      { severity: "due", label: "Nessun contatto da 5 giorni" },
    );
    assert.equal(brunoQueueReason({ stage: "trattativa", lastContactAt: "2026-10-27T12:00:00Z", createdAt: "2026-09-01T12:00:00Z", now }), null);
    assert.equal(brunoQueueReason({ stage: "nuovo", lastContactAt: "2026-10-27T12:00:00Z", createdAt: "2026-09-01T12:00:00Z", now }), null);
  });
});
