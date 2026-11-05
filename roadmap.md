# Roadmap

## Materiali: errore di caricamento (5 nov 2026)
- [ ] Correggere il collegamento ambiguo ai prodotti nella libreria e nella ricerca materiali di Bruno, mantenendo le associazioni multiple e i permessi esistenti.
- [ ] Ripetere le richieste reali, eseguire i test materiali e verificare la pagina; distinguere la prova autenticata se non disponibile.

## Materiali: collegamento a più prodotti (5 nov 2026)
- [x] Selezione multipla con ricerca in caricamento e modifica; conservati 149 materiali e tutti i 149 collegamenti precedenti, senza ricaricare file.
- [x] Associazioni in product_asset_links e salvataggio atomico save_product_material; filtri libreria, scheda prodotto e ricerca Bruno su tutti i prodotti aggiornati; bruno-chat distribuita. Nessun accesso anon alle associazioni o al salvataggio.
- [x] 25 test superati; verifica SQL reale con due prodotti, deduplicazione, rimozione singola, materiale aziendale, rollback errore e accesso anon negato (dati di prova annullati). UI isolata selezione → salvataggio → riapertura → rimozione → filtro a 1280/1125/390 px, zero errori/overflow; build OK. Dieci avvisi sicurezza preesistenti invariati.
- [ ] Verifica autenticata completa nel proprio ERP: bloccata dalla sessione non disponibile per Supabase esterno; la prova visiva usa dati isolati.

## Bruno: panoramica e cabina operativa (5 nov 2026)
- [x] Chiamate con istruzioni e tipologie Qualifica/Trattativa; eliminato il campo obbligatorio consenso documentato, mantenuti avviso registrazione, approvazioni e tutele applicabili. Migrazione applicata (tipo chiamata + istruzioni operative), prompt vocale e strumenti aggiornati, 29 test superati, tre funzioni distribuite.
- [ ] Registro condiviso azioni/proposte/esiti, approvazioni ERP/Telegram e KPI esatti senza attribuire gli import Zapper a Bruno.
- [ ] Panoramica iniziale, Agente Piano/Storico/Chat/Chiamate, Comunicazioni e Impostazioni separate.
- [ ] Test delle regole, verifica flussi e schermi, distribuzione e controllo permessi.

## Bruno: registrazioni e storico telefonico (5 nov 2026)
- [x] Audio per-call TeXML dual/both, transcript retention Telnyx e avviso iniziale verificati, callback recording/analyzed firmati con binding chiamata/assistente; Zapper e SIP invariati.
- [x] Transcript parlato (senza tool/costi), riepilogo italiano economico e audio privato; unica proiezione CRM alla data originale, URL audio firmati staff-only. Risultati recuperati da coda protetta con tentativi limitati e controllo ogni 5 min solo finché pendente, nessun cron attivo a coda vuota.
- [x] Pannello Chiamate In programma/Eseguite, cliente/esito/durata, conferma con avviso, paginazione e dettaglio audio/riepilogo/trascrizione riusato nel CRM.
- [x] 21 test superati e controllo Deno isolato (export cors non disponibile nel resolver locale); funzione distribuita. Telnyx retention/greeting/instructions riletti HTTP 200, percorso credenziali app HTTP 200, endpoint senza sessione o firma rifiutati 401, permessi coda/storage verificati. UI con dati simulati a 1280/1442/390 px, audio riprodotto e transcript/riepilogo leggibili, zero errori/overflow, build OK.
- [ ] Telefonata reale completa e successiva rilettura autenticata CRM: richiedono richiesta/approvazione della prova; Supabase esterno senza sessione gestita. Nessuna chiamata avviata (0 record); non verificati audio/transcript reali o callback in produzione. Dieci avvisi sicurezza preesistenti invariati.

