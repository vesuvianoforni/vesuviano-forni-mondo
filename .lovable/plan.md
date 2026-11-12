# Benvenuto automatico ai nuovi lead (WhatsApp + chiamata di Bruno)

## Cosa succede
1. Arriva un nuovo lead generico dal sito (non le richieste Pronta Consegna, che hanno già il loro flusso).
2. Bruno calcola l'orario della chiamata:
   - richiesta tra 9:30 e 18:45 (ora italiana, lun–ven) → stesso giorno, 30–45 minuti dopo;
   - altrimenti → giorno lavorativo successivo tra 9:30 e 10:00.
3. Subito dopo, Bruno invia un WhatsApp dalla linea del paese del cliente (+44 = Bruno UK, altrimenti Bruno IT): si presenta, annuncia "ti chiamo alle ore X di giorno Y" e propone di continuare su WhatsApp, se il cliente preferisce.
4. All'orario annunciato Bruno chiama da solo, ma **solo se**:
   - il cliente non ha risposto su WhatsApp (se risponde, la chiamata salta e si prosegue in chat);
   - il lead non è in pausa (per esempio dopo un messaggio manuale di Gennaro) e non è già stato chiamato;
   - l'automatismo è acceso.
5. Tutto risulta nella scheda del cliente e nella sezione Automatismi, con un interruttore per accenderlo e spegnerlo.

## Limiti da sapere prima
- **Modello WhatsApp da approvare**: per scrivere per primi a un cliente, WhatsApp accetta solo messaggi standard approvati da Meta (fino a 48 ore). Creo io il modello (in inglese per UK, in italiano per la linea IT) con nome, ora e giorno da riempire. Finché Meta non lo approva, l'automatismo resta in attesa e non invia niente.
- **Chiamate di Bruno solo in inglese dal numero UK**: per i clienti non inglesi Bruno manda il WhatsApp ma non chiama. All'orario arriva un promemoria Telegram al team. Più avanti si possono aggiungere altre lingue.
- **Chiamata senza approvazione**: oggi ogni chiamata di Bruno va approvata dal team. Per questo automatismo la approvi una volta sola, accendendo l'interruttore. Ogni chiamata viene fatta una volta sola e non viene mai ripetuta se l'esito è incerto.
- Si parte con l'interruttore **spento**, così lo accendi tu dopo la prova con il lead di test (Stanislao).

## Dettagli tecnici
- Nuova tabella `bruno_welcome_jobs` (lead, linea, call_at, stato: pending_template/sent/call_queued/skipped/done/failed, wamid, chiave di operazione univoca per lead): una riga per lead, deduplicata.
- La creazione la fa il trigger esistente `website_lead_to_crm`: inserisce il job con `call_at` calcolato in SQL (fuso Europe/Rome). Un risveglio all'inserimento, senza polling permanente.
- L'invio WhatsApp passa da `bruno-agent` (template per linea, operazione riservata, nessun reinvio se l'esito è incerto). La chiamata usa il percorso esistente di `bruno-voice` con un ramo "autonomo" che verifica lato server il flag `bruno_automations.new_lead_welcome`, la pausa del lead e l'assenza di risposte inbound dopo il WhatsApp.
- Le chiamate programmate vengono eseguite da un tick con lease, attivo solo finché ci sono job in attesa (stesso schema dei piani chiamate).
- La card "Benvenuto nuovo lead" negli Automatismi diventa attivabile; test per il calcolo dell'orario (fascia, weekend, limite delle 18:45).
