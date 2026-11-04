# Cabina di comando Bruno su Telegram (gruppo Ufficio AI)

## Obiettivo
Trasformare il gruppo Telegram in una vera regia: avvisi chiari e ordinati, azioni con un tocco, comandi rapidi, riepiloghi giornalieri, senza rumore.

## 1. Struttura fissa dei messaggi di Bruno
Ogni messaggio segue lo stesso schema, in italiano, formattato in modo leggibile:

```text
[icona] TIPO · Priorità
Cliente: Nome Cognome (Paese, fase CRM)
Canale: WhatsApp Gennaro / WhatsApp Bruno / Email / Chiamata
---
Testo (max ~600 caratteri, poi "continua nella scheda")
---
Contesto: ultima interazione, prossima attività, valore offerta
[pulsanti]
```

Tipi: Nuovo lead, Messaggio in arrivo, Proposta di azione, Esito azione, Promemoria, Riepilogo, Errore.
Priorità: Alta (lead caldo, cliente in Trattativa, risposta a offerta), Normale, Bassa.

## 2. Pulsanti sotto ogni avviso
- Messaggio in arrivo: **Suggerisci risposta**, **Apri scheda**, **Rimanda 2h**, **Segna gestito**
- Nuovo lead: **Qualifica**, **Primo messaggio**, **Apri scheda**
- Proposta: **Approva**, **Modifica**, **Annulla** (con anteprima nella lingua del cliente + traduzione italiana)
- Dopo l'esecuzione: il messaggio della proposta si aggiorna con "Inviato da X alle 12:40" e chi ha approvato, così non si approva due volte.

## 3. Comandi rapidi (menu `/` di BotFather)
- `/oggi` – agenda e attività scadute
- `/lead <nome>` – scheda sintetica del cliente
- `/caldi` – clienti in Trattativa senza risposta da 48h
- `/offerte` – offerte inviate in attesa
- `/mario` – stato autopilota e invii del giorno
- `/aiuto` – esempi di istruzioni

## 4. Riepiloghi automatici
- Ore 9:00: briefing (nuovi lead, messaggi senza risposta, attività del giorno, offerte da seguire)
- Ore 18:00: chiusura (cosa è stato fatto, cosa resta aperto)
- Solo lun–ven, ora di Roma.

## 5. Regole anti-rumore
- Messaggi multipli dello stesso cliente entro 5 minuti raggruppati in un solo avviso.
- Importazioni storiche e note interne mai notificate (già così).
- Se un avviso non viene gestito entro 2h in fase Trattativa, un solo promemoria.

## 6. Sicurezza e tracciabilità
- Ogni azione registra chi l'ha approvata dal gruppo.
- Proposte scadono dopo 24h.
- Comandi accettati solo nei gruppi/chat collegati all'ERP.

## Dettagli tecnici
- Configurazione comandi via `setMyCommands`, testo con `parse_mode: HTML`, aggiornamento proposte via `editMessageText`.
- Nuovi `callback_data` gestiti in `telegram-bruno`; snooze/gestito salvati su `telegram_notifications` (colonne `handled_by`, `handled_at`, `snoozed_until`).
- Riepiloghi con pg_cron che chiama `telegram-bruno` con token privato.
- Raggruppamento: finestra di 5 minuti per lead prima dell'invio.
