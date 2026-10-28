Public engagement widgets mount once at the public app shell, not inside individual pages, to prevent duplicate chat icons and promotional popups.

CRM pipeline: `configurator_sessions.pipeline_stage` is the single source of truth for the configurator kanban; DB triggers auto-advance it on configurator events but always respect explicit manual changes. Both CRM boards use the shared `crmPipeline` stage catalog and translate external status keys at import boundaries, preventing stages from disappearing. Stage changes sync to the ERP via `sync-to-erp` (`stage_changed`, per-session `erp_webhook_url`). Paginate CRM queries so imported leads are not truncated by the Data API row limit.

The primary ERP CRM route renders the lead board; legacy lead links redirect there, while configurator session tools retain their own route. Contain horizontal board scrolling within the content pane and allow toolbars to wrap so neither CRM expands the page beyond its viewport.

Render active and closed CRM leads through the shared CRMLeadCard presentation component so contact details, next activity and existing lead actions stay consistent without duplicating persistence logic.
