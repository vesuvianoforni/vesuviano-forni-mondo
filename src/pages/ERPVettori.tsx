import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Save, Trash2, Phone, Mail } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const db = supabase as any;
interface Carrier { id?: string; country: string; name: string; company: string | null; phone: string | null; email: string | null; notes: string | null }
const empty: Carrier = { country: "", name: "", company: "", phone: "", email: "", notes: "" };

export default function ERPVettori() {
  const [rows, setRows] = useState<Carrier[]>([]);
  const [edit, setEdit] = useState<Carrier | null>(null);
  const [q, setQ] = useState("");

  const load = async () => {
    const { data, error } = await db.from("transport_carriers").select("*").order("country").order("name");
    if (error) toast.error("Impossibile caricare i vettori"); else setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!edit?.country.trim() || !edit.name.trim()) return toast.error("Paese e nome sono obbligatori");
    const { id, ...fields } = edit;
    const res = id ? await db.from("transport_carriers").update(fields).eq("id", id) : await db.from("transport_carriers").insert(fields);
    if (res.error) return toast.error("Salvataggio non riuscito");
    toast.success("Vettore salvato"); setEdit(null); load();
  };
  const remove = async (id: string) => {
    if (!confirm("Eliminare questo vettore?")) return;
    await db.from("transport_carriers").delete().eq("id", id); load();
  };

  const groups = useMemo(() => {
    const f = rows.filter(r => `${r.country} ${r.name} ${r.company ?? ""} ${r.notes ?? ""}`.toLowerCase().includes(q.toLowerCase()));
    return f.reduce<Record<string, Carrier[]>>((a, r) => ((a[r.country] ||= []).push(r), a), {});
  }, [rows, q]);

  const field = (k: keyof Carrier, label: string) => (
    <Input placeholder={label} value={(edit?.[k] as string) ?? ""} onChange={e => setEdit({ ...edit!, [k]: e.target.value })} />
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <SEOHead title="Vettori trasporto | ERP Vesuviano" description="Riferimenti vettori per paese" noindex />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Vettori trasporto</h1>
        <div className="flex gap-2">
          <Input placeholder="Cerca…" value={q} onChange={e => setQ(e.target.value)} className="w-56" />
          <Button onClick={() => setEdit({ ...empty })}><Plus className="mr-1 h-4 w-4" />Nuovo vettore</Button>
        </div>
      </div>

      {edit && (
        <Card><CardContent className="grid gap-3 pt-6 md:grid-cols-2">
          {field("country", "Paese *")}{field("name", "Referente *")}{field("company", "Azienda")}{field("phone", "Telefono")}{field("email", "Email")}
          <Textarea className="md:col-span-2" placeholder="Note" value={edit.notes ?? ""} onChange={e => setEdit({ ...edit, notes: e.target.value })} />
          <div className="flex gap-2 md:col-span-2"><Button onClick={save}><Save className="mr-1 h-4 w-4" />Salva</Button><Button variant="outline" onClick={() => setEdit(null)}>Annulla</Button></div>
        </CardContent></Card>
      )}

      {Object.entries(groups).map(([country, list]) => (
        <Card key={country}>
          <CardHeader><CardTitle>{country}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {list.map(c => (
              <div key={c.id} className="flex flex-wrap items-start justify-between gap-3 rounded-md border p-3">
                <div className="min-w-0 space-y-1">
                  <div className="font-semibold">{c.name}{c.company && <span className="font-normal text-muted-foreground"> · {c.company}</span>}</div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {c.phone && <a className="flex items-center gap-1 text-primary" href={`tel:${c.phone.replace(/\s/g, "")}`}><Phone className="h-3 w-3" />{c.phone}</a>}
                    {c.email && <a className="flex items-center gap-1 text-primary" href={`mailto:${c.email}`}><Mail className="h-3 w-3" />{c.email}</a>}
                  </div>
                  {c.notes && <p className="whitespace-pre-line text-sm text-muted-foreground">{c.notes}</p>}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => setEdit(c)}>Modifica</Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(c.id!)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      {!Object.keys(groups).length && <p className="text-muted-foreground">Nessun vettore.</p>}
    </div>
  );
}
