import { describe, expect, it } from 'vitest';
import { mailAttachmentNames, mailAttachmentType, mailAttachmentSize } from './mailAttachments';

describe('Email attachments', () => {
  it('retains real attachment names only', () => {
    expect(mailAttachmentNames(['Offerta.pdf', '', null, 3, 'Logo.png'])).toEqual(['Offerta.pdf', 'Logo.png']);
    expect(mailAttachmentNames(null)).toEqual([]);
  });
  it('never previews active HTML or SVG content', () => {
    expect(mailAttachmentType('text/html')).toBe('application/octet-stream');
    expect(mailAttachmentType('image/svg+xml')).toBe('application/octet-stream');
    expect(mailAttachmentType('application/pdf')).toBe('application/pdf');
    expect(mailAttachmentType('image/jpeg')).toBe('image/jpeg');
  });
  it('reports file sizes without inventing missing sizes', () => {
    expect(mailAttachmentSize(0)).toBe('');
    expect(mailAttachmentSize(2048)).toBe('2 KB');
    expect(mailAttachmentSize(1024 * 1024)).toBe('1 MB');
  });
});