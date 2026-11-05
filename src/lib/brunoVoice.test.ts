import { describe, it as test } from 'node:test';
import { strict as assert } from 'node:assert';
import { callInView } from './brunoVoice';

describe('Bruno call agenda and completed history',()=>{
  test('proposals and live calls appear in planned calls',()=>{
    assert.equal(callInView('proposed','planned'),true);
    assert.equal(callInView('active','planned'),true);
    assert.equal(callInView('completed','planned'),false);
  });
  test('completed and uncertain calls stay in outcomes without being rescheduled',()=>{
    assert.equal(callInView('completed','executed'),true);
    assert.equal(callInView('unknown','executed'),true);
    assert.equal(callInView('proposed','executed'),false);
  });
});