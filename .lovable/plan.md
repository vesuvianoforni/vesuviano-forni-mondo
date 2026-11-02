# Mario – Agente Outbound Partnership & Customers

## Cosa fa
Mario cerca ogni giorno **pizzerie** (potenziali clienti) e **aziende Horeca** (potenziali rivenditori/partner) in Regno Unito, Francia e Germania, ne estrae i contatti pubblici aziendali e li inserisce in automatico nelle campagne **MailRush** (avvio, follow-on, follow-up), con limite di **100 nuovi contatti al giorno**. MailRush gestisce invio, riscaldamento caselle, validazione email, controllo spam e disiscrizioni.

## Interfaccia (come Bruno e Roberta)
Pagina `/erp/mario` con voce "Mario" nel menu Agenti:
- **Colonna sinistra**: riquadro "Agente" (Nuova chat + conversazioni) e sotto "Prospect" con ricerca, filtro tipo (Pizzeria / Partner Horeca), paese e stato sequenza.
- **Colonna destra**: chat con Mario (suggerimenti: "Trova 50 pizzerie a Londra", "Quanti partner hanno risposto questa settimana?", "Mostra le email in uscita di oggi", "Metti in pausa la Germania") oppure la scheda del prospect con fonte, email inviate e risposte.
- **Impostazioni Mario**: mercati attivi, limite giornaliero, orari di invio per paese, interruttore generale di pausa.

## Sequenza email (best practice)
- **Giorno 0 – Avvio**: email breve, personalizzata (nome locale, città), un solo invito: rispondere o scrivere su WhatsApp.
- **Giorno 3 – Follow-on**: aggiunge valore (foto/video del forno adatto, referenze nel paese).
- **Giorno 7 – Follow-up finale**: chiusura cortese.
- Si ferma subito se il contatto risponde, si disiscrive o l'email rimbalza; chi risponde diventa **lead nel CRM** (fase Nuovo) assegnato a Bruno/Gennaro.
- Campagne MailRush separate per tipo (Pizzeria / Partner) e lingua (EN/FR), con i 3 step già impostati; Mario prepara i testi e il template HTML Vesuviano da caricare negli step e passa a MailRush i campi personalizzati (nome locale, città, frase su misura).
- Template HTML Vesuviano (header scuro, logo, firma Gennaro Caglione), testo semplice in parallelo, link di disiscrizione in un clic, indirizzo aziendale, nella lingua del paese (EN/FR/DE). Nessun prezzo.
- Orari, riscaldamento e ritmo di invio impostati in MailRush; Mario rispetta il limite di 100 nuovi contatti/giorno.

## Ricerca contatti
- **Apify** (Google Maps scraper): pizzerie e aziende Horeca per città, con sito web.
- **Firecrawl**: legge il sito di ciascuna attività per trovare email aziendale e descrizione.
- AI classifica (pizzeria / partner / scarta) e scrive la personalizzazione.
- Deduplica con CRM, clienti esistenti, disiscritti e lista nera.

## Attenzione: Germania
In Germania le email commerciali a freddo anche verso aziende richiedono consenso preventivo (UWG §7) e rischiano diffide. Proposta: per la Germania Mario **raccoglie i prospect ma non invia**; li mette in una lista da contattare a mano o via telefono. UK e Francia: invio automatico B2B consentito con disiscrizione chiara.

## Cosa serve da te
1. **MailRush**: account con casella mittente su un dominio secondario (es. `vesuviano-forni.com`) e la chiave API (Settings → API Key), da inserire in un modulo protetto. Poi creiamo insieme le campagne e il webhook per risposte e disiscrizioni.
2. Collegare **Firecrawl** e **Apify** dalle schede che ti mostrerò.

## Dettagli tecnici
- Tabelle: `outreach_settings`, `outreach_prospects` (tipo, paese, fonte, email, stato, step, next_send_at, unique su email/dominio), `outreach_events`, `outreach_runs` (lease single-flight), `outreach_suppressions`. RLS solo admin/commerciale.
- Edge functions: `mario-chat` (stessa struttura di roberta-chat), `mario-discover` (Apify+Firecrawl, batch limitato), `mario-push` (aggiunge prospect alle campagne MailRush via API `x-api-key`, limite giornaliero, idempotenza per prospect), `mario-webhook` (eventi MailRush: risposta → lead CRM + uscita campagna; disiscrizione/bounce → lista di soppressione).
- Cron: scoperta + inserimento una volta al giorno (bounded). Eventi via webhook, nessun polling. Circuit breaker su 402/403/429 e pausa globale.
- AI Gateway `openai/gpt-6-astra` per classificazione e personalizzazione con output JSON schema.
- Riuso di AgentChat, renderer email e firma esistenti; regola in AGENTS.md.
