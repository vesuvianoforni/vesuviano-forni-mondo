import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { decodeMarioMessages, mergeMarioThreads, selectMarioThread } from './marioThreads';

const request = 'Cerchiamo pizzerie napoletane a Londra';
const thread = { id: 'london', title: request, updatedAt: '2026-11-02T19:24:46Z', messages: [{ role: 'user' as const, content: request }] };

describe('Mario persisted requests', () => {
  it('restores the saved task and response after serialization', () => {
    const messages = [...thread.messages, { role: 'assistant', content: 'Piano da approvare' }];
    assert.deepEqual(decodeMarioMessages(JSON.parse(JSON.stringify(messages))), messages);
  });
  it('never replaces the server transcript with an obsolete local import', () => {
    const remote = { ...thread, messages: [...thread.messages, { role: 'assistant' as const, content: 'Piano salvato' }] };
    const merged = mergeMarioThreads([remote], [thread]);
    assert.equal(merged.length, 1);
    assert.equal(merged[0]!.messages[1]!.content, 'Piano salvato');
  });
  it('keeps more than fifty saved tasks without truncating history', () => {
    const history = Array.from({ length: 75 }, (_, i) => ({ ...thread, id: String(i) }));
    assert.equal(mergeMarioThreads(history, []).length, 75);
  });
  it('does not open another conversation for an unavailable URL', () => {
    assert.equal(selectMarioThread([thread], 'another-user-thread'), undefined);
    assert.equal(selectMarioThread([thread], 'london')?.messages[0]!.content, request);
  });
});