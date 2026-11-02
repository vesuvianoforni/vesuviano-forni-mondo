import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { effectiveDiscount } from "@/lib/productPricing";

const db = supabase as any;
interface Tier { code: string; label: string; percentage: number }

/** Tipo cliente e sconto personale del lead; salva solo questi due campi. */
export function CustomerDiscountField({ leadId }: { leadId: string }) {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [type, setType] = useState("cliente");
  const [override, setOverride] = useState<string>("");

  useEffect(() => {
    let active = true;
    Promise.all([
      db.from("discount_tiers").select("code,label,percentage").order("sort_order"),
      db.from("leads").select("customer_type,discount_override").eq("id", leadId).maybeSingle(),
    ]).then(([t, l]: any[]) => {
      if (!active) return;
      setTiers((t.data || []).map((x: Tier) => ({ ...x, percentage: Number(x.percentage) })));
      setType(l.data?.customer_type || "cliente");
      setOverride(l.data?.discount_override == null ? "" : String(l.data.discount_override));
    });
    return () => { active = false; };
  }, [leadId]);

  const save = async (patch: Record<string, unknown>) => {
    const { error } = await db.from("leads").update(patch).eq("id", leadId);
    if (error) toast.error("Sconto non salvato");
  };

  const tier = tiers.find((t) => t.code === type);
  const applied = effectiveDiscount(tier?.percentage, override === "" ? null : Number(override));

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">Tipo cliente e sconto</p>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={type} onValueChange={(v) => { setType(v); save({ customer_type: v }); }}>
          <SelectTrigger className="h-8 w-40" aria-label="Tipo cliente"><SelectValue /></SelectTrigger>
          <SelectContent>{tiers.map((t) => <SelectItem key={t.code} value={t.code}>{t.label} · {t.percentage}%</SelectItem>)}</SelectContent>
        </Select>
        <Input className="h-8 w-28" inputMode="decimal" placeholder="Sconto pers. %" aria-label="Sconto personale" value={override}
          onChange={(e) => setOverride(e.target.value.replace(",", "."))}
          onBlur={() => save({ discount_override: override.trim() === "" ? null : Number(override) })} />
      </div>
      <p className="text-xs">Sconto applicato: <strong>{applied}%</strong>{override !== "" && " (personale)"}</p>
    </div>
  );
}
