import {describe,it} from 'node:test';
import {strict as assert} from 'node:assert';
import {attributableMessageCount} from './brunoWorkspaceMetrics';
describe('Bruno message KPI attribution',()=>{
 const row={message_id:'m1',status:'completed',finished_at:'2026-11-05T10:00:00Z',channel:'wasender',direction:'outbound',message_status:'sent'};
 it('excludes Zapper imports',()=>assert.equal(attributableMessageCount([{...row,source:'zapper'}],'2026-11-05T00:00:00Z'),0));
 it('counts a message once even linked to more than one action',()=>assert.equal(attributableMessageCount([row,row],'2026-11-05T00:00:00Z'),1));
 it('excludes failed sends',()=>assert.equal(attributableMessageCount([{...row,message_status:'failed',status:'failed'}],'2026-11-05T00:00:00Z'),0));
 it('excludes records outside the period',()=>assert.equal(attributableMessageCount([row],'2026-11-06T00:00:00Z'),0));
});