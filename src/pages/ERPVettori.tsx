import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Save, Trash2, Phone, Mail, Search, MapPin, Pencil, Loader2 } from "lucide-react";
import { areaMatches, carrierAreas, carrierSaveFields, filterCarriers, normalizeArea, toggleCarrierArea, uniqueAreas, type CarrierStatus, type TransportCarrier } from "@/lib/transportCarriers";

const empty: TransportCarrier = { country: "Da definire", served_areas: [], name: "", company: "", phone: "", email: "", notes: "", is_active: true };

export default function ERPVettori() {
  const [rows, setRows] = useState<TransportCarrier[]>([]);
  const [edit, setEdit] = useState<TransportCarrier | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<CarrierStatus>("all");
  const [area, setArea] = useState("all");
  const [areaSearch, setAreaSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    const all: TransportCarrier[] = [];
    for (let offset = 0; ; offset += 500) {
      const result = await supabase.from("transport_carriers")
        .select("id,country,served_areas,name,company,phone,email,notes,is_active")
        .order("name").order("id").range(offset, offset + 499);
      if (result.error) { setError(true); setLoading(false); return; }
      all.push(...result.data);
      if (result.data.length < 500) break;
    }
    setRows(all); setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    if (!edit?.name.trim()) { toast.error("Il nome del vettore è obbligatorio"); return; }
    setSaving(true);
    const fields = carrierSaveFields(edit);
    const res = edit.id ? await supabase.from("transport_carriers").update(fields).eq("id", edit.id) : await supabase.from("transport_carriers").insert(fields);
    setSaving(false);
    if (res.error) { toast.error("Salvataggio non riuscito"); return; }
    toast.success("Vettore salvato"); setEdit(null); load();
  };
  const remove = async (id: string) => {
    if (!confirm("Eliminare questo vettore?")) return;
    setBusy(id);
    const { error: removeError } = await supabase.from("transport_carriers").delete().eq("id", id);
    setBusy(null);
    if (removeError) { toast.error("Eliminazione non riuscita"); return; }
    void load();
  };
  const toggleActive = async (c: TransportCarrier) => {
    if (!c.id) return;
    setBusy(c.id);
    const { error } = await supabase.from("transport_carriers").update({ is_active: !c.is_active }).eq("id", c.id);
    setBusy(null);
    if (error) { toast.error("Cambio di stato non riuscito"); return; }
    toast.success(!c.is_active ? "Vettore attivato" : "Vettore disattivato");
    load();
  };

  const areas = useMemo(() => uniqueAreas([...rows.flatMap(carrierAreas), ...(edit?.served_areas ?? [])]), [rows, edit?.served_areas]);
  const filtered = useMemo(() => filterCarriers(rows, q, area, status), [rows, q, area, status]);

  const field = (k: "name" | "company" | "phone" | "email", label: string) => (
    <div className="space-y-1.5"><Label htmlFor={`carrier-${k}`}>{label}</Label>
      <Input id={`carrier-${k}`} value={edit?.[k] ?? ""} onChange={e => setEdit(current => current ? { ...current, [k]: e.target.value } : current)} />
    </div>
  );

  const statusBtn = (value: CarrierStatus, label: string) => (
    <Button size="sm" aria-pressed={status === value} variant={status === value ? "default" : "outline"} onClick={() => setStatus(value)}>{label}</Button>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold">Vettori trasporto</h1><p className="mt-1 text-sm text-muted-foreground">{rows.length} vettori · {areas.length} aree servite</p></div>
        <Button onClick={() => { setAreaSearch(""); setEdit({ ...empty, served_areas: [] }); }}><Plus className="mr-1 h-4 w-4" />Nuovo vettore</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-y py-4">
          <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Cerca vettore o area" placeholder="Cerca vettore o area…" value={q} onChange={e => setQ(e.target.value)} className="pl-9" /></div>
          <Select value={area} onValueChange={setArea}><SelectTrigger aria-label="Area servita" className="w-full sm:w-64"><MapPin className="mr-2 h-4 w-4 shrink-0" /><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">Tutte le aree</SelectItem><SelectItem value="unassigned">Aree da definire</SelectItem>{areas.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
          <div className="flex gap-1">
            {statusBtn("all", "Tutti")}
            {statusBtn("active", "Attivi")}
            {statusBtn("inactive", "Non attivi")}
          </div>
      </div>

      <Dialog open={!!edit} onOpenChange={open => { if (!open && !saving) setEdit(null); }}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-2xl overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>{edit?.id ? "Modifica vettore" : "Nuovo vettore"}</DialogTitle></DialogHeader>
          {edit && <form className="grid gap-4 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); void save(); }}>
            {field("name", "Nome vettore *")}{field("company", "Azienda / referente")}{field("phone", "Telefono")}{field("email", "Email")}
            <div className="space-y-3 sm:col-span-2">
              <Label>Aree servite ({edit.served_areas.length})</Label>
              <Input aria-label="Cerca o aggiungi area" placeholder="Cerca o aggiungi un’area…" value={areaSearch} onChange={e => setAreaSearch(e.target.value)} />
              <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
                {areas.filter(item => areaMatches(item, areaSearch)).map(item => <label key={item} className="flex min-w-0 items-start gap-2 text-sm">
                  <Checkbox aria-label={item} checked={edit.served_areas.includes(item)} onCheckedChange={() => setEdit(current => current ? { ...current, served_areas: toggleCarrierArea(current.served_areas, item) } : current)} />
                  <span className="break-words">{item}</span>
                </label>)}
                {!areas.filter(item => areaMatches(item, areaSearch)).length && <span className="text-sm text-muted-foreground">Nessuna area</span>}
              </div>
              {areaSearch.trim() && !areas.some(item => normalizeArea(item) === normalizeArea(areaSearch)) && <Button type="button" variant="outline" size="sm" className="max-w-full whitespace-normal" onClick={() => { setEdit({ ...edit, served_areas: uniqueAreas([...edit.served_areas, areaSearch]) }); setAreaSearch(""); }}><Plus className="mr-1 h-4 w-4 shrink-0" />Aggiungi {areaSearch.trim()}</Button>}
              <div className="flex flex-wrap gap-1">{edit.served_areas.map(item => <Badge variant="secondary" key={item} className="max-w-full whitespace-normal">{item}</Badge>)}</div>
            </div>
            <div className="flex items-center gap-3 sm:col-span-2"><Switch id="carrier-active" checked={edit.is_active} onCheckedChange={v => setEdit({ ...edit, is_active: v })} /><Label htmlFor="carrier-active">{edit.is_active ? "Vettore attivo" : "Vettore non attivo"}</Label></div>
            <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="carrier-notes">Note e riferimenti</Label><Textarea id="carrier-notes" rows={4} value={edit.notes ?? ""} onChange={e => setEdit({ ...edit, notes: e.target.value })} /></div>
            <div className="flex gap-2 sm:col-span-2"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}Salva</Button><Button type="button" variant="outline" disabled={saving} onClick={() => setEdit(null)}>Annulla</Button></div>
          </form>}
        </DialogContent>
      </Dialog>

      {loading ? <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Caricamento vettori…</p> : error ? <div role="alert" className="space-y-2"><p>Impossibile caricare i vettori</p><Button variant="outline" onClick={() => void load()}>Riprova</Button></div> : <>
        <p className="text-sm text-muted-foreground">{filtered.length} vettori{area !== "all" && ` · ${area === "unassigned" ? "Aree da definire" : area}`}</p>
        <div className="grid gap-4 xl:grid-cols-2">
            {filtered.map(c => (
              <Card key={c.id} aria-label={c.name}><CardContent className="space-y-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0"><h2 className="break-words font-semibold">{c.name}</h2>{c.company && <p className="break-words text-sm text-muted-foreground">{c.company}</p>}</div>
                    <Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? "Attivo" : "Non attivo"}</Badge>
                  </div>
                  <div className="space-y-2"><p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><MapPin className="h-3.5 w-3.5" />Aree servite</p><div className="flex flex-wrap gap-1.5">{carrierAreas(c).length ? carrierAreas(c).map(item => <Badge key={item} variant={area !== "all" && areaMatches(item, area) || q && areaMatches(item, q) ? "default" : "outline"} className="max-w-full whitespace-normal">{item}</Badge>) : <span className="text-sm text-muted-foreground">Da definire</span>}</div></div>
                  <div className="flex flex-wrap gap-4 break-all text-sm">
                    {c.phone && <a className="flex items-center gap-1 text-primary" href={`tel:${c.phone.replace(/\s/g, "")}`}><Phone className="h-3 w-3" />{c.phone}</a>}
                    {c.email && <a className="flex items-center gap-1 text-primary" href={`mailto:${c.email}`}><Mail className="h-3 w-3" />{c.email}</a>}
                  </div>
                  {c.notes && <details className="text-sm"><summary className="cursor-pointer text-muted-foreground">Note e riferimenti</summary><p className="mt-3 max-h-72 overflow-y-auto whitespace-pre-line break-words text-muted-foreground [overflow-wrap:anywhere]">{c.notes}</p></details>}
                <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                  <Switch aria-label={`Attivo ${c.name}`} checked={c.is_active} disabled={busy === c.id} onCheckedChange={() => void toggleActive(c)} />
                  <span className="text-xs text-muted-foreground">{c.is_active ? "Attivo" : "Non attivo"}</span>
                  <Button size="sm" variant="outline" className="ml-auto" onClick={() => { setAreaSearch(""); setEdit({ ...c, served_areas: [...carrierAreas(c)] }); }}><Pencil className="mr-1.5 h-3.5 w-3.5" />Modifica</Button>
                  <Button size="icon" variant="ghost" aria-label={`Elimina ${c.name}`} title="Elimina vettore" disabled={busy === c.id} onClick={() => { if (c.id) void remove(c.id); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent></Card>
            ))}
        </div>
        {!filtered.length && <p className="text-muted-foreground">Nessun vettore trovato.</p>}
      </>}
    </div>
  );
}
