import { assertEquals } from 'jsr:@std/assert';
import { extractImages, shouldReplace, pickReferences } from './blog-oven-images.ts';

const ovens = [
  { model: 'VesuvioBuono', fuels: ['Legna'], url: 'a' },
  { model: 'RealBosco Rotante', fuels: ['Legna', 'Gas'], url: 'b' },
  { model: 'Sebastian', fuels: ['Legna', 'Gas', 'Elettrico'], url: 'c' },
];

Deno.test('logo e infografiche restano, le foto esterne si sostituiscono', () => {
  const imgs = extractImages('<img src="https://x.co/a.jpeg" alt="Man cooking pizza"><img src="https://x.co/1_vesuvianoforni.jpg" alt="Logo"><img src="https://x.co/i.jpeg" alt="Infographic of steps">');
  assertEquals(imgs.map(i => shouldReplace(i, ['own.co'])), [true, false, false]);
});

Deno.test('le nostre foto già generate non vengono rigenerate', () => {
  assertEquals(shouldReplace({ src: 'https://own.co/storage/v1/object/public/oven-gallery/blog-inline/x.jpg', alt: 'oven' }, ['own.co']), false);
});

Deno.test('articolo sui forni rotanti usa il forno rotante', () => {
  assertEquals(pickReferences('rotating oven in a pizzeria', ovens, 0).map(o => o.model), ['RealBosco Rotante']);
});

Deno.test('foto con più misure usa tre forni diversi', () => {
  assertEquals(pickReferences('Top-down view of three sizes of pizza ovens', ovens, 0).length, 3);
});
