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
- [x] Card lead allineate alla struttura Zapper: intestazione/azioni, contatti separati, attività con data/ora/note/assegnatario, valore/fonte/trascinamento; presentazione condivisa per lead attivi e chiusi. Verificati layout 1070/390 px, modifica e rilettura, conferma/annullamento eliminazione, spostamento desktop e vinto/chiusi con soli dati di prova (accesso reale non disponibile)
- [x] Card orientate alle attività secondo Pipedrive/HubSpot: ultima interazione da eventi esistenti (mai updated_at), prossima attività relativa e scaduta, pianificazione rapida nei campi esistenti; Vinto/Perso nel menu con conferma. 13 test e flussi UI verificati a 1070/390 px con dati di prova; accesso reale indisponibile. Telefonate non registrate restano sconosciute

## Aperti
- [ ] Replicare pipeline e webhook in Zapper ERP — bloccato: il progetto Zapper è accessibile solo in lettura da qui; va aperto il suo progetto e incollato il codice/payload contract
- [x] Bruno: console comunicazioni per lead, suggerimenti per fase, invio WA/WaSender/email/nota
- [ ] Collegare WhatsApp API di Bruno (connettore WhatsApp) — attende collegamento numero
- [ ] Collegare WaSender di Gennaro (chiave WASENDER_API_KEY) — attende chiave
- [ ] Integrazione Gmail per invio email — rimandata dall'utente
- [ ] Ricezione messaggi in entrata e follow-up automatici programmati
