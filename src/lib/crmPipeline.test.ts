import { describe, expect, test } from "bun:test";
import { ACTIVE_CRM_STAGES, CRM_STAGES, groupByCRMStage, normalizeCRMStage } from "./crmPipeline";

describe("Zapper CRM stages", () => {
  test("pre-qualified remains distinct from qualified and is an active calling stage", () => {
    expect(normalizeCRMStage("pre_qualified")).toBe("pre_qualificato");
    expect(normalizeCRMStage("qualified")).toBe("qualificato");
    expect(ACTIVE_CRM_STAGES.map(stage => stage.id)).toEqual(["nuovo", "pre_qualificato", "qualificato", "trattativa"]);
  });

  test.each([
    ["new", "nuovo"], ["qualified", "qualificato"], ["negotiation", "trattativa"],
    ["won", "vinto"], ["lost", "perso"],
  ])("preserves imported %s as %s", (source, expected) => {
    expect(normalizeCRMStage(source)).toBe(expected);
  });

  test("all six stages have a board bucket, including pre-qualified sessions", () => {
    const records = CRM_STAGES.map(stage => ({ pipeline_stage: stage.id, id: stage.id }));
    const grouped = groupByCRMStage(records);
    expect(Object.keys(grouped)).toHaveLength(6);
    expect(grouped.pre_qualificato.map(record => record.id)).toEqual(["pre_qualificato"]);
    expect(Object.values(grouped).flat()).toHaveLength(records.length);
  });
});