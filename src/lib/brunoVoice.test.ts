import { describe, expect, test } from 'bun:test';
import { callInView } from './brunoVoice';

describe('Bruno call agenda and completed history',()=>{
  test('proposals and live calls appear in planned calls',()=>{
    expect(callInView('proposed','planned')).toBe(true);
    expect(callInView('active','planned')).toBe(true);
    expect(callInView('completed','planned')).toBe(false);
  });
  test('completed and uncertain calls stay in outcomes without being rescheduled',()=>{
    expect(callInView('completed','executed')).toBe(true);
    expect(callInView('unknown','executed')).toBe(true);
    expect(callInView('proposed','executed')).toBe(false);
  });
});