import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Facts = Record<string, string>;
const FIELDS: [string, string][] = [
  ["tipo_attivita", "Tipo di attività"], ["volume_pizze", "Pizze / capacità"], ["misura", "Misura"],
  ["alimentazione", "Alimentazione"], ["finitura", "Finitura"], ["paese", "Paese"], ["citta", "Città"],
  ["cap", "CAP"], ["accesso", "Accesso / ingresso"], ["tempi", "Tempi"], ["modello_consigliato", "Modello consigliato"], ["note", "Note qualifica"],
];

/** Qualification facts on leads.qualification: auto-filled by Bruno's calls, editable by staff. */
export function LeadQualificationCard({ leadId }: { leadId: string }) {
  const [facts, setFacts] = useState<Facts>({});
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [dirty, setDirty] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let alive = true; setLoading(true); setDirty(false);
    supabase.from("leads").select("qualification").eq("id", leadId).single().then(({ data }) => {
      if (!alive) return;
      const q = (data?.qualification ?? {}) as Record<string, unknown>;
      setFacts(Object.fromEntries(Object.entries(q).filter(([, v]) => typeof v === "string")) as Facts);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [leadId]);

  const set = (k: string, v: string) => { setFacts((f) => ({ ...f, [k]: v })); setDirty(true); };
  const save = async () => {
    setSaving(true);
    const clean = Object.fromEntries(Object.entries(facts).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v));
    const { error } = await supabase.from("leads").update({ qualification: clean }).eq("id", leadId);
    setSaving(false);
    if (error) return toast({ title: "Salvataggio non riuscito", description: error.message, variant: "destructive" });
    setDirty(false); toast({ title: "Qualifica salvata" });
  };

  return (
    <Card className="sm:col-span-2">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold">Qualifica</h3>
            <p className="text-xs text-muted-foreground">Compilata in automatico da Bruno durante le chiamate; puoi correggerla.</p>
          </div>
          <Button size="sm" disabled={!dirty || saving} onClick={save}>{saving ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1 h-3.5 w-3.5" />}Salva</Button>
        </div>
        {loading ? <p className="text-sm text-muted-foreground">Caricamento…</p> : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Uso</Label>
              <Select value={facts["uso"]?.toLowerCase().startsWith("prof") ? "professionale" : facts["uso"]?.toLowerCase().startsWith("dom") ? "domestico" : facts["uso"] || ""} onValueChange={(v) => set("uso", v)}>
                <SelectTrigger><SelectValue placeholder="Da qualificare" /></SelectTrigger>
                <SelectContent><SelectItem value="domestico">Domestico</SelectItem><SelectItem value="professionale">Professionale</SelectItem></SelectContent>
              </Select>
            </div>
            {FIELDS.map(([k, label]) => (
              <div key={k} className={k === "note" ? "space-y-1 sm:col-span-2" : "space-y-1"}>
                <Label className="text-xs">{label}</Label>
                <Input value={facts[k] ?? ""} onChange={(e) => set(k, e.target.value)} maxLength={1200} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
