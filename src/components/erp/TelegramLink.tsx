import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/** Abbina l'account ERP al bot Telegram di Bruno con un codice monouso (15 min). */
export function TelegramLink() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const connect = async () => {
    const win = window.open("", "_blank");
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("telegram-bruno", { body: {} });
    setBusy(false);
    if (error || !data?.link) { win?.close(); toast({ title: "Collegamento non riuscito", variant: "destructive" }); return; }
    if (win) win.location.href = data.link; else window.location.href = data.link;
    toast({ title: "Apri Telegram e premi Avvia", description: `Codice: ${data.code} (valido 15 minuti)` });
  };
  return (
    <Button variant="outline" size="sm" onClick={connect} disabled={busy}>
      {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Collega Telegram
    </Button>
  );
}
