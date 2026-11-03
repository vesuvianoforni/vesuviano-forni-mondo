import { ECONOMIC_RESPONSES_MODEL, ECONOMIC_TEXT_MODEL, ECONOMIC_EDITORIAL_MODEL, ECONOMIC_IMAGE_MODEL } from '../_shared/ai-models.ts';
function equal(actual: unknown, expected: unknown) {
  if (actual !== expected) throw new Error(`${actual} != ${expected}`);
}
Deno.test('agent tools and structured back-office use the economic Responses model', () => {
  equal(ECONOMIC_RESPONSES_MODEL, 'openai/gpt-6-luna');
});
Deno.test('high-volume text tasks use the economic Flash Lite model', () => {
  equal(ECONOMIC_TEXT_MODEL, 'google/gemini-3.1-flash-lite');
});
Deno.test('long editorial and contract tasks stay in the economical Flash tier', () => {
  equal(ECONOMIC_EDITORIAL_MODEL, 'google/gemini-3-flash-preview');
});
Deno.test('image generation stays in the economical Flash Lite tier', () => {
  equal(ECONOMIC_IMAGE_MODEL, 'google/gemini-3.1-flash-lite-image');
});