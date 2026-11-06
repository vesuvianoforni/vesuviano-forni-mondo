import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createUkTemplate } from "@/lib/whatsapp-uk.functions";

const countVars = (s: string) => new Set([...s.matchAll(/\{\{(\d+)\}\}/g)].map((m) => m[1])).size;

/** Crea un nuovo modello WhatsApp sul numero Bruno UK e lo invia a Meta per l'approvazione. */
export function WaUkTemplateDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en_GB");
  const [category, setCategory] = useState<"UTILITY" | "MARKETING">("UTILITY");
  const [body, setBody] = useState("Hi {{1}}, this is Bruno from Vesuviano Forni. ");
  const [examples, setExamples] = useState<string[]>(["James"]);
  const [saving, setSaving] = useState(false);
  const vars = countVars(body);
  const ex = Array.from({ length: vars }, (_, i) => examples[i] ?? "");

  const submit = async () => {
    setSaving(true);
    try {
      const { data: s } = await supabase.auth.getSession();
      await createUkTemplate({ data: { token: s.session?.access_token ?? "", name: name.trim(), language, category, body: body.trim(), examples: ex.map((e) => e.trim()) } });
      toast({ title: "Modello inviato a Meta", description: "Sarà utilizzabile dopo l'approvazione (di solito da pochi minuti a 48 ore)." });
      setOpen(false); setName("");
    } catch (e) {
      toast({ title: "Modello non inviato", description: (e as Error).message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button type="button" variant="outline" size="sm" className="h-8 text-xs"><Plus className="mr-1 h-3.5 w-3.5" />Nuovo modello UK</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nuovo modello WhatsApp Bruno UK</DialogTitle>
          <DialogDescription>Usa {"{{1}}"}, {"{{2}}"}… per le parti variabili (es. il nome). Scrivi frasi complete: Meta rifiuta testi troppo brevi.</DialogDescription></DialogHeader>
        <div className="space-y-3">
          <Input placeholder="nome_modello (minuscole e _)" value={name} onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))} />
          <div className="flex gap-2">
            <Select value={language} onValueChange={setLanguage}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{[["en_GB", "Inglese (UK)"], ["it", "Italiano"], ["fr", "Francese"], ["de", "Tedesco"], ["es", "Spagnolo"]].map(([v, l]) => <SelectItem key={v} value={v!}>{l}</SelectItem>)}</SelectContent></Select>
            <Select value={category} onValueChange={(v) => setCategory(v as "UTILITY" | "MARKETING")}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="UTILITY">Servizio (richieste clienti)</SelectItem><SelectItem value="MARKETING">Marketing (promozioni)</SelectItem></SelectContent></Select>
          </div>
          <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
          {ex.map((v, i) => <Input key={i} placeholder={`Esempio per {{${i + 1}}}`} value={v} onChange={(e) => { const n = [...ex]; n[i] = e.target.value; setExamples(n); }} />)}
          <Button className="w-full" onClick={submit} disabled={saving || !name || body.trim().length < 20 || ex.some((e) => !e.trim())}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Invia a Meta per approvazione
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
