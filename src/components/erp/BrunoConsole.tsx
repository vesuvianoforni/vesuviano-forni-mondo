import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "radix-ui";
import { BrunoPanel, type BrunoLead } from "./BrunoPanel";

/** Pannello a scomparsa con le comunicazioni di Bruno per un singolo lead. */
export function BrunoConsole({ lead, open, onOpenChange }: { lead: BrunoLead | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <VisuallyHidden.Root asChild>
          <SheetTitle>Comunicazioni con il cliente</SheetTitle>
        </VisuallyHidden.Root>
        <VisuallyHidden.Root asChild>
          <SheetDescription>Timeline dei messaggi, suggerimenti di Bruno e composer.</SheetDescription>
        </VisuallyHidden.Root>
        {lead && <BrunoPanel lead={lead} />}
      </SheetContent>
    </Sheet>
  );
}
