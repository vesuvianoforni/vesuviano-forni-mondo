import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { BrunoPanel, type BrunoLead } from "./BrunoPanel";

/** Pannello a scomparsa con le comunicazioni di Bruno per un singolo lead. */
export function BrunoConsole({ lead, open, onOpenChange }: { lead: BrunoLead | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetTitle className="sr-only">Comunicazioni con il cliente</SheetTitle>
        <SheetDescription className="sr-only">Timeline dei messaggi, suggerimenti di Bruno e composer.</SheetDescription>
        {lead && <BrunoPanel lead={lead} />}
      </SheetContent>
    </Sheet>
  );
}
