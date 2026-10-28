Public engagement widgets mount once at the public app shell, not inside individual pages, to prevent duplicate chat icons and promotional popups.

CRM pipeline: `configurator_sessions.pipeline_stage` (nuovo/qualificato/trattativa/vinto/perso) is the single source of truth for the kanban; DB triggers auto-advance it on configurator events but always respect explicit manual changes, so the CRM UI must write the column directly rather than deriving stages from status fields. Stage changes sync to the ERP via the `sync-to-erp` edge function (`stage_changed` event, per-session `erp_webhook_url`).
