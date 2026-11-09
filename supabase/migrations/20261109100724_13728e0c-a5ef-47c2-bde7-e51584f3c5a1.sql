WITH contacts(code, name, company, phone, email, contact_notes) AS (VALUES
  ('Mauro', 'Logistic AA Eboli', NULL, '+39 366 897 1692', NULL, 'Referente: Mauro Fezzano. Diretto con Logistic AA Eboli.
Profilo: Esportatore indipendente
Base / collegamento: Salerno
Recapiti originali: +39 366 897 1692
Email / referente: Contatto fornito da Stanislao
Uso e limiti: Giro diretto per la Francia secondo indicazione utente.
Fonti: Dato utente'),
  ('VP', 'ViePiù / Hub Italy', NULL, '+39 338 170 0218', 'giuseppe.romano@hubitaly.com', 'Profilo: Esportatore alimentare
Base / collegamento: Serre (SA)
Recapiti originali: +39 338 170 0218
Email / referente: Giuseppe Romano · giuseppe.romano@hubitaly.com
Uso e limiti: Mozzarella, farine, pelati. Consegne refrigerate settimanali e rete di agenti con furgone.
Fonti: https://www.viepiu.it/contatti/ | https://www.viepiu.it/spedizioni/ | https://www.viepiu.it/partner/'),
  ('SG', 'Sugros', NULL, NULL, 'info@sugros.it', 'Profilo: Esportatore alimentare
Base / collegamento: Pastorano (CE)
Recapiti originali: FR/Benelux +39 393 873 4456
DE/Est/UK +39 349 877 0484
ES/PT +39 342 046 9715
IT/CH +39 320 262 7317
Email / referente: info@sugros.it
Uso e limiti: Partenze pubblicate da Caserta e limiti per paese. Chiedere il vettore se il collo eccede lo standard.
Fonti: https://sugros.com/spedizioni | https://sugros.com/ingrosso-alimentari-napoli | https://sugros.com/azienda-ingrosso-alimentari'),
  ('LB', 'Caseificio La Bufalat', NULL, '+39 0828 985617', 'info@labufalat.it', 'Profilo: Caseificio esportatore
Base / collegamento: Albanella (SA)
Recapiti originali: +39 0828 985617
Email / referente: info@labufalat.it
Uso e limiti: Dichiara di rifornire Obicà a Londra. Chiedere il vettore utilizzato.
Fonti: https://labufalat.it/?page_id=844'),
  ('DI', 'Nuovo Gruppo Esportazioni Di Riso', NULL, '+39 347 588 8554', NULL, 'Profilo: Esportatore alimentare
Base / collegamento: Sant’Antonio Abate (NA)
Recapiti originali: +39 347 588 8554
Email / referente: Sito aziendale
Uso e limiti: Mozzarella e specialità campane. Paesi, orari e uso di mezzi propri da verificare.
Fonti: https://nuovogruppoesportazionidiriso.it/'),
  ('LC', 'Latticini Dalle Crode', NULL, '+39 389 574 6614', 'info@latticinidallecrode.com', 'Profilo: Ditta individuale
Base / collegamento: Villa Literno (CE)
Recapiti originali: +39 389 574 6614
Email / referente: Luciano Dalle Crode · info@latticinidallecrode.com
Uso e limiti: Esporta latticini per la ristorazione. Paesi e frequenze da verificare.
Fonti: https://www.latticinidallecrode.com/contatti/ | https://www.latticinidallecrode.com/servizi/'),
  ('TH', 'Thebestrasporti', NULL, NULL, 'info@thebestrasporti.it', 'Profilo: Vettore refrigerato
Base / collegamento: Carichi dichiarati in Campania
Recapiti originali: WhatsApp sul sito
Email / referente: info@thebestrasporti.it
Uso e limiti: Rotte dirette dichiarate per DE, PL, AT, CZ, NL, BE, LT. Verificare colli non alimentari.
Fonti: https://www.thebestrasporti.com/'),
  ('PF', 'PartenFrigo', NULL, '+39 081 5135741', 'info@partenfrigo.com', 'Profilo: Vettore familiare refrigerato
Base / collegamento: Carichi dichiarati in Campania
Recapiti originali: +39 081 5135741
Email / referente: info@partenfrigo.com
Uso e limiti: Groupage giornaliero per sud Francia. Verificare colli non alimentari. Telefono da elenco aziendale.
Fonti: https://lnx.partenfrigo.com/servizi/ | https://www.impresaitalia.info/ik02334753/parten-frigo-srl/angri.aspx'),
  ('BU', 'Roberto Bucci / Bucci Freight', NULL, '+39 089 230226', 'exportuk@bucci.it', 'Profilo: Spedizioniere
Base / collegamento: Napoli / Salerno
Recapiti originali: +39 089 230226
Email / referente: exportuk@bucci.it
Uso e limiti: Groupage settimanale da Napoli verso UK. Chiedere ritiro, CAP e accettazione fuori misura.
Fonti: https://www.bucci.co.uk/transport-modes/by-land/ | https://www.bucci.it/contatti/'),
  ('DG', 'De Georgio', NULL, '+39 0823 512211', 'info@degeorgiotrasporti.it', 'Profilo: Spedizioniere
Base / collegamento: Marcianise (CE)
Recapiti originali: +39 0823 512211
Email / referente: info@degeorgiotrasporti.it
Uso e limiti: Solo Germania nel prospetto, su indicazione utente. Frequenza e CAP da confermare.
Fonti: https://degeorgiogroup.it/contatti/'),
  ('ES', 'Eur Service', NULL, '+39 02 66326 306', 'mario.fulco@eurserviceitaly.it', 'Profilo: Spedizioniere
Base / collegamento: Ritiro nazionale; hub Nord Italia
Recapiti originali: +39 02 66326 306
Email / referente: Mario Fulco · mario.fulco@eurserviceitaly.it
Uso e limiti: Groupage per Belfast e Dublino. Chiedere conferma sul CAP BT71 7SJ.
Fonti: https://www.eurserviceitaly.it/ireland.html'),
  ('TR', 'TR Logistics', NULL, '+44 28 9037 3700', 'info@tr-logistics.com', 'Profilo: Spedizioniere locale a destino
Base / collegamento: Belfast; ritiro Campania da confermare
Recapiti originali: +44 28 9037 3700
Email / referente: info@tr-logistics.com
Uso e limiti: Pallet Italia–Irlanda del Nord; chiedere preventivo door-to-door.
Fonti: https://www.tr-logistics.com/pallet-delivery-northern-ireland/ | https://www.tr-logistics.com/contact/'),
  ('DS', 'DSV', NULL, NULL, 'info@it.dsv.com', 'Profilo: Rete logistica
Base / collegamento: Sedi a Marcianise e Salerno
Recapiti originali: Modulo preventivo sul sito
Email / referente: info@it.dsv.com
Uso e limiti: Rete Europa e internazionale. Per paesi con copertura di rete chiedere hub, CAP e data.
Fonti: https://www.dsv.com/it-it/destinazioni/europa/italia | https://www.dsv.com/it-it/destinazioni/europa | https://www.dsv.com/it-it/destinazioni/europa/grecia | https://www.dsv.com/it-it/destinazioni/europa/malta | https://www.dsv.com/it-it/destinazioni/europa/ucraina | https://www.dsv.com/en/countries/iceland | https://www.dsv.com/en/destinations | https://www.dsv.com/it-it/destinazioni/europa/regno-unito'),
  ('DW', 'De Waard / IDS', NULL, '+39 045 6095158', NULL, 'Profilo: Rete groupage
Base / collegamento: Ritiro Campania da confermare
Recapiti originali: +39 045 6095158
Email / referente: Contatti sul sito
Uso e limiti: Rete di partner. Paesi associati elencati sulla pagina IDS.
Fonti: https://dewaardtransport.it/servizi/ids/'),
  ('ITX', 'ITX Cargo', NULL, NULL, NULL, 'Profilo: Spedizioniere
Base / collegamento: Ritiro Campania da confermare
Recapiti originali: Modulo preventivo sul sito
Email / referente: Contatti sul sito
Uso e limiti: Groupage Est Europa e rotte Scandinavia. Chiedere collegamento dal Sud.
Fonti: https://www.itxcargo.com/trasporto-su-strada/est-europa/ | https://www.itxcargo.com/azienda/'),
  ('PE', 'Pesenti', NULL, '+39 035 203234', 'info@pesenti.com', 'Profilo: Spedizioniere
Base / collegamento: Ritiro Campania da confermare
Recapiti originali: +39 035 203234
Email / referente: info@pesenti.com
Uso e limiti: Balcani e Grecia. Chiedere prezzo dal CAP di ritiro.
Fonti: https://www.pesenti.com/it/trasporti-e-spedizioni-nei-balcani-slovenia-croazia-bosnia-serbia-montenegro-albania-macedonia | https://www.pesenti.com/it/node/82 | https://www.pesenti.com/it/trasporti-e-spedizioni'),
  ('CE', 'Cecconi', NULL, '+39 0575 354828', 'info@cti-cecconi.com', 'Profilo: Spedizioniere
Base / collegamento: Ritiro Campania da confermare
Recapiti originali: +39 0575 354828
Email / referente: info@cti-cecconi.com
Uso e limiti: Uffici o collegamenti per Albania, Romania, Moldavia, Turchia e Georgia.
Fonti: https://www.cecconitrasporti.it/it/contatti | https://www.cecconitrasporti.it/it/tratte/spedizioni-e-trasporti-moldavia.html | https://www.cecconitrasporti.it/it/tratte/spedizioni-e-trasporti-georgia.html'),
  ('MO', 'Autotrasporti Moretti', NULL, '+39 0734 900178', 'moretti@autotrasportimoretti.it', 'Profilo: Vettore / rete
Base / collegamento: Hub di collegamento a Caserta
Recapiti originali: +39 0734 900178
Email / referente: moretti@autotrasportimoretti.it
Uso e limiti: Servizio Albania settimanale. Verificare se consolida fuori regione.
Fonti: https://www.autotrasportimoretti.it/spedizioni/'),
  ('MB', 'MBE Scafati', NULL, '+39 081 8567514', NULL, 'Profilo: Rete spedizioni
Base / collegamento: Scafati (SA)
Recapiti originali: +39 081 8567514
Email / referente: Corso Nazionale 366
Uso e limiti: Microstati e Islanda. Chiedere accettazione di peso, ingombri e ritiro.
Fonti: https://www.mbe.it/it/spedizioni/salerno/scafati/0404 | https://www.mbe.it/it/spedizioni-europa-con-corrieri-espresso'),
  ('BC', 'Balkan Cargo', NULL, NULL, NULL, 'Profilo: Vettore regionale
Base / collegamento: Hub in Grecia; ritiro Campania da costruire
Recapiti originali: Modulo sul sito
Email / referente: Contatti sul sito
Uso e limiti: Rete regionale con Kosovo e Montenegro.
Fonti: https://balkancargo.com/en/network'),
  ('AR', 'Armets', NULL, NULL, NULL, 'Profilo: Spedizioniere specializzato
Base / collegamento: Ritiro Campania da confermare
Recapiti originali: Modulo sul sito
Email / referente: Contatti sul sito
Uso e limiti: Collegamenti Italia–Armenia. Chiedere modalità per il collo.
Fonti: https://www.armets.net/')
), routes(country, codes, route_notes) AS (VALUES
  ('Francia', 'Mauro · VP · SG · PF', 'Area: UE
Evidenza tratta: A · Linea dalla Campania
Esportatori / giri alimentari: Mauro Fezzano · Salerno; ViePiù · Serre; Sugros · Pastorano
Vettori da quotare: PartenFrigo · groupage giornaliero per il sud della Francia
Cosa chiedere / dati pubblicati: Sugros pubblica lunedì e giovedì da Caserta. Per Vosgi o Parigi chiedere il giro per CAP.'),
  ('Regno Unito – Inghilterra', 'VP · LB · SG · BU', 'Area: Extra UE
Evidenza tratta: A · Linea dalla Campania
Esportatori / giri alimentari: ViePiù · Serre; La Bufalat · Albanella; Sugros · Pastorano
Vettori da quotare: Bucci · groupage settimanale da Napoli verso UK
Cosa chiedere / dati pubblicati: ViePiù indica Londra; La Bufalat dichiara forniture dirette a Londra. Sugros pubblica mercoledì e sabato per UK, standard 750 kg.'),
  ('Regno Unito – Irlanda del Nord', 'SG · ES · TR', 'Area: Extra UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: Sugros · referente UK; tratta e CAP da confermare
Vettori da quotare: Eur Service · hub Nord Italia/Belfast; TR Logistics · Belfast
Cosa chiedere / dati pubblicati: Per Mesa Fresh, Moy BT71 7SJ, confermare l’ultimo miglio. Il calendario UK di Sugros non distingue i CAP BT.'),
  ('Regno Unito – Scozia', 'VP · SG · DS', 'Area: Extra UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: ViePiù indica Scozia nel calendario; Sugros · referente UK
Vettori da quotare: DSV · rete UK
Cosa chiedere / dati pubblicati: Chiedere giro e CAP. Il calendario UK di Sugros non distingue la Scozia.'),
  ('Regno Unito – Galles', 'SG · DS', 'Area: Extra UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: Sugros · referente UK, copertura da chiedere
Vettori da quotare: DSV · rete UK
Cosa chiedere / dati pubblicati: Chiedere consegna al CAP e prossimo ritiro.'),
  ('Albania', 'MO · CE', 'Area: Extra UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: —
Vettori da quotare: Moretti · collegamento con hub Caserta e linea Albania settimanale; Cecconi
Cosa chiedere / dati pubblicati: Moretti non specifica un diretto Caserta–Albania. Chiedere luogo di consolidamento.'),
  ('Andorra', 'MB', 'Area: Extra UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: —
Vettori da quotare: MBE Scafati · rete internazionale
Cosa chiedere / dati pubblicati: Chiedere limiti di peso e misure e disponibilità di un servizio merci.'),
  ('Armenia', 'AR', 'Area: Perimetro esteso
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: —
Vettori da quotare: Armets · specialista Italia–Armenia
Cosa chiedere / dati pubblicati: Chiedere ritiro Campania e modalità adatta al collo.'),
  ('Austria', 'SG · VP · TH', 'Area: UE
Evidenza tratta: A · Linea dalla Campania
Esportatori / giri alimentari: Sugros · Pastorano; ViePiù · Serre
Vettori da quotare: Thebestrasporti · carichi in Campania e rotte dirette
Cosa chiedere / dati pubblicati: Sugros pubblica lunedì e giovedì da Caserta.'),
  ('Azerbaigian', 'DS', 'Area: Perimetro esteso
Evidenza tratta: C · Da qualificare
Esportatori / giri alimentari: —
Vettori da quotare: DSV · richiesta su rete internazionale
Cosa chiedere / dati pubblicati: Nessun giro campano specifico trovato. Chiedere fattibilità e percorso.'),
  ('Belgio', 'SG · VP · TH', 'Area: UE
Evidenza tratta: A · Linea dalla Campania
Esportatori / giri alimentari: Sugros · referente Benelux; ViePiù · Serre
Vettori da quotare: Thebestrasporti · diretto dichiarato
Cosa chiedere / dati pubblicati: Sugros pubblica partenze da Caserta. Chiedere CAP e data al referente Benelux.'),
  ('Bosnia ed Erzegovina', 'PE · DW', 'Area: Extra UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: —
Vettori da quotare: Pesenti · servizio Balcani; De Waard · rete IDS
Cosa chiedere / dati pubblicati: Ritiro Campania e consolidamento da confermare.'),
  ('Bulgaria', 'VP · ITX · DS', 'Area: UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: ViePiù · paese elencato
Vettori da quotare: ITX Cargo · groupage Est Europa; DSV · rete
Cosa chiedere / dati pubblicati: Chiedere giorno di carico da Serre o ritiro al CAP del laboratorio.'),
  ('Cechia', 'VP · TH · ITX', 'Area: UE
Evidenza tratta: A · Linea dalla Campania
Esportatori / giri alimentari: ViePiù · paese elencato
Vettori da quotare: Thebestrasporti · diretto dichiarato; ITX Cargo
Cosa chiedere / dati pubblicati: Confermare se il servizio refrigerato accetta colli non alimentari.'),
  ('Cipro', 'DW', 'Area: UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: —
Vettori da quotare: De Waard · rete IDS
Cosa chiedere / dati pubblicati: Chiedere ritiro Campania e inoltro marittimo.'),
  ('Croazia', 'VP · PE · ITX', 'Area: UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: ViePiù · paese elencato
Vettori da quotare: Pesenti · Balcani; ITX Cargo · Est Europa
Cosa chiedere / dati pubblicati: Giorno, hub e accettazione del collo da confermare.'),
  ('Danimarca', 'SG · VP · ITX · DS', 'Area: UE
Evidenza tratta: A · Linea dalla Campania
Esportatori / giri alimentari: Sugros · Pastorano; ViePiù · Serre
Vettori da quotare: ITX Cargo · rete Scandinavia; DSV
Cosa chiedere / dati pubblicati: Sugros pubblica mercoledì e sabato da Caserta.'),
  ('Estonia', 'VP · DW · DS', 'Area: UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: ViePiù · paese elencato
Vettori da quotare: De Waard · rete IDS; DSV
Cosa chiedere / dati pubblicati: Chiedere giorno, hub e CAP servito.'),
  ('Finlandia', 'VP · ITX · DS', 'Area: UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: ViePiù · paese elencato
Vettori da quotare: ITX Cargo · rete Scandinavia; DSV
Cosa chiedere / dati pubblicati: Chiedere ritiro Campania e calendario.'),
  ('Georgia', 'CE', 'Area: Perimetro esteso
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: —
Vettori da quotare: Cecconi · linea Italia–Georgia
Cosa chiedere / dati pubblicati: Ritiro in Campania e modalità da quotare.'),
  ('Germania', 'SG · VP · DG · TH', 'Area: UE
Evidenza tratta: A · Linea dalla Campania
Esportatori / giri alimentari: Sugros · referente Germania; ViePiù · Serre
Vettori da quotare: De Georgio · solo Germania secondo indicazione utente; Thebestrasporti · diretto dichiarato
Cosa chiedere / dati pubblicati: Sugros pubblica lunedì e giovedì da Caserta. Giorni e destinazioni De Georgio da confermare.'),
  ('Grecia', 'VP · DS · PE', 'Area: UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: ViePiù · paese elencato
Vettori da quotare: DSV · Italia–Grecia; Pesenti · groupage
Cosa chiedere / dati pubblicati: Chiedere ritiro Campania, CAP ed eventuale inoltro verso isole.'),
  ('Irlanda – Repubblica', 'SG · VP · ES', 'Area: UE
Evidenza tratta: A · Linea dalla Campania
Esportatori / giri alimentari: Sugros · Pastorano; ViePiù · Serre
Vettori da quotare: Eur Service · hub Nord Italia/Dublino
Cosa chiedere / dati pubblicati: Sugros pubblica giovedì da Caserta, standard 650 kg. Moy e i CAP BT sono nella riga Irlanda del Nord.'),
  ('Islanda', 'DS · MB', 'Area: Extra UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: —
Vettori da quotare: DSV · rete Islanda; MBE Scafati
Cosa chiedere / dati pubblicati: Chiedere inoltro via mare e limiti per colli pesanti.'),
  ('Italia', 'SG · VP · DS · MB', 'Area: UE
Evidenza tratta: A · Linea dalla Campania
Esportatori / giri alimentari: ViePiù · Serre; Sugros · Pastorano
Vettori da quotare: DSV · sedi Campania; MBE Scafati
Cosa chiedere / dati pubblicati: Sugros pubblica partenze nazionali giornaliere.'),
  ('Kazakistan', 'DS', 'Area: Perimetro esteso
Evidenza tratta: C · Da qualificare
Esportatori / giri alimentari: —
Vettori da quotare: DSV · richiesta su rete internazionale
Cosa chiedere / dati pubblicati: Nessun giro campano specifico trovato. Chiedere fattibilità e percorso.'),
  ('Kosovo', 'BC', 'Area: Extra UE
Evidenza tratta: C · Da qualificare
Esportatori / giri alimentari: —
Vettori da quotare: Balkan Cargo · rete regionale con hub in Grecia
Cosa chiedere / dati pubblicati: Copertura pubblicata dal loro hub greco. Ritiro dalla Campania da costruire e confermare.'),
  ('Lettonia', 'VP · DW · DS', 'Area: UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: ViePiù · paese elencato
Vettori da quotare: De Waard · rete IDS; DSV
Cosa chiedere / dati pubblicati: Chiedere giorno e hub.'),
  ('Liechtenstein', 'MB', 'Area: Extra UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: —
Vettori da quotare: MBE Scafati · rete internazionale
Cosa chiedere / dati pubblicati: Verificare formato, peso e presa al laboratorio.'),
  ('Lituania', 'VP · TH', 'Area: UE
Evidenza tratta: A · Linea dalla Campania
Esportatori / giri alimentari: ViePiù · paese elencato
Vettori da quotare: Thebestrasporti · diretto dichiarato
Cosa chiedere / dati pubblicati: Confermare accettazione colli non alimentari.'),
  ('Lussemburgo', 'SG · VP · DS', 'Area: UE
Evidenza tratta: A · Linea dalla Campania
Esportatori / giri alimentari: Sugros · referente Benelux; ViePiù · Serre
Vettori da quotare: DSV · rete europea
Cosa chiedere / dati pubblicati: Sugros pubblica lunedì e giovedì da Caserta.'),
  ('Macedonia del Nord', 'PE · DW', 'Area: Extra UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: —
Vettori da quotare: Pesenti · Balcani; De Waard · rete IDS
Cosa chiedere / dati pubblicati: Ritiro Campania da confermare.'),
  ('Malta', 'DS · DW', 'Area: UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: —
Vettori da quotare: DSV · linea Italia–Malta; De Waard · rete IDS
Cosa chiedere / dati pubblicati: Chiedere ritiro Campania e modalità marittima per fuori misura.'),
  ('Moldavia', 'CE · DW', 'Area: Extra UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: —
Vettori da quotare: Cecconi · ufficio a Chișinău; De Waard · rete IDS
Cosa chiedere / dati pubblicati: Chiedere ritiro Campania e resa per CAP.'),
  ('Monaco – Principato', 'MB', 'Area: Extra UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: —
Vettori da quotare: MBE Scafati · rete internazionale
Cosa chiedere / dati pubblicati: Chiedere consegna al civico e capacità di scarico.'),
  ('Montenegro', 'PE · BC', 'Area: Extra UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: —
Vettori da quotare: Pesenti · Balcani; Balkan Cargo · rete regionale
Cosa chiedere / dati pubblicati: Ritiro Campania da confermare.'),
  ('Norvegia', 'VP · ITX · DW', 'Area: Extra UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: ViePiù · paese elencato
Vettori da quotare: ITX Cargo · rete Scandinavia; De Waard · rete IDS
Cosa chiedere / dati pubblicati: Chiedere calendario di ritiro e quotazione per CAP.'),
  ('Paesi Bassi', 'SG · VP · TH', 'Area: UE
Evidenza tratta: A · Linea dalla Campania
Esportatori / giri alimentari: Sugros · referente Benelux; ViePiù · Serre
Vettori da quotare: Thebestrasporti · diretto dichiarato
Cosa chiedere / dati pubblicati: Sugros pubblica lunedì e giovedì da Caserta.'),
  ('Polonia', 'VP · SG · TH · ITX', 'Area: UE
Evidenza tratta: A · Linea dalla Campania
Esportatori / giri alimentari: ViePiù · hub Varsavia; Sugros · referente Est Europa
Vettori da quotare: Thebestrasporti · diretto dichiarato; ITX Cargo
Cosa chiedere / dati pubblicati: Sugros indica il paese e i limiti standard. Giorno di partenza da chiedere.'),
  ('Portogallo', 'SG · VP · DS', 'Area: UE
Evidenza tratta: A · Linea dalla Campania
Esportatori / giri alimentari: Sugros · referente Iberia; ViePiù · Serre
Vettori da quotare: DSV · rete europea
Cosa chiedere / dati pubblicati: Sugros pubblica giovedì da Caserta.'),
  ('Romania', 'VP · CE · ITX', 'Area: UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: ViePiù · paese elencato
Vettori da quotare: Cecconi · uffici locali; ITX Cargo · groupage Est Europa
Cosa chiedere / dati pubblicati: Ritiro campano e tempi da confermare.'),
  ('San Marino', 'MB', 'Area: Extra UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: —
Vettori da quotare: MBE Scafati · rete internazionale
Cosa chiedere / dati pubblicati: Chiedere ritiro e limiti per pallet o cassa.'),
  ('Serbia', 'PE · ITX', 'Area: Extra UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: —
Vettori da quotare: Pesenti · Balcani; ITX Cargo · groupage Est Europa
Cosa chiedere / dati pubblicati: Ritiro Campania e consolidamento da confermare.'),
  ('Slovacchia', 'VP · ITX · DW', 'Area: UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: ViePiù · paese elencato
Vettori da quotare: ITX Cargo · groupage Est Europa; De Waard · rete IDS
Cosa chiedere / dati pubblicati: Chiedere data ritiro in Campania e terminal.'),
  ('Slovenia', 'VP · PE · ITX', 'Area: UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: ViePiù · paese elencato
Vettori da quotare: Pesenti · Balcani; ITX Cargo · groupage Est Europa
Cosa chiedere / dati pubblicati: Chiedere data ritiro in Campania e terminal.'),
  ('Spagna', 'SG · VP · DS', 'Area: UE
Evidenza tratta: A · Linea dalla Campania
Esportatori / giri alimentari: Sugros · referente Iberia; ViePiù · hub Barcellona e Madrid
Vettori da quotare: DSV · rete europea
Cosa chiedere / dati pubblicati: Sugros pubblica martedì e sabato da Caserta, standard fino a 1.000 kg e base 80 × 120 cm.'),
  ('Svezia', 'SG · VP · ITX · DS', 'Area: UE
Evidenza tratta: A · Linea dalla Campania
Esportatori / giri alimentari: Sugros · Pastorano; ViePiù · hub Stoccolma
Vettori da quotare: ITX Cargo · rete Scandinavia; DSV
Cosa chiedere / dati pubblicati: Sugros pubblica mercoledì e sabato da Caserta.'),
  ('Svizzera', 'VP · SG · DS · DW', 'Area: Extra UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: ViePiù · paese elencato; Sugros · referente Svizzera
Vettori da quotare: DSV · rete europea; De Waard · rete IDS
Cosa chiedere / dati pubblicati: Chiedere calendario di partenza, CAP e formalità incluse nel preventivo.'),
  ('Turchia', 'CE · DS', 'Area: Perimetro esteso
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: —
Vettori da quotare: Cecconi · ufficio Turchia; DSV · linea Italia–Turchia
Cosa chiedere / dati pubblicati: Ritiro in Campania e modalità da confermare.'),
  ('Ucraina', 'DS', 'Area: Extra UE
Evidenza tratta: B · Rete o hub
Esportatori / giri alimentari: —
Vettori da quotare: DSV · Italia–Ucraina, groupage e parziali
Cosa chiedere / dati pubblicati: Verificare disponibilità aggiornata per la località e il CAP.'),
  ('Ungheria', 'SG · VP · ITX', 'Area: UE
Evidenza tratta: A · Linea dalla Campania
Esportatori / giri alimentari: Sugros · Pastorano; ViePiù · Serre
Vettori da quotare: ITX Cargo · groupage Est Europa
Cosa chiedere / dati pubblicati: Sugros pubblica mercoledì da Caserta.')
), expanded AS (
  SELECT r.country, c.*, r.route_notes
  FROM routes r
  JOIN contacts c ON c.code = ANY(string_to_array(r.codes, ' · '))
  UNION ALL
  SELECT 'Da definire', c.*, 'Paesi, frequenze e ritiro dalla Campania da verificare; nessuna destinazione specifica associata nel file.'
  FROM contacts c
  WHERE NOT EXISTS (SELECT 1 FROM routes r WHERE c.code = ANY(string_to_array(r.codes, ' · ')))
), incoming AS (
  SELECT country, name, company, phone, email,
    contact_notes || E'\n' || route_notes || E'\nPer un forno confermare CAP, peso, misure imballate, mezzo e scarico. Le tratte alimentari sono contatti per risalire al vettore; idoneità al trasporto dei forni non ancora confermata.\nSource: Trasporti_Campania_Europa.xlsx, 2026-11-09, Contatti + Paesi e tratte.' AS notes
  FROM expanded
), updated AS (
  UPDATE public.transport_carriers t
  SET company = COALESCE(i.company, t.company),
      phone = COALESCE(i.phone, t.phone), email = COALESCE(i.email, t.email),
      notes = CASE
        WHEN t.notes IS NULL OR t.notes = '' OR t.notes = 'Referente: Mauro Fezzano' THEN i.notes
        WHEN strpos(t.notes, 'Source: Trasporti_Campania_Europa.xlsx, 2026-11-09') > 0 THEN t.notes
        ELSE t.notes || E'\n\n' || i.notes END,
      is_active = false
  FROM incoming i
  WHERE lower(btrim(t.country)) = lower(btrim(i.country))
    AND lower(btrim(t.name)) = lower(btrim(i.name))
  RETURNING t.id
)
INSERT INTO public.transport_carriers(country, name, company, phone, email, notes, is_active)
SELECT i.country, i.name, i.company, i.phone, i.email, i.notes, false
FROM incoming i
WHERE NOT EXISTS (
  SELECT 1 FROM public.transport_carriers t
  WHERE lower(btrim(t.country)) = lower(btrim(i.country))
    AND lower(btrim(t.name)) = lower(btrim(i.name))
);

DO $$
BEGIN
  IF (SELECT count(*) FROM public.transport_carriers WHERE strpos(notes, 'Source: Trasporti_Campania_Europa.xlsx, 2026-11-09') > 0) <> 130 THEN
    RAISE EXCEPTION 'Import incompleto: attesi 130 riferimenti paese-operatore';
  END IF;
  IF EXISTS (SELECT 1 FROM public.transport_carriers WHERE strpos(notes, 'Source: Trasporti_Campania_Europa.xlsx, 2026-11-09') > 0 AND is_active IS DISTINCT FROM false) THEN
    RAISE EXCEPTION 'Ogni vettore importato deve essere non attivo';
  END IF;
END $$;