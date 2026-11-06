import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { listUkTemplates } from "@/lib/whatsapp-uk.functions";

export type WaTemplate = { name: string; language: string; category: string; body: string; variables: number };
export type WaTemplateChoice = { name: string; language: string; params: string[]; preview: string } | null;

// Each country WhatsApp line has its own approved templates; cache per line (UK = +44, otherwise default).
const cache = new Map<string, Promise<WaTemplate[]>>();
function loadTemplates(line: "it" | "uk", leadId?: string) {
  const k = line;
  if (k === "uk" && !cache.has(k)) cache.set(k, supabase.auth.getSession().then(({ data: s }) => listUkTemplates({ data: { token: s.session?.access_token ?? "" } }))
    .then((list) => list.filter((t) => t.status === "APPROVED")).catch((e) => { cache.delete(k); throw e; }));
  if (!cache.has(k)) cache.set(k, supabase.functions.invoke("bruno-agent", { body: { action: "wa_templates", ...(leadId ? { lead_id: leadId } : {}) } }).then(({ data, error }) => {
    if (error) { cache.delete(k); throw error; }
    return (data?.templates ?? []) as WaTemplate[];
  }));
  return cache.get(k)!;
}

export const fillTemplate = (body: string, params: string[]) => body.replace(/\{\{(\d+)\}\}/g, (_, n) => params[Number(n) - 1] || `{{${n}}}`);

/** Modelli WhatsApp approvati da Meta: necessari fuori dalla finestra di 24 ore. */
export function WaTemplatePicker({ line = "it", leadId, phone, firstName, value, onChange, disabled }: { line?: "it" | "uk"; leadId?: string | undefined; phone?: string | null | undefined; firstName: string; value: WaTemplateChoice; onChange: (v: WaTemplateChoice) => void; disabled?: boolean | undefined}) {
  const [templates, setTemplates] = useState<WaTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { setError(null); void phone; loadTemplates(line, leadId).then(setTemplates).catch(() => setError(line === "uk" ? "Modelli Bruno UK non disponibili" : "Modelli non disponibili")); }, [line, leadId, phone]);

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