## Bruno: chiamate Telnyx in inglese (5 nov 2026)
- [x] Assistente Telnyx creato con voce maschile inglese, knowledge base e catalogo live, dati di qualificazione e chiusura; numero UK di origine +447457416033, nessun cambio al SIP inbound. Audio e storico Telnyx non conservati.
- [x] Proposte immutabili e avvio approvato ERP/Telegram; pannello Chiamate con conferma/annullamento/esiti. Merge atomico qualificazione nel cliente, firme Ed25519, nessun costo interno o invio/ordine/offerta dal motore vocale; registrazioni e trascrizioni Zapper restano separate.
- [x] 13 test superati, tre funzioni distribuite, assistente/4 strumenti riletti su Telnyx, percorso credenziali app HTTP 200; tool test Telnyx firmato supera la firma e blocca chiamata inesistente 403, richieste non firmate 401. UI conferma/annullamento verificata con dati simulati a 1280 e 390 px senza errori/overflow, build OK. Nessuna telefonata avviata.
- [ ] Prova telefonica end-to-end con voce, knowledge e salvataggio: richiede richiesta/approvazione della prova sul contatto di test; sessione ERP autenticata non disponibile in sandbox per Supabase esterno. I test del pannello sono simulati e non verificano una conversazione reale. Dieci avvisi sicurezza preesistenti invariati.

## Modelli AI economici (3 nov 2026)
- [x] Astra individuato in chat agenti, verifiche/bozze/piani Mario, suggerimenti Bruno, newsletter e traduzioni: catalogo autenticato verificato, preferenza economica salvata.
- [x] Selezione condivisa server-side: Luna per Responses, Flash Lite per volumi, Flash per editoriale/contratti, Flash Lite Image per tutte le funzioni immagini; nessuna modifica ai limiti email o alle approvazioni.
- [x] 119 test superati; 21 funzioni distribuite, chat pubblica e contratti HTTP 200, strumenti con continuazione e JSON validi, helper SDK Mario e traduzione offerta con numeri preservati, immagini reali verificate. Log dell’autopilota confermano Luna e salvataggio email verificata in archivio; zero richieste Astra dopo il passaggio. Nessun invio di prova. Accesso autenticato ERP non verificabile con Supabase esterno (401); newsletter e altre operazioni protette non esercitate dal proprio account.

## Mario: esiti Enrich (3 nov 2026)
- [x] Corretto il falso «0 trovati» con presentazione condivisa Live/Ricerca: email verificata e pertinenza separate, motivi consultabili; conteggio lotti completati allineato a done.
- [x] Pagine Contatti prioritarie rispetto a Chi siamo; link duplicati/esteri/autoreferenti esclusi. Massimo due pagine per verifica e controlli email invariati.
- [x] 36 test superati, sito senza errori, quattro funzioni distribuite; archivio reale conferma 6 email salvate da 32 verifiche completate. Presentazione isolata verificata a schermo senza errori; endpoint Live senza accesso restituisce 401, verifica autenticata nell'ERP non disponibile con Supabase esterno. Nessuna nuova ricerca o email avviata per prova.

## Mario: campagne da 500 organizzazioni (2 nov 2026)
- [x] Piani con obiettivo scelto di 500 organizzazioni, query/quartieri a lotti max 100, tetto iniziale 1.500 candidati e fino a 500 verifiche; web Firecrawl e Google Maps Apify dichiarati, deduplicazione ed esclusioni invariati, nessuna confusione con 100 email/giorno.
- [x] Motori/RPC/progressi allineati, stop a obiettivo o ricerche esaurite, conteggi esaminati/verificati separati, pausa dieci secondi tra i passaggi e guard server AI; piani approvati legacy immutati. Piano Londra ancora proposto aggiornato a 15 lotti/1.500 candidati/500 verifiche, senza approvarlo né avviare raccolte; invii in pausa.
- [x] 37 test superati e Deno check Mario chat/worker OK; tre funzioni distribuite. Generazione AI reale valida (obiettivo/verifiche 500, 1.200 candidati, 24 passaggi, entrambi provider), nessun salvataggio/invio da prova. Input actor Compass pubblico verificato: limite 100 supportato; Firecrawl diretto collegato, 4.709 crediti disponibili. Callback non autorizzato 403. UI simulata proposta→conferma annullata→approvazione→arresto→rilettura progressi, a 1280×1800,1245×936,390×844 senza errori/overflow, build OK.
- [ ] Ricerca reale autenticata fino all’archivio: Supabase esterno senza sessione gestita; prove UI sono simulate e nessuna raccolta a pagamento avviata. Fonte Tripadvisor dedicata non attiva: schema, idoneità e costi dell’actor/API non verificati; web/Google Maps sono le sole fonti operative. Sette avvisi sicurezza preesistenti invariati.

## Mario: richieste e chat ritrovabili (2 nov 2026)
- [x] Richieste salvate prima dei tool e risposte salvate progressivamente/finalmente in outreach_chat_threads, con accesso staff limitato al proprietario; importazione locale senza sovrascrittura. Recuperata richiesta Londra dal piano reale (non il testo originale della risposta), nessuna ricerca/email avviata.
- [x] Cronologia server paginata e accessibile anche su telefono, URL stabile, conversazione mancante esplicita, errore/riprova senza esecuzione duplicata; archiviazione senza eliminare i compiti.
- [x] 37 test superati; flusso UI simulato recupero→nuova richiesta→rilettura dopo rimozione storico locale→cambio chat→URL mancante→errore/riprova, a 1280×1800, 1245×936 e 390×844, zero errori/overflow. Build OK, mario-chat distribuita, endpoint non autenticato 401; permessi verificati: anon negato, browser non può sovrascrivere messaggi, server può salvare.
- [ ] Prova completa sul proprio account: Supabase esterno senza sessione gestita, verifica UI basata su dati simulati; sette avvisi sicurezza preesistenti invariati.

## Mario: proposta e approvazione nella conversazione (2 nov 2026)
- [x] Piano salvato direttamente sotto la risposta di Mario, con approvazione, conferma e stato condivisi con Ricerca; rimosso il passaggio obbligatorio Rivedi piano. Riutilizzata la presentazione esistente e AI Elements Tool per i dettagli chiusi; trasporto/storico legacy invariati per evitare una migrazione fuori ambito.
- [x] Flusso simulato proposta→conferma annullata→approvazione→avanzamento→arresto→rilettura e seconda conversazione senza dati dell’altra verificato a 1280×1800, 1353×936 e 390×844, senza overflow/errori. Build OK; controllo qualità globale con 361 errori preesistenti, nessun errore nei file modificati (due avvisi nei nuovi elementi). Nessuna ricerca/email reale avviata; prova autenticata completa resta non disponibile per Supabase esterno.

## Mario: autopilot della ricerca (2 nov 2026)
- [x] Richiesta in chat e piano persistente basato su impostazioni, conoscenze, riepiloghi archivio Mario e CRM; nuova proposta per modifiche, nessuna ricerca prima dell’approvazione.
- [x] Approvazione atomica staff, un piano attivo, ambito immutabile (max 12 passaggi/100 risultati/20 verifiche come limiti tecnici iniziali), progressi, arresto e risultati in archivio senza autorizzare invii. Worker separato avviato da eventi DB e webhook terminali Apify, senza cron permanente; esiti incerti arrestati senza reinvio. Domini già CRM esclusi quando ricavabili dall’email aziendale; criteri non verificabili richiedono revisione.
- [x] 63 test superati, incluso 12 nuovi test ricerca; gate SQL eseguiti e annullati senza ricerche. UI simulata richiesta→proposta→annullamento conferma→approvazione→arresto→rilettura verificata a 1280×1800, 1353×936, 390×844, zero overflow/errori; build OK, tre funzioni distribuite. Endpoint senza sessione 401 e callback non autorizzata 403, nessun piano live approvato, nessuna email inviata.
- [ ] Prova autenticata reale ricerca→webhook Apify→verifica→archivio: Supabase esterno non fornisce sessione gestita in sandbox; la prova UI usa dati simulati e non verifica servizi reali, generazione del piano o callback provider. Restano sette avvisi sicurezza preesistenti, nessuno introdotto dal lavoro.

## Mario: revisione template orientati all’aiuto (2 nov 2026)
- [x] Firma visibile info@vesuvianoforni.com, pulsante WhatsApp EN/FR con messaggio localizzato; logo da https://vesuvianoforni.com/lovable-uploads/vesuviano-logo-bianco.png (redirect pubblico verso www verificato), nessuna immagine Lovable. Mittente SMTP dedicato invariato.
- [x] Dodici testi EN/FR riscritti: checklist accessi/energia/brief, follow-up con chiarimento aggiuntivo, chiusura gentile; istruzioni condivise aggiornate senza alterare modello AI, invii o cadenza. Fonti: Mailchimp style guide e Google sender guidelines; nessuna promessa di risultati.
- [x] 51 test superati; preview UI simulata verificata con info@, pulsante WhatsApp corretto e logo realmente caricato. Nessuna modifica alle sequenze già approvate. Verifica autenticata reale non disponibile con Supabase esterno. Generazione AI restituita strutturalmente valida ma con richiesta di verifica del prospect, non email utilizzabili: prova interrotta, nessun ulteriore tentativo né invio.

## Mario: email HTML, archivio e avvio controllato (2 nov 2026)
- [x] Chat centrale persistente, archivio pizzerie/partner paginato a 25, scheda con fonti e idoneità; sequenze, email HTML, KPI e impostazioni affiancati; chat accessibile su mobile.
- [x] Dodici modelli HTML EN/FR, tre passaggi per pizzerie/partner, firma Gennaro e opposizione, modificabili admin; sequenze immutabili con approvazione esplicita e anteprima.
- [x] Tetto 100 email complessive/giorno (tentativi e follow-up inclusi), minimo cinque minuti, lun–ven 9–18 Roma come valori iniziali modificabili; prenotazione atomica, snapshot separati da Bruno, stop risposte/opposizioni, recupero accettazioni senza reinvii.
- [x] KPI esatti dai record, archivio invii e controlli avvio; consegne/aperture/clic dichiarati non misurati, nessuna statistica inventata.
- [x] 50 test superati, build OK e flussi UI simulati a 1280×1800, 1353×936, 390×844 senza errori/overflow; HTML, approvazione, impostazioni e KPI riletti in UI. SMTP IONOS TLS 465 + IMAP e cartella Posta inviata verificati realmente senza invio. mario-agent distribuita; accesso senza sessione 401.
- [ ] Attivazione e programmazione automatica: bloccate finché compatibilità IONOS per outreach, idoneità destinatari, autenticazione dominio e prova completa invio/risposta autenticata non siano verificati. Supabase esterno non offre sessione autenticata gestita in sandbox; nessuna email cliente inviata, nessun cron creato.

## Contrasti e colori ERP
- [x] Revisione palette ERP: colori scritti a mano sostituiti con il tema in tutte le pagine ERP (487 righe), tema chiaro con accento ambra. Non verificato a schermo con login reale.

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

## Mario: motori agentici e conoscenze
- [x] Casella dedicata ciao@vesuviano-forni.com configurata e accessi IMAP/SMTP verificati senza invii automatici.
- [x] Motori ricerca Firecrawl/Apify, verifica contatti e qualificazione con fonti e deduplicazione; connettori verificati, Apify asincrono con aggiornamento esplicito.
- [x] Istruzioni condivise, system prompt protetto e knowledge base Vesuviano modificabile dall’amministratore; costi esclusi, riepiloghi esatti.
- [x] Sequenze 0/3/7 in bozza con anteprima HTML, controlli prezzi, fonti e stop; nessun invio dal modello.
- [x] 30 test superati; generazione strutturata reale di tre bozze e ciclo tool/risposta HTTP 200 verificati senza salvataggi o invii. UI istruzioni/conoscenze/anteprima/approvazione verificata con dati di prova, nessun errore o overflow; build OK.
- [ ] Verifica autenticata completa di ricerca → verifica → bozza → rilettura: non disponibile per Supabase esterno senza sessione gestita (endpoint protetto 401); prove UI non sostituiscono questo controllo.
- [ ] Attivazione invii e risposte automatiche: motore isolato preparato, ma avvio e scheduling bloccati dai prerequisiti elencati nella sezione Mario invio controllato.
