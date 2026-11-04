import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export type WaTemplate = { name: string; language: string; category: string; body: string; variables: number };
export type WaTemplateChoice = { name: string; language: string; params: string[]; preview: string } | null;

let cache: Promise<WaTemplate[]> | null = null;
function loadTemplates() {
  cache ??= supabase.functions.invoke("bruno-agent", { body: { action: "wa_templates" } }).then(({ data, error }) => {
    if (error) { cache = null; throw error; }
    return (data?.templates ?? []) as WaTemplate[];
  });
  return cache;
}

export const fillTemplate = (body: string, params: string[]) => body.replace(/\{\{(\d+)\}\}/g, (_, n) => params[Number(n) - 1] || `{{${n}}}`);

/** Modelli WhatsApp approvati da Meta: necessari fuori dalla finestra di 24 ore. */
export function WaTemplatePicker({ firstName, value, onChange, disabled }: { firstName: string; value: WaTemplateChoice; onChange: (v: WaTemplateChoice) => void; disabled?: boolean }) {
  const [templates, setTemplates] = useState<WaTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { loadTemplates().then(setTemplates).catch(() => setError("Modelli non disponibili")); }, []);

  const key = value ? `${value.name}|${value.language}` : "free";
  const tpl = templates.find((t) => `${t.name}|${t.language}` === key);
  const update = (t: WaTemplate, params: string[]) => onChange({ name: t.name, language: t.language, params, preview: fillTemplate(t.body, params) });

  return (
    <div className="space-y-2">
      <Select value={key} disabled={disabled} onValueChange={(k) => {
        const t = templates.find((x) => `${x.name}|${x.language}` === k);
        if (!t) return onChange(null);
        update(t, Array.from({ length: t.variables }, (_, i) => (i === 0 ? firstName : "")));
      }}>
        <SelectTrigger className="h-8 text-xs" aria-label="Modello WhatsApp"><SelectValue placeholder="Messaggio libero" /></SelectTrigger>
        <SelectContent className="max-h-72">
          <SelectItem value="free">Messaggio libero (solo entro 24h dall'ultimo messaggio del cliente)</SelectItem>
          {templates.map((t) => <SelectItem key={`${t.name}|${t.language}`} value={`${t.name}|${t.language}`}>{t.name} · {t.language.toUpperCase()}</SelectItem>)}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {tpl && value && tpl.variables > 0 && <div className="flex flex-wrap gap-2">
        {value.params.map((p, i) => <Input key={i} aria-label={`Variabile ${i + 1}`} placeholder={`Variabile {{${i + 1}}}`} value={p} disabled={disabled} className="h-8 w-40 text-xs"
          onChange={(e) => { const next = [...value.params]; next[i] = e.target.value; update(tpl, next); }} />)}
      </div>}
    </div>
  );
}
