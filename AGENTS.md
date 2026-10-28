Public engagement widgets mount once at the public app shell, not inside individual pages, to prevent duplicate chat icons and promotional popups.

CRM pipeline: `configurator_sessions.pipeline_stage` is the single source of truth for the configurator kanban; DB triggers auto-advance it on configurator events but always respect explicit manual changes. Both CRM boards use the shared `crmPipeline` stage catalog and translate external status keys at import boundaries, preventing stages from disappearing. Stage changes sync to the ERP via `sync-to-erp` (`stage_changed`, per-session `erp_webhook_url`). Paginate CRM queries so imported leads are not truncated by the Data API row limit.

The primary ERP CRM route renders the lead board; legacy lead links redirect there, while configurator session tools retain their own route. Contain horizontal board scrolling within the content pane and allow toolbars to wrap so neither CRM expands the page beyond its viewport.

Render active and closed CRM leads through the shared CRMLeadCard presentation component so contact details, next activity and existing lead actions stay consistent without duplicating persistence logic.

Enrich CRM lead cards with paginated, read-only projections of recorded form, chat, email and customer configurator events; never substitute record updated_at for last interaction. Schedule next activities through the existing leads fields, isolated from changes to other lead data.
- Bruno (AI sales & back-office agent): all lead communications live in `crm_messages`; sending and AI suggestions go only through the `bruno-agent` edge function so credentials and stage objectives stay server-side. A manual WaSender message pauses Bruno 48h on that lead to avoid overlapping with the human seller.
- Clicking a CRM lead opens the client record (`CRMLeadDetail`: riepilogo, comunicazioni, configuratore) rather than the agent, and the agent's conversation surface is the shared `BrunoPanel` reused inside that record and in the dedicated `/erp/bruno` section, so a lead click always opens the customer while the agent stays reachable from its own entry point.
