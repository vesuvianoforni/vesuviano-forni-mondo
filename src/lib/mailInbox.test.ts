import { describe, expect, it } from 'vitest';
import { mailCorrespondent, mailRecipients, mailSearchTerm } from './mailInbox';

describe('Imported mailbox data', () => {
  it('uses the actual sender for received mail and recipients for sent mail', () => {
    expect(mailCorrespondent({ direction: 'inbound', sender: 'cliente@example.com', recipients: ['info@vesuvianoforni.com'] })).toBe('cliente@example.com');
    expect(mailCorrespondent({ direction: 'outbound', sender: 'info@vesuvianoforni.com', recipients: ['cliente@example.com', 'altro@example.com'] })).toBe('cliente@example.com, altro@example.com');
  });
  it('ignores invalid recipient data without inventing an address', () => {
    expect(mailRecipients(null)).toEqual([]);
    expect(mailRecipients(['cliente@example.com', 4, null])).toEqual(['cliente@example.com']);
  });
  it('prevents search text from becoming filter syntax or wildcards', () => {
    expect(mailSearchTerm('a%,sender.eq.(test)_*')).toBe('a sender.eq. test');
    expect(mailSearchTerm('cliente@example.com')).toBe('cliente@example.com');
  });
});