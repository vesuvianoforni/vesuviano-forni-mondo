export const CRM_STAGES = [
  { id: "nuovo", title: "Nuovo", color: "bg-muted text-muted-foreground", border: "border-muted-foreground" },
  { id: "pre_qualificato", title: "Pre-qualificato", color: "bg-accent/10 text-accent", border: "border-accent" },
  { id: "qualificato", title: "Qualificato", color: "bg-secondary/10 text-secondary", border: "border-secondary" },
  { id: "trattativa", title: "Trattativa", color: "bg-primary/10 text-primary", border: "border-primary" },
  { id: "vinto", title: "Vinto", color: "bg-secondary/20 text-secondary", border: "border-secondary" },
  { id: "perso", title: "Perso", color: "bg-destructive/10 text-destructive", border: "border-destructive" },
] as const;

export type CRMStage = typeof CRM_STAGES[number]["id"];

export const ACTIVE_CRM_STAGES = CRM_STAGES.filter(stage => stage.id !== "vinto" && stage.id !== "perso");

const aliases: Record<string, CRMStage> = {
  new: "nuovo",
  pre_qualified: "pre_qualificato",
  qualified: "qualificato",
  negotiation: "trattativa",
  won: "vinto",
  lost: "perso",
};

export function normalizeCRMStage(status: string): CRMStage | undefined {
  return CRM_STAGES.find(stage => stage.id === status)?.id ?? aliases[status];
}

export function groupByCRMStage<T extends { pipeline_stage: string }>(records: T[]) {
  return Object.fromEntries(CRM_STAGES.map(stage => [
    stage.id,
    records.filter(record => normalizeCRMStage(record.pipeline_stage) === stage.id),
  ])) as Record<CRMStage, T[]>;
}