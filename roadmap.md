# Roadmap

## Contrasti e colori ERP
- [ ] Revisione palette ERP: testi e card poco leggibili.

## Catalogo Prodotti, listino annuale e sconti (2 nov 2026)
- [x] Menu Catalogo con sola voce Prodotti (Forni, Bruciatori, Altri prodotti, Sconti); costo + valuta, listino UK/FR/DE con valuta, margine.
- [x] Listino 2027 attivo creato da A→UK, B→FR, C→DE; nuovo listino in bozza per duplicazione, attivazione solo admin, archiviati in sola lettura.
- [x] Il listino attivo alimenta configuratore, pro-forma e offerte; etichette A/B/C mostrate come UK/Francia/Germania.
- [x] Tipo cliente e sconto personale nella scheda cliente CRM; sconti base per tipo.
- [ ] Applicare in automatico lo sconto del cliente in offerte e pro-forma, e prodotti "Altri" nel catalogo offerte (fase 2).
- [ ] Configuratore e chat del sito letti direttamente dal nuovo listino invece che dai campi A/B/C (fase 3).

## Caricamento progressivo Bruno
- [x] Ultimi 50 messaggi e 50 precedenti su richiesta, cursore stabile data/id, filtri server-side, conteggi completi, posizione preservata e nuovi eventi uniti senza riscaricare lo storico.
- [x] Riepiloghi aggregati al posto dello storico globale all’apertura e letture messaggi duplicate eliminate da Bruno; 18 test superati, build OK e flusso verificato con dati simulati a 1442×936, 390×844 e 1280×1800 (storico completo, filtri, doppioni, riprova e cambio cliente). Indice e due pagine reali da 50 senza sovrapposizioni verificati, permessi invoker/anon negato confermati; accesso ERP autenticato e chiamate RPC reali non verificabili con gli strumenti disponibili. Nessun invio.

## Leggibilità e composizione Bruno
- [x] Elenco clienti più ampio, ricerca e filtri raggruppati, priorità non invasive, intestazione compatta, messaggi con mittente/data e scelta esplicita del canale d’invio separata dai filtri; collegamenti e invii invariati.
- [x] Verificati con dati simulati a 1297×936, 390×844 e 1280×1800: cambio cliente/canale, bozza conservata al cambio filtro, email/nota, storico e riprova, contenimento e modalità scura; 7 test superati, build OK, nessun invio. Accesso reale non disponibile per Supabase esterno (reindirizzamento al login).

## Invio WhatsApp Gennaro
- [x] Collegata WaSender con l'API Access Token della sessione esistente di Gennaro, senza cambiare il webhook Zapper; controllo reale del collegamento HTTP 200, sessione connected.
- [x] Invio Bruno adeguato alla connessione server-side udc_wasender, errori conservati e nessun reinvio automatico; 4 test superati, funzione distribuita e build OK. Nessun messaggio cliente inviato per prova; il precedente tentativo fallito resta tale.

## UX/UI Bruno (2 nov 2026)
- [x] Testi lunghi contenuti, elenco e conversazione con larghezze vincolate; scorrimento locale senza spostare la pagina, lettura storico preservata durante aggiornamenti, caricamento/errore/riprova e richieste obsolete isolate per cliente. Su schermi stretti la conversazione mantiene spazio e ritorna all'elenco con il pulsante esistente.
- [x] Riprodotto lo spostamento orizzontale; filtri, cambio cliente, storico di 271 messaggi, nuovo messaggio, posizione di lettura e riprova verificati con dati di prova a 1273×936, 390×844 e 1280×1800, nessun overflow o errore runtime; 14 test superati e build OK. Accesso autenticato reale non disponibile per Supabase esterno.

## Preventivatore Zapper per Vesuviano
- [x] Recuperare il generatore di offerte commerciali da Zapper ER Wing e trasferire le impostazioni Vesuviano presenti nel codice.
- [x] Integrare offerte isolate da pro-forma e configuratore: cataloghi A/B/C/Rivenditori in sola lettura, IVA, sconti, tre conti, inclusioni/esclusioni, firma, lingue, anteprima/PDF, link esplicito revocabile e impostazioni admin.
- [x] Creazione, salvataggio/rilettura, anteprima, PDF multipagina, condivisione/revoca, esclusioni e prezzi mancanti verificati con dati di prova; 29 test superati e traduzione AI inglese reale verificata senza salvataggi o invii; funzione distribuita. Verifica autenticata reale indisponibile per Supabase esterno; personalizzazioni salvate solo nel database Zapper richiedono esportazione.

## Dashboard ERP
- [x] Dashboard rinnovata: contrasto leggibile, riepiloghi lead/attività scadute/produzione/bozze newsletter, pipeline a sei fasi, agenda che apre la scheda cliente e accessi rapidi inclusi Bruno e Roberta; sola lettura, nessun cambiamento ai flussi. 16 test superati e verifica con dati di prova a 1280, 1493 e 390 px, modalità scura, paginazione oltre 1000 lead, aggiornamento e stati vuoti/errore, nessun errore runtime. Accesso autenticato reale non verificabile per il Supabase esterno.

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
- [x] Newsletter personalizzate col nome completo registrato del lead, salvato per destinatario all’approvazione; saluto neutro localizzato quando manca, niente nomi inventati o saluti duplicati. Campo nome separato per anteprima/prova; funzione distribuita, 37 test superati e anteprima verificata con dati di prova (cambio rapido nome, lingua EN e fallback), nessun invio. Verifica autenticata e recapito reali non disponibili per il Supabase esterno.
- [x] Newsletter: logo originale centrato su fondo scuro protetto (bgcolor e sfondo uniforme), CTA WhatsApp +39 350 928 6941 localizzata e firma Gennaro Caglione, Sales & Export Manager; 27 test superati, HTML reale verificato nell'anteprima con dati di prova a 1280/390 px e nelle cinque lingue, incluse foto aggiunte/rimosse e testo semplice, nessun invio. Verifica Gmail iOS reale ancora da fare con una nuova prova; accesso ERP autenticato esterno non disponibile.
- [x] Gestione foto newsletter: foto principale e tre aggiuntive visibili senza ritagli, scelta in galleria con ricerca/ingrandimento, sostituzione e rimozione esplicite; anteprima aggiornata senza salvataggi o invii. Flusso verificato con dati di prova a 1280, 1442 e 390 px, senza errori o scorrimento orizzontale; verifica autenticata reale non disponibile per questo progetto esterno.
- [x] Regole newsletter B2B condivise; prezzi solo su richiesta diretta, dati monetari omessi dal catalogo negli altri casi e output inatteso bloccato. Calendario iniziale di 5 occasioni aggiuntive, un solo controllo quotidiano, coda senza doppioni e lease atomica. 25 test e due generazioni AI reali verificati senza invii; accesso autenticato ERP non disponibile.
- [x] Chiedi a Roberta: tema prima di generare, traduzioni IT/EN/FR/DE/ES con anteprima, lingua destinatario stimata da prefisso e fallback paese/bozza; invio bloccato con traduzioni mancanti o superate. 17 test superati, traduzione AI reale verificata senza invii, flusso completo con dati di prova verificato. Accesso autenticato reale resta indisponibile.
- [x] Pagina dedicata /erp/roberta (menu "Roberta AI") con pilastri marketing e campagne newsletter integrate
- [x] ERPNewsletter supporta modalità embedded
- [ ] Verifica autenticata su ERP reale (accesso non disponibile in sandbox)

- [x] Import WhatsApp Gennaro (WaSender) da Zapper — ricevitore pronto; attivazione lato Zapper da fare
