# Roadmap

## Completati
- [x] CRM Vesuviano: pipeline a fasi Nuovo, Qualificato, Trattativa, Vinto, Perso (colonna pipeline_stage + trigger auto-avanzamento)
- [x] Link configuratore come feature della scheda cliente (box dedicato nel dettaglio: copia, email, WhatsApp, rigenera)
- [x] Webhook sync-to-erp esteso con pipeline_stage ed evento stage_changed
- [x] CRM Lead stile Zapper replicato in Vesuviano: tabella `leads`, pagina `/erp/leads` con kanban drag & drop, CRUD, prossima attività, vinto/perso
- [x] Import iniziale: 547 lead dai form del sito (website_leads) copiati nella tabella `leads` con fase "nuovo"

## Aperti
- [ ] Importare i lead storici di Zapper ERP — bloccato: da qui non posso leggere il database di Zapper; serve un export CSV dal progetto Zapper caricato in questa chat
- [ ] Replicare pipeline e webhook in Zapper ERP — bloccato: il progetto Zapper è accessibile solo in lettura da qui; va aperto il suo progetto e incollato il codice/payload contract
