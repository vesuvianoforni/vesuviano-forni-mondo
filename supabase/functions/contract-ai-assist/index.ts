import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface Clause {
  title: string;
  content: string;
}

interface Section {
  title: string;
  body: string;
}

const LANG_NAMES: Record<string, string> = {
  it: 'Italian',
  en: 'English',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const action: 'rewrite' | 'add' | 'suggest' | 'improve_all' | 'fill_fields' | 'translate' = body.action;
    const prompt: string = body.prompt || '';
    const clause: Clause | undefined = body.clause;
    const clauses: Clause[] | undefined = body.clauses;
    const currentFields: Record<string, string> | undefined = body.current_fields;
    const sections: Section[] | undefined = body.sections;
    const targetLanguage: string = body.target_language || 'en';

    const systemPrompt = `Sei un assistente legale specializzato in contratti commerciali B2B italiani per la fornitura di forni professionali da parte di Vesuviano Forni (UNITA 1 di Stanislao Elefante, P.IVA IT02192040661).
Scrivi clausole giuridicamente valide, chiare, in italiano formale, adatte a contratti B2B tra un fornitore italiano e clienti in Italia o all'estero.
Rispondi SEMPRE e SOLO con JSON valido, senza markdown, senza spiegazioni aggiuntive.`;

    let userPrompt = '';
    let schemaHint = '';
    let overrideSystem: string | null = null;

    if (action === 'rewrite' && clause) {
      userPrompt = `Riscrivi la seguente clausola secondo questa istruzione: "${prompt}".\n\nClausola attuale:\nTitolo: ${clause.title}\nContenuto: ${clause.content}\n\nRispondi con JSON: {"title": "...", "content": "..."}`;
      schemaHint = '{"title": "string", "content": "string"}';
    } else if (action === 'add') {
      userPrompt = `Genera una nuova clausola contrattuale su questo argomento: "${prompt}".\n\nRispondi con JSON: {"title": "...", "content": "..."}`;
      schemaHint = '{"title": "string", "content": "string"}';
    } else if (action === 'suggest') {
      userPrompt = `Suggerisci un set completo di clausole contrattuali standard per una fornitura di forni professionali.\n\nRispondi con JSON: {"clauses": [{"title": "...", "content": "..."}, ...]}`;
      schemaHint = '{"clauses": [{"title": "string", "content": "string"}]}';
    } else if (action === 'improve_all' && clauses) {
      userPrompt = `Migliora e uniforma stilisticamente le seguenti clausole secondo questa istruzione: "${prompt || 'rendile più professionali'}".\n\nClausole:\n${JSON.stringify(clauses, null, 2)}\n\nRispondi con JSON: {"clauses": [...]} mantenendo lo stesso numero e ordine.`;
      schemaHint = '{"clauses": [{"title": "string", "content": "string"}]}';
    } else if (action === 'fill_fields') {
      const allowedKeys = [
        'offer_number','offer_date','destination','place_signed','payment_agreements','refund_days',
        'work_time','production_time','delivery_estimate','ready_date','ship_date','balance_due_days','storage_cost',
        'production_days','shipping_days',
        'shipping_method','carrier','shipping_included','insurance_included','delivery_responsibility','incoterms',
        'unloading_included','internal_handling_included','unloading_means','unloading_responsible','handling_responsible','logistics_notes',
        'assembly_included','installation_included','startup_included','training_included',
        'chimney_responsible','gas_responsible','electric_responsible','masonry_responsible','permits_responsible',
        'dim_tolerance','color_tolerance','weight_tolerance','warranty_duration','warranty_coverage','warranty_exclusions'
      ];
      userPrompt = `L'utente descrive le condizioni contrattuali per un contratto CGV Vesuviano Forni. Estrai e/o deduci i valori per i campi variabili.\n\nDescrizione utente: "${prompt}"\n\nValori attuali:\n${JSON.stringify(currentFields || {}, null, 2)}\n\nRestituisci SOLO le chiavi da aggiornare. Chiavi consentite: ${allowedKeys.join(', ')}.\n\nRispondi con JSON: {"fields": {"chiave": "valore", ...}}`;
      schemaHint = '{"fields": { [key: string]: string }}';
    } else if (action === 'translate' && sections && sections.length > 0) {
      const langName = LANG_NAMES[targetLanguage] || targetLanguage;
      overrideSystem = `You are a professional legal translator specialized in Italian commercial B2B contracts (CGV / General Conditions of Sale). Translate faithfully from Italian to ${langName}, preserving legal meaning, formal register, section numbering, references to Italian law (e.g. "artt. 1341 e 1342 c.c." — keep the reference and add a short explanatory gloss in the target language in parentheses on first occurrence), and line breaks (\\n). Do not add commentary. Keep proper nouns (Vesuviano Forni, UNITA 1 di Stanislao Elefante, Pettorano sul Gizio, Nocera Inferiore) unchanged. Preserve variable placeholders and blanks (long underscores) exactly. Reply ONLY with valid JSON.`;
      userPrompt = `Translate the following contract sections from Italian to ${langName}. Preserve JSON structure, line breaks (\\n), and section numbering.\n\nSections (JSON):\n${JSON.stringify(sections)}\n\nReply with JSON: {"sections": [{"title": "...", "body": "..."}, ...]} in the same order and count.`;
      schemaHint = '{"sections": [{"title": "string", "body": "string"}]}';
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action or missing params' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lovable-API-Key': apiKey,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: overrideSystem || systemPrompt },
          { role: 'user', content: `${userPrompt}\n\nSchema JSON atteso: ${schemaHint}` },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      const status = response.status === 429 ? 429 : response.status === 402 ? 402 : 500;
      return new Response(JSON.stringify({ error: `AI gateway error: ${errText}` }), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
