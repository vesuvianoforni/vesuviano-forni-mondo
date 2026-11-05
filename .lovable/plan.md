# Bruno: panoramica e cabina operativa

## Valutazione
Oggi la prima schermata mescola chat interna, clienti e impostazioni. Il pannello chiamate ha già proposte e risultati, ma manca un piano unico delle altre azioni.

La revisione automatica del prodotto non è ancora disponibile; questa proposta si basa sulla sezione attuale e sui dati registrati.

**Scelta proposta:** Bruno si apre sui KPI. La chat non è la prima schermata né rimane visibile nelle altre viste.

## Struttura

| Sezione | Contenuto |
|---|---|
| **Panoramica** | KPI, priorità di oggi, approvazioni pendenti, anomalie e accesso alla cabina agente |
| **Agente** | Quattro viste: **Piano**, **Storico**, **Chat con Bruno**, **Chiamate** |
| **Comunicazioni** | Conversazioni dei clienti per email e WhatsApp; collegamento alla scheda CRM |
| **Impostazioni** | Conoscenze, collegamenti email/Telegram e configurazione voce |

### 1. Panoramica: capire subito la situazione
- Periodo selezionabile: oggi, ultimi 7 giorni, ultimi 30 giorni.
- Cinque indicatori: **azioni da approvare**, **attività previste oggi**, **azioni concluse**, **messaggi inviati da Bruno**, **chiamate concluse da Bruno**.
- Sotto: prossime attività e risultati recenti, ciascuno cliccabile; errori ed esiti incerti in una lista distinta.
- Contesto CRM separato: clienti nuovi, da qualificare e in trattativa. Non presentarli come vendite ottenute da Bruno.

**Attendibilità:** lo storico contiene migliaia di messaggi e chiamate importati da Zapper; non vanno contati come lavoro dell’agente. Oggi non risultano chiamate Telnyx di Bruno o prossime attività CRM pianificate. Mostrare lo zero reale, non inventare un piano. Gli invii senza attribuzione certa restano nello storico comunicazioni, non nei KPI dell’agente.

### 2. Agente → Piano
Lista del lavoro proposto e previsto, non una seconda chat:
- Cliente, obiettivo, azione, canale, eventuale data/ora, origine della richiesta e motivo della priorità.
- Stati distinti: **da approvare**, **approvata / da eseguire**, **in corso**, **bloccata**.
- Aprendo un’azione: testo esatto destinato al cliente, materiali/offerta collegati, approvazione e risultato atteso.
- Le attività manuali del CRM compaiono come **promemoria CRM**, non come operazioni già autorizzate a Bruno.
- Una data prevista non avvia da sola una chiamata o un invio: restano le conferme e le regole attuali. Nessun nuovo autopilota in questa revisione.

### 3. Agente → Storico
- Azioni realmente eseguite, con cliente, data, canale, autore/approvazione ed esito verificato.
- Distinguere conclusa, fallita, annullata ed esito incerto; uno squillo avviato non è una conversazione conclusa.
- Apertura del risultato: messaggio inviato, offerta/PDF o conversazione telefonica con audio, trascrizione e riepilogo.
- Collegamenti ai record esistenti, senza duplicare email, offerte, ordini o chiamate Zapper.

### 4. Dove mettere la chat
- **Chat con Bruno**, nella pagina Agente: istruzioni, domande, analisi e preparazione delle azioni.
- Il piano e gli esiti sono consultabili anche senza rileggere una conversazione.
- **Comunicazioni** e scheda CRM: esclusivamente messaggi e documenti del cliente; mai mischiare i comandi interni.
- **Chiamate**, nella pagina Agente: mantenere le due liste in programma/eseguite e il dettaglio già costruito, portandole fuori dal solo pannello a comparsa.

## Realizzazione
1. Riorganizzare navigazione e primo ingresso; conservare i collegamenti esistenti a cliente e chat.
2. Introdurre un registro centrale delle azioni Bruno e del loro piano: proposte, approvazioni e risultati consultabili dal team. Collegare ERP e richieste Telegram senza duplicare le approvazioni.
3. Alimentare KPI e storico da questo registro e dai risultati effettivi; utilizzare i promemoria CRM soltanto per l’agenda.
4. Collegare le viste Chat, Comunicazioni, Chiamate e Impostazioni alle superfici attuali.

## Dettagli tecnici
- React/Vite e tema ERP esistenti; viste navigabili con URL, paginazione e scorrimento contenuto.
- Letture riepilogative con conteggi esatti e periodo nel fuso Roma; accesso limitato ad amministratore e commerciale.
- Registro server-side delle azioni con riferimento a cliente, richiesta, approvazione, chiamata/messaggio/offerta e stato; non derivare gli esiti dal testo della chat o dal solo aggiornamento del cliente.
- Riutilizzare gli strumenti Bruno e i controlli di invio esistenti; nessun nuovo motore di consegna, nessun reinvio automatico di operazioni incerte.
- Conservare separati chat interne, comunicazioni dei clienti e registrazioni di Zapper. Non cambiare le fasi CRM, i prezzi o i permessi operativi.

## Verifica
- Test sui KPI: periodo, attribuzione a Bruno, esclusione importazioni Zapper, stati non riusciti e assenza di duplicati.
- Verifica computer/telefono: panoramica → piano → approvazione → risultato → cliente, senza chat estranee alla vista.
- Controllo accessi e rilettura dei risultati salvati. La prova telefonica reale resta soggetta a richiesta e approvazione; l’accesso autenticato al Supabase esterno non è disponibile nel sandbox.