## Contratti ERP - Piano

Nuova sezione `/erp/contratti` per generare e gestire contratti cliente con termini modificabili tramite AI.

### 1. Database (Supabase)

**Tabella `contracts`:**
- `client_name`, `client_email`, `client_address`, `client_vat` (dati cliente)
- `offer_number` (numero offerta/proforma)
- `total_amount`, `currency` (importo)
- `payment_terms` (testo, default: "50% acconto, 50% a merce pronta previo supporto fotografico")
- `warranty_years` (default 1, estendibile a 2)
- `clauses` (JSONB — array di clausole modificabili: titolo + contenuto)
- `status` ('draft' | 'sent' | 'signed')
- `signed_at`, `pdf_url`, `notes`
- `created_by`, `created_at`, `updated_at`

RLS: solo admin/commerciale (ruoli ERP esistenti).

### 2. Pagina ERP `/erp/contratti`

- Lista contratti con ricerca per cliente/numero offerta
- "Nuovo Contratto": form con dati cliente, numero offerta, importo, garanzia (1/2 anni), modalità pagamento
- Editor clausole: lista clausole default precompilate (oggetto, pagamento, consegna, garanzia, foro competente, privacy) — ognuna editabile
- **Assistente AI** (Lovable AI - `google/gemini-3-flash-preview`) per:
  - Riscrivere una clausola ("rendi più formale", "aggiungi penale ritardo", ecc.)
  - Aggiungere nuova clausola da prompt
  - Suggerire clausole standard
- Azioni: Salva bozza, Genera PDF, Marca come firmato

### 3. Generazione PDF

Client-side con `jspdf` + `jspdf-autotable`:
- Header con logo Vesuviano + intestazione:
  ```
  Vesuviano Forni brand owned by UNITA 1 di Stanislao Elefante
  P.IVA: IT02192040661 · C.F.: LFNSNS94E20G813Z
  VIA PIAIA, 44 · 67034 PETTORANO SUL GIZIO (AQ) · IT
  PEC: u1@pec.it
  ```
- Corpo: dati cliente, riferimento offerta, importo, modalità pagamento, garanzia, clausole numerate
- Footer: spazio firma cliente + azienda, data
- Download diretto + upload opzionale su Supabase Storage (bucket `order-documents`)

### 4. Edge function `contract-ai-assist`

Input: `{ action: 'rewrite'|'add'|'suggest', clause?: {title, content}, prompt: string }`
Output: clausola/clausole generate. Usa Lovable AI Gateway.

### 5. Sidebar ERP

Aggiungo voce "Contratti" in `ERPSidebar.tsx`.

### File toccati
- Migration: nuova tabella `contracts` + policies + grants
- `src/pages/ERPContratti.tsx` (nuovo)
- `src/components/erp/ContractPDF.ts` (nuovo, helper jsPDF)
- `supabase/functions/contract-ai-assist/index.ts` (nuovo)
- `src/components/erp/ERPSidebar.tsx` (aggiunta voce)
- `src/App.tsx` (route)
- `package.json`: `jspdf`, `jspdf-autotable`

Confermi che procedo? Il logo lo prendo da `/lovable-uploads/vesuviano-logo-bianco.png` (o mi indichi altro file se preferisci una versione scura per PDF).