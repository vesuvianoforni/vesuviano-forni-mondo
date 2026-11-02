# Mario – Agente Outbound Partnership & Customers

## Cosa fa
Mario cerca ogni giorno **pizzerie** (potenziali clienti) e **aziende Horeca** (potenziali rivenditori/partner) in Regno Unito, Francia e Germania, ne estrae i contatti pubblici aziendali e invia in automatico una sequenza di email professionali da una casella dedicata, con limite di **100 nuovi contatti al giorno**.

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
- Template HTML Vesuviano (header scuro, logo, firma Gennaro Caglione), testo semplice in parallelo, link di disiscrizione in un clic, indirizzo aziendale, nella lingua del paese (EN/FR/DE). Nessun prezzo.
- Invii distribuiti nell'orario lavorativo locale (martedì–giovedì preferiti), riscaldamento graduale della casella: 20/giorno la prima settimana, poi fino a 100.

## Ricerca contatti
- **Apify** (Google Maps scraper): pizzerie e aziende Horeca per città, con sito web.
- **Firecrawl**: legge il sito di ciascuna attività per trovare email aziendale e descrizione.
- AI classifica (pizzeria / partner / scarta) e scrive la personalizzazione.
- Deduplica con CRM, clienti esistenti, disiscritti e lista nera.

## Attenzione: Germania
In Germania le email commerciali a freddo anche verso aziende richiedono consenso preventivo (UWG §7) e rischiano diffide. Proposta: per la Germania Mario **raccoglie i prospect ma non invia**; li mette in una lista da contattare a mano o via telefono. UK e Francia: invio automatico B2B consentito con disiscrizione chiara.

## Cosa serve da te
1. **Casella dedicata**: un dominio secondario (es. `vesuviano-forni.com`) con una casella `mario@` e i dati SMTP/IMAP (IMAP serve a leggere risposte e rimbalzi). Le credenziali le inserirai in un modulo protetto.
2. Collegare **Firecrawl** e **Apify** dalle schede che ti mostrerò.

## Dettagli tecnici
- Tabelle: `outreach_settings`, `outreach_prospects` (tipo, paese, fonte, email, stato, step, next_send_at, unique su email/dominio), `outreach_messages`, `outreach_runs` (lease single-flight), `outreach_suppressions`. RLS solo admin/commerciale.
- Edge functions: `mario-chat` (stessa struttura di roberta-chat), `mario-discover` (Apify+Firecrawl, batch limitato), `mario-send` (SMTP casella dedicata, coda con limite giornaliero, idempotenza per prospect+step), `mario-inbox` (IMAP: risposte → stop sequenza + lead CRM; bounce → sospensione).
- Cron: scoperta 1 volta al giorno, invio ogni ora in fascia lavorativa (bounded), lettura casella ogni ora. Circuit breaker su 402/403/429 e pausa globale.
- AI Gateway `openai/gpt-6-astra` per classificazione e personalizzazione con output JSON schema.
- Riuso di AgentChat, renderer email e firma esistenti; regola in AGENTS.md.
