# Roadmap

## Completati
- [x] CRM Vesuviano: pipeline a fasi Nuovo, Qualificato, Trattativa, Vinto, Perso (colonna pipeline_stage + trigger auto-avanzamento)
- [x] Link configuratore come feature della scheda cliente (box dedicato nel dettaglio: copia, email, WhatsApp, rigenera)
- [x] Webhook sync-to-erp esteso con pipeline_stage ed evento stage_changed
- [x] CRM Lead stile Zapper replicato in Vesuviano: tabella `leads`, pagina `/erp/leads` con kanban drag & drop, CRUD, prossima attività, vinto/perso
- [x] Import iniziale: 547 lead dai form del sito (website_leads) copiati nella tabella `leads` con fase "nuovo"
- [x] Importate 1.161 righe da lead_vesuviano.csv: aggiornati i contatti per email/telefono, preservati note, fasi, paese, città, priorità e archiviazione; 1.285 lead totali dopo import
- [x] Aggiunta Pre-qualificato ai due CRM; catalogo fasi condiviso e test per mappatura e raggruppamento
- [x] /erp/crm mostra i lead importati; Link Configuratore conserva le sessioni; verificato contenimento schermata a 1070 e 390 px con soli dati di prova (accesso reale non disponibile)

## Aperti
- [ ] Confrontare le card lead Zapper e allineare le card del CRM Vesuviano, preservando funzioni e scorrimento interno
- [ ] Replicare pipeline e webhook in Zapper ERP — bloccato: il progetto Zapper è accessibile solo in lettura da qui; va aperto il suo progetto e incollato il codice/payload contract
