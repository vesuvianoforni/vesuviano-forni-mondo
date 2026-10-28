import { describe, it as test } from "node:test";
import { strict as assert } from "node:assert";
import { ACTIVE_CRM_STAGES, CRM_STAGES, groupByCRMStage, normalizeCRMStage } from "./crmPipeline";

describe("Zapper CRM stages", () => {
  test("pre-qualified remains distinct from qualified and is an active calling stage", () => {
    assert.equal(normalizeCRMStage("pre_qualified"), "pre_qualificato");
    assert.equal(normalizeCRMStage("qualified"), "qualificato");
    assert.deepEqual(ACTIVE_CRM_STAGES.map(stage => stage.id), ["nuovo", "pre_qualificato", "qualificato", "trattativa"]);
  });

  for (const [source, expected] of [
    ["new", "nuovo"], ["qualified", "qualificato"], ["negotiation", "trattativa"],
    ["won", "vinto"], ["lost", "perso"],
  ]) {
    test(`preserves imported ${source} as ${expected}`, () => {
      assert.equal(normalizeCRMStage(source), expected);
    });
  }

  test("all six stages have a board bucket, including pre-qualified sessions", () => {
    const records = CRM_STAGES.map(stage => ({ pipeline_stage: stage.id, id: stage.id }));
    const grouped = groupByCRMStage(records);
    assert.equal(Object.keys(grouped).length, 6);
    assert.deepEqual(grouped.pre_qualificato.map(record => record.id), ["pre_qualificato"]);
    assert.equal(Object.values(grouped).flat().length, records.length);
  });
});