import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, ImageOff, Loader2 } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Button } from "@/components/ui/button";
import { materialFormat } from "@/lib/materialFiles";

function PdfPreview({ url, title, expanded }: { url: string; title: string; expanded: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let task: ReturnType<typeof import("pdfjs-dist").getDocument> | undefined;
    setDocument(null);
    setPageNumber(1);
    setFailed(false);
    setLoading(true);
    import("pdfjs-dist").then((pdfjs) => {
      if (cancelled) return;
      pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      task = pdfjs.getDocument({ url });
      return task.promise;
    }).then((pdf) => {
      if (!cancelled && pdf) setDocument(pdf);
    }).catch(() => {
      if (!cancelled) { setFailed(true); setLoading(false); }
    });
    return () => { cancelled = true; void task?.destroy(); };
  }, [url]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!document || !canvas) return;
    let cancelled = false;
    let rendering: ReturnType<Awaited<ReturnType<PDFDocumentProxy["getPage"]>>["render"]> | undefined;
    setLoading(true);
    document.getPage(pageNumber).then((page) => {
      if (cancelled) return;
      const original = page.getViewport({ scale: 1 });
      const width = expanded ? 900 : 600;
      const viewport = page.getViewport({ scale: width / original.width });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      rendering = page.render({ canvas, viewport });
      return rendering.promise;
    }).then(() => {
      if (!cancelled) setLoading(false);
    }).catch(() => {
      if (!cancelled) { setFailed(true); setLoading(false); }
    });
    return () => { cancelled = true; rendering?.cancel(); };
  }, [document, pageNumber, expanded]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-2">
      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
        <canvas ref={canvasRef} aria-label={`Anteprima PDF: ${title}, pagina ${pageNumber}`} className={`max-h-full max-w-full object-contain ${loading || failed ? "hidden" : ""}`} />
        {loading && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Caricamento anteprima" />}
        {failed && <span className="flex flex-col items-center gap-2 text-xs text-muted-foreground"><FileText className="h-8 w-8" />Anteprima non disponibile</span>}
      </div>
      {expanded && document && document.numPages > 1 && (
        <div className="flex h-8 shrink-0 items-center gap-3">
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label="Pagina precedente" disabled={pageNumber === 1 || loading} onClick={() => setPageNumber((n) => n - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-xs text-muted-foreground">{pageNumber} / {document.numPages}</span>
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label="Pagina successiva" disabled={pageNumber === document.numPages || loading} onClick={() => setPageNumber((n) => n + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}

export default function MaterialPreview({ url, title, expanded = false, mimeType = '' }: { url: string; title: string; expanded?: boolean; mimeType?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  const format = materialFormat(url, mimeType);
  if (format === "pdf") return <PdfPreview url={url} title={title} expanded={expanded} />;
  if (failed) return <span className="flex flex-col items-center gap-2 text-xs text-muted-foreground"><ImageOff className="h-8 w-8" />Anteprima non disponibile</span>;
  if (format === "image") return <img src={url} alt={title} className="h-full w-full object-contain" loading="lazy" onError={() => setFailed(true)} />;
  if (format === "video") return <video src={url} className="h-full w-full object-contain" controls={expanded} muted={!expanded} preload="metadata" onError={() => setFailed(true)} />;
  return <FileText className="h-10 w-10 text-muted-foreground" />;
}