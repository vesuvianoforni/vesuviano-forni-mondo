import { economicImageBody, inlineImage } from '../_shared/economic-images.ts';
function equal(actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('Unexpected image request');
}
Deno.test('economic images preserve ordered references and use native generate-content request', () => {
  const room = inlineImage('data:image/jpeg;base64,YWJj');
  const oven = inlineImage('data:image/png;base64,ZGVm');
  const body = economicImageBody('Inserisci il forno nella stanza', [room, oven]);
  equal(body.model, 'google/gemini-3.1-flash-lite-image');
  equal(body.contents[0].parts, [{ text: 'Inserisci il forno nella stanza' }, room, oven]);
  equal(body.generationConfig.responseModalities, ['TEXT', 'IMAGE']);
});