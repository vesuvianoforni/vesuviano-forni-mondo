import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface Clause {
  title: string;
  content: string;
}

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
    const action: 'rewrite' | 'add' | 'suggest' | 'improve_all' = body.action;
    const prompt: string = body.prompt || '';
    const clause: Clause | undefined = body.clause;
    const clauses: Clause[] | undefined = body.clauses;

    const systemPrompt = `Sei un assistente legale specializzato in contratti commerciali B2B italiani per la fornitura di forni professionali da parte di Vesuviano Forni (UNITA 1 di Stanislao Elefante, P.IVA IT02192040661).
Scrivi clausole giuridicamente valide, chiare, in italiano formale, adatte a contratti B2B tra un fornitore italiano e clienti in Italia o all'estero.
Rispondi SEMPRE e SOLO con JSON valido, senza markdown, senza spiegazioni aggiuntive.`;

    let userPrompt = '';
    let schemaHint = '';

    if (action === 'rewrite' && clause) {
      userPrompt = `Riscrivi la seguente clausola secondo questa istruzione: "${prompt}".\n\nClausola attuale:\nTitolo: ${clause.title}\nContenuto: ${clause.content}\n\nRispondi con JSON: {"title": "...", "content": "..."}`;
      schemaHint = '{"title": "string", "content": "string"}';
    } else if (action === 'add') {
      userPrompt = `Genera una nuova clausola contrattuale su questo argomento: "${prompt}".\n\nRispondi con JSON: {"title": "...", "content": "..."}`;
      schemaHint = '{"title": "string", "content": "string"}';
    } else if (action === 'suggest') {
      userPrompt = `Suggerisci un set completo di clausole contrattuali standard per una fornitura di forni professionali (oggetto, prezzo e pagamento con acconto 50% + saldo 50% a merce pronta con supporto fotografico, tempi di consegna, garanzia, trasporto, forza maggiore, riservato dominio, foro competente Napoli, privacy GDPR).\n\nRispondi con JSON: {"clauses": [{"title": "...", "content": "..."}, ...]}`;
      schemaHint = '{"clauses": [{"title": "string", "content": "string"}]}';
    } else if (action === 'improve_all' && clauses) {
      userPrompt = `Migliora e uniforma stilisticamente le seguenti clausole secondo questa istruzione: "${prompt || 'rendile più professionali e giuridicamente robuste'}".\n\nClausole:\n${JSON.stringify(clauses, null, 2)}\n\nRispondi con JSON: {"clauses": [{"title": "...", "content": "..."}, ...]} mantenendo lo stesso numero e ordine.`;
      schemaHint = '{"clauses": [{"title": "string", "content": "string"}]}';
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
          { role: 'system', content: systemPrompt },
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
