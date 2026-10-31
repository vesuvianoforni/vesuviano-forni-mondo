import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { summarizeDashboardLeads, type DashboardLead } from './erpDashboard';

const lead = (id: string, status: string, overrides: Partial<DashboardLead> = {}): DashboardLead => ({
  id, status, pipeline: 'Vesuviano', archived: false, company_name: id, contact_name: null,
  next_activity_type: null, next_activity_date: null, next_activity_notes: null, ...overrides,
});
const now = new Date('2026-10-31T12:00:00');

describe('ERP dashboard read-only summaries', () => {
  it('preserves six stages and includes Pre-qualificato among the four active stages', () => {
    const summary = summarizeDashboardLeads([
      lead('1', 'nuovo'), lead('2', 'pre_qualificato'), lead('3', 'qualificato'),
      lead('4', 'trattativa'), lead('5', 'vinto'), lead('6', 'perso'),
    ], now);
    assert.equal(summary.activeCount, 4);
    assert.deepEqual(summary.stages.map(stage => [stage.id, stage.count]), [
      ['nuovo', 1], ['pre_qualificato', 1], ['qualificato', 1], ['trattativa', 1], ['vinto', 1], ['perso', 1],
    ]);
  });
  it('excludes archived leads and other pipelines from Vesuviano summaries', () => {
    const summary = summarizeDashboardLeads([lead('1', 'nuovo'), lead('2', 'nuovo', { archived: true }), lead('3', 'nuovo', { pipeline: 'ZAPPER' })], now);
    assert.equal(summary.activeCount, 1);
    assert.equal(summary.stages[0].count, 1);
  });
  it('lists only actual scheduled activities on active leads, oldest first', () => {
    const summary = summarizeDashboardLeads([
      lead('future', 'qualificato', { next_activity_date: '2026-11-01T13:00:00' }),
      lead('today', 'nuovo', { next_activity_date: '2026-10-31T14:00:00' }),
      lead('overdue', 'pre_qualificato', { next_activity_date: '2026-10-30T10:00:00' }),
      lead('won', 'vinto', { next_activity_date: '2026-10-30T10:00:00' }),
      lead('invalid', 'nuovo', { next_activity_date: 'invalid' }), lead('unscheduled', 'nuovo'),
    ], now);
    assert.equal(summary.overdueCount, 1);
    assert.equal(summary.todayCount, 1);
    assert.deepEqual(summary.activities.map(activity => activity.lead.id), ['overdue', 'today', 'future']);
  });
});