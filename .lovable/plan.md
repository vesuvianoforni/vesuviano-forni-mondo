# Catalogo "Prodotti", listino annuale e sconti

## Cosa cambia per te

**Menu Catalogo → una sola voce "Prodotti"**, con tre schede:
- **Forni** (modelli, misure, rivestimenti, versioni legna/gas/elettrico, installazione)
- **Bruciatori**
- **Altri prodotti** (accessori, ricambi, servizi…), con il pulsante "Aggiungi prodotto"

"Pronta consegna" resta com'è. Le voci Listini e Listino Rivenditori spariscono: diventano parte di Prodotti.

**Scheda prodotto**: nome, descrizione, foto, categoria e poi:
- **Costo** + valuta del costo
- **Prezzo di listino per paese**: UK, Francia, Germania — ognuno con la sua valuta (es. UK in £, FR e DE in €; la valuta è sempre modificabile)
- Margine calcolato in automatico quando costo e prezzo hanno la stessa valuta

**Listino annuale**: in alto un selettore anno (es. "Listino 2027"). Un solo listino è *attivo* alla volta; puoi preparare il 2028 in bozza duplicando il 2027 e poi attivarlo. I listini vecchi restano consultabili ma non modificabili.

**Sconti** (nuova scheda "Sconti" dentro Prodotti):
- Sconto base per tipo cliente: Cliente finale, Partner, Rivenditore (percentuali che decidi tu)
- Nella scheda cliente del CRM: tipo cliente + eventuale sconto personale che sostituisce quello base
- Il prezzo al cliente = listino del suo paese − sconto

## Dati esistenti

Creo il **Listino 2027** ricopiando i prezzi attuali: **A → UK, B → Francia, C → Germania**, in euro. Poi correggi tu valute e importi. I prezzi "Rivenditori" attuali li uso per proporti la percentuale di sconto Rivenditore. I costi partono vuoti.

## Dove si applica (ovunque)

- **Configuratore cliente e link configuratore**: al posto di "Listino A/B/C" scegli paese (UK/FR/DE) e lo sconto del cliente.
- **Pro-forma** (anche quelle automatiche "Pronta consegna"): prezzi dal listino attivo + paese + sconto.
- **Offerte commerciali**: catalogo letto dal listino attivo nel paese scelto, sconto cliente proposto in automatico.
- **Chat AI del sito e Oven Finder**: usano il listino attivo (sempre senza mostrare prezzi dove oggi non li mostra).
- Pro-forma, offerte e link già creati **non cambiano prezzo**: conservano i valori con cui sono nati.

## Da confermare durante il lavoro
- Percentuali iniziali di Partner e Rivenditore (te le propongo dai dati attuali).
- Paesi fuori da UK/FR/DE (es. Italia, USA): propongo di usare il listino Germania (€) di default, modificabile per cliente.

## Dettagli tecnici
- Nuove tabelle: `price_lists` (anno, stato bozza/attivo/archiviato, un solo attivo via indice univoco parziale), `products` (categoria forno/bruciatore/altro, collegamento opzionale a `configurator_ovens`/`burners`, variante/componente: base, gas, elettrico, installazione, misura, rivestimento; costo + valuta), `product_prices` (listino, prodotto, mercato UK/FR/DE, importo, valuta, unico per terna), `discount_tiers` (tipo cliente → %). Su `leads`: `customer_type`, `market`, `discount_override`. GRANT + RLS: lettura pubblica solo dei prezzi del listino attivo dove serve al configuratore; scrittura admin/commerciale secondo i ruoli esistenti.
- Migrazione dati A/B/C → UK/FR/DE nel listino 2027; colonne `price_a/b/c` e `price_list` mantenute in sola lettura per lo storico, nuovi record salvano `market` + `discount_percentage` + snapshot dei prezzi.
- Un modulo condiviso di calcolo prezzo (frontend + edge functions) con test: listino attivo, mercato, sconto base vs personale, arrotondamenti.
- Aggiornamento di Configurator, SessionsCRM/SessionLinksManager, AdminProforma/ProformaPage, `create-ready-to-ship-proforma`, `commercial-offers`, `import-lead-from-erp` (accetta ancora A/B/C traducendoli), `sync-to-erp`, `vesuviano-chat`, `oven-finder-recommend`.
- Lavoro a fasi: 1) tabelle + Prodotti/listino/sconti, 2) offerte e pro-forma, 3) configuratore e funzioni del sito.
