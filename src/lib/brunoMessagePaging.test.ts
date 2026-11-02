import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { BRUNO_MESSAGE_PAGE_SIZE, compareMessageKeys, mergeMessagePages, unpackMessagePage } from "./brunoMessagePaging";

describe("Bruno history paging", () => {
  it("opens 50 recent messages and preserves the sentinel for the next request", () => {
    const rows = Array.from({ length: 51 }, (_, i) => ({ id: String(51 - i), created_at: `2026-11-02T12:${String(51 - i).padStart(2, '0')}:00Z` }));
    const page = unpackMessagePage(rows);
    assert.equal(BRUNO_MESSAGE_PAGE_SIZE, 50);
    assert.equal(page.messages.length, 50);
    assert.equal(page.messages[0].id, "2");
    assert.equal(page.messages[49].id, "51");
    assert.equal(page.cursor?.id, "2");
    assert.equal(page.hasMore, true);
  });
  it("ends at an exact final page without losing its oldest message", () => {
    const page = unpackMessagePage([{ id: 'oldest', created_at: '2026-01-01T00:00:00Z' }]);
    assert.equal(page.hasMore, false);
    assert.equal(page.cursor?.id, 'oldest');
    assert.deepEqual(unpackMessagePage([]).messages, []);
  });
  it("orders timestamp ties by id and keeps Postgres microsecond precision", () => {
    assert.equal(compareMessageKeys({ id: 'a', created_at: '2026-11-02T12:00:00.000002+00:00' }, { id: 'z', created_at: '2026-11-02T12:00:00.000001Z' }), 1);
    assert.equal(compareMessageKeys({ id: 'a', created_at: '2026-11-02T12:00:00Z' }, { id: 'b', created_at: '2026-11-02T12:00:00.000000+00:00' }), -1);
  });
  it("deduplicates realtime and older page overlaps while retaining updated states", () => {
    const current = [{ id: 'b', created_at: '2026-02-01T00:00:00Z', status: 'sent' }];
    const merged = mergeMessagePages(current, [{ id: 'a', created_at: '2026-01-01T00:00:00Z', status: 'logged' }, { ...current[0], status: 'read' }]);
    assert.deepEqual(merged.map(m => m.id), ['a', 'b']);
    assert.equal(merged[1].status, 'read');
  });
});