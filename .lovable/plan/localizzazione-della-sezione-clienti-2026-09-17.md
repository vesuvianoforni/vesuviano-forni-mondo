# Localizzazione della sezione clienti

## Modifiche
- Usare sempre il Paese restituito da ipapi nel titolo e nel sottotitolo della sezione, mantenendo il fallback italiano solo se il rilevamento non risponde.
- Mostrare i loghi clienti disponibili anche quando non appartengono al Paese rilevato, senza sostituire il Paese del visitatore con “United Kingdom”.
- Rimuovere città, indirizzi e riferimenti geografici dai nomi e dalle descrizioni delle schede clienti.
- Applicare la stessa pulizia alle sezioni clienti presenti nelle pagine Forno a legna, Forno a gas e Forno rotante.
- Mantenere nomi dei clienti, modelli dei forni e collegamenti Instagram.

## Dettagli tecnici
- Riutilizzare la funzione `geo-detect` e il campo `country_name` già restituito da ipapi.
- Separare il Paese mostrato dalla logica di selezione dei loghi, evitando il precedente fallback visivo al Regno Unito.
- Verificare la resa della sezione su mobile e desktop.
