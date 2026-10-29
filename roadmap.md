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
- [x] Impaginazione HTML email ERP e gestione firme in Bruno → Casella email → Firme email; Gennaro Caglione predefinito, scelta firma e anteprima nel composer, snapshot immutabile MIME per invio/copia/CRM. Logo pubblico verificato, 27 test email e 20 CRM superati, flusso firme/anteprima verificato con dati di prova; accesso autenticato reale indisponibile e nessuna nuova email inviata. Indirizzo postale facoltativo da confermare.
- [ ] Replicare pipeline e webhook in Zapper ERP — bloccato: il progetto Zapper è accessibile solo in lettura da qui; va aperto il suo progetto e incollato il codice/payload contract
- [x] Bruno: console comunicazioni per lead, suggerimenti per fase, invio WA/WaSender/email/nota
- [x] Sezione dedicata "Bruno AI" nel menu ERP (`/erp/bruno`): elenco clienti con coda di follow-up per fase, filtri fase/pipeline/ricerca e pannello comunicazioni; click sul lead nel CRM apre ora la scheda cliente (Riepilogo / Comunicazioni / Configuratore). 20 test e flussi UI verificati a 1280 px con soli dati di prova (accesso reale non disponibile)
- [ ] Collegare WhatsApp API di Bruno (connettore WhatsApp) — attende collegamento numero
- [ ] Collegare WaSender di Gennaro (chiave WASENDER_API_KEY) — attende chiave
- [x] Sincronizzazione IMAP/SMTP info@vesuvianoforni.com: credenziali protette, invio con outbox e copia MIME separata in Inviata, deduplicazione fisica/logica, conversazioni CRM, log e controllo ogni 15 minuti; connessioni e prime importazioni reali verificate
- [x] Email di prova autorizzata inviata da info@vesuvianoforni.com a stanislaoelefante@gmail.com: SMTP accepted e copia IMAP appended verificati; conversazione registrata nel CRM. Verifica visiva autenticata non disponibile
- [ ] Ricezione messaggi in entrata e follow-up automatici programmati

## Roberta AI (29 ott 2026)
- [ ] Personalizzare newsletter con nome/nome completo del lead e saluto neutro localizzato quando manca; verificare anteprima, prove e invio senza spedire ai clienti.
- [x] Newsletter: logo originale centrato su fondo scuro protetto (bgcolor e sfondo uniforme), CTA WhatsApp +39 350 928 6941 localizzata e firma Gennaro Caglione, Sales & Export Manager; 27 test superati, HTML reale verificato nell'anteprima con dati di prova a 1280/390 px e nelle cinque lingue, incluse foto aggiunte/rimosse e testo semplice, nessun invio. Verifica Gmail iOS reale ancora da fare con una nuova prova; accesso ERP autenticato esterno non disponibile.
- [x] Gestione foto newsletter: foto principale e tre aggiuntive visibili senza ritagli, scelta in galleria con ricerca/ingrandimento, sostituzione e rimozione esplicite; anteprima aggiornata senza salvataggi o invii. Flusso verificato con dati di prova a 1280, 1442 e 390 px, senza errori o scorrimento orizzontale; verifica autenticata reale non disponibile per questo progetto esterno.
- [x] Regole newsletter B2B condivise; prezzi solo su richiesta diretta, dati monetari omessi dal catalogo negli altri casi e output inatteso bloccato. Calendario iniziale di 5 occasioni aggiuntive, un solo controllo quotidiano, coda senza doppioni e lease atomica. 25 test e due generazioni AI reali verificati senza invii; accesso autenticato ERP non disponibile.
- [x] Chiedi a Roberta: tema prima di generare, traduzioni IT/EN/FR/DE/ES con anteprima, lingua destinatario stimata da prefisso e fallback paese/bozza; invio bloccato con traduzioni mancanti o superate. 17 test superati, traduzione AI reale verificata senza invii, flusso completo con dati di prova verificato. Accesso autenticato reale resta indisponibile.
- [x] Pagina dedicata /erp/roberta (menu "Roberta AI") con pilastri marketing e campagne newsletter integrate
- [x] ERPNewsletter supporta modalità embedded
- [ ] Verifica autenticata su ERP reale (accesso non disponibile in sandbox)
