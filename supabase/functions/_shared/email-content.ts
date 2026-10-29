import { simpleParser } from 'npm:mailparser@3.9.3';
import { Buffer } from 'node:buffer';
import type { MessageStructureObject, ImapFlow, FetchMessageObject } from 'npm:imapflow@2.9.1';
import { textPart } from './email-rules.ts';
export async function emailText(client: ImapFlow, entry: FetchMessageObject) {
  const part = textPart(entry.bodyStructure);
  if (!part) return '';
  const partKey = part.part || 'TEXT';
  // Fetch just a bounded text part, never full attachments or inline images.
  const content = await client.fetchOne(entry.uid, { bodyParts: [{ key: partKey, maxLength: 65536 }] }, { uid: true });
  if (!content) return '';
  const body = content.bodyParts?.get(partKey);
  if (!body) return '';
  const charset = (part.parameters?.charset || 'utf-8').replace(/[^a-z0-9_-]/gi,'');
  const encoding = content.binaryParts?.has(partKey) ? '8bit' : (part.encoding || '8bit').replace(/[^a-z0-9-]/gi,'');
  const synthetic = Buffer.concat([Buffer.from(`Content-Type: ${part.type}; charset="${charset}"\r\nContent-Transfer-Encoding: ${encoding}\r\n\r\n`),body]);
  const parsed = await simpleParser(synthetic, { skipTextToHtml: true, skipImageLinks: true });
  return (parsed.text || '').slice(0,65536);
}
export function headerReferences(headers?: Buffer) {
  const text = headers?.toString('utf8').replace(/\r?\n[ \t]+/g,' ') || '';
  const references = text.match(/^references:\s*(.+)$/im)?.[1] || '';
  return references.match(/<[^<>\s]+>/g)?.slice(-20) || [];
}