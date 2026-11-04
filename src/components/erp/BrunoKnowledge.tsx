import { useEffect, useState } from "react";
import { BookOpen, Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CRM_STAGES } from "@/lib/crmPipeline";
import { toast } from "sonner";

const db = supabase as any;
interface Entry { id: string; category: string; title: string; content: string; stages: string[]; is_active: boolean }
const blank = (): Entry => ({ id: "", category: "generale", title: "", content: "", stages: [], is_active: true });

/** Editor of Bruno's official knowledge base; each entry can be limited to some pipeline stages. */
export function BrunoKnowledge() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Entry[]>([]);
  const [edit, setEdit] = useState<Entry | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await db.from("bruno_knowledge").select("id,category,title,content,stages,is_active").order("sort_order");
    if (error) toast.error(error.message); else setRows(data ?? []);
  };
  useEffect(() => { if (open) load(); }, [open]);

  const save = async () => {
    if (!edit || !edit.title.trim() || !edit.content.trim()) return toast.error("Titolo e contenuto obbligatori");
    setBusy(true);
    const { id, ...fields } = edit;
    const { error } = id ? await db.from("bruno_knowledge").update(fields).eq("id", id) : await db.from("bruno_knowledge").insert({ ...fields, sort_order: rows.length + 1 });
    setBusy(false);
    if (error) return toast.error(error.message);
    setEdit(null); load(); toast.success("Knowledge salvata");
  };
  const remove = async (id: string) => {
    const { error } = await db.from("bruno_knowledge").delete().eq("id", id);
    if (error) toast.error(error.message); else load();
  };
  const toggleStage = (s: string) => edit && setEdit({ ...edit, stages: edit.stages.includes(s) ? edit.stages.filter((x) => x !== s) : [...edit.stages, s] });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline"><BookOpen className="mr-1.5 h-4 w-4" />Knowledge</Button></DialogTrigger>
      <DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto">
        <DialogHeader><DialogTitle>Knowledge base di Bruno</DialogTitle></DialogHeader>
        {edit ? (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
              <Input placeholder="Categoria" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} />
              <Input placeholder="Titolo" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
            </div>
            <Textarea rows={6} placeholder="Cosa deve sapere Bruno" value={edit.content} onChange={(e) => setEdit({ ...edit, content: e.target.value })} />
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Vale nelle fasi (nessuna = sempre)</p>
              <div className="flex flex-wrap gap-1.5">{CRM_STAGES.map((s) => (
                <Badge key={s.id} variant={edit.stages.includes(s.id) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleStage(s.id)}>{s.title}</Badge>
              ))}</div>
            </div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setEdit(null)}>Annulla</Button><Button onClick={save} disabled={busy}>{busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Salva</Button></div>
          </div>
        ) : (
          <div className="space-y-2">
            <Button size="sm" onClick={() => setEdit(blank())}><Plus className="mr-1 h-4 w-4" />Nuova voce</Button>
            {rows.map((r) => (
              <div key={r.id} className="flex items-start gap-2 rounded-lg border p-3">
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setEdit(r)}>
                  <p className="text-sm font-medium">{r.title} <span className="text-xs font-normal text-muted-foreground">· {r.category}</span></p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{r.content}</p>
                  {r.stages.length > 0 && <p className="mt-1 text-[11px] text-primary">{r.stages.join(", ")}</p>}
                </button>
                <Button size="icon" variant="ghost" aria-label="Elimina" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
