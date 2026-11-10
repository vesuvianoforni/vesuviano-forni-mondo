import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Download, FileText, Image, Loader2, Paperclip, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchMailAttachment, listMailAttachments, mailAttachmentNames, mailAttachmentSize, mailAttachmentType, saveMailAttachment, type MailAttachment, type MailAttachmentSource } from '@/lib/mailAttachments';
import MaterialPreview from './MaterialPreview';

export function MailAttachments({ source, names }: { source: MailAttachmentSource; names?: unknown }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<MailAttachment[] | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  const [selected, setSelected] = useState<MailAttachment | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const generation = useRef(0);
  const sourceId = source.itemId || source.messageId;
  const storedNames = mailAttachmentNames(names);
  useEffect(() => {
    generation.current += 1;
    setExpanded(false); setLoading(false); setError(null); setFiles(null); setItemId(null); setSelected(null); setBlob(null); setFileError(null);
    return () => { generation.current += 1; };
  }, [sourceId]);
  useEffect(() => {
    if (!blob) { setUrl(null); return; }
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);
  const load = async () => {
    const request = ++generation.current;
    setLoading(true); setError(null); setExpanded(true);
    try {
      const result = await listMailAttachments(source);
      if (request !== generation.current) return;
      setFiles(result.attachments); setItemId(result.item_id);
    } catch (err) { if (request === generation.current) setError(err instanceof Error ? err.message : 'Allegati non disponibili.'); }
    finally { if (request === generation.current) setLoading(false); }
  };
  const openFile = async (file: MailAttachment) => {
    if (!itemId) return;
    const request = ++generation.current;
    setSelected(file); setBlob(null); setFileLoading(true); setFileError(null);
    try {
      const content = await fetchMailAttachment(itemId, file);
      if (request === generation.current) setBlob(content);
    } catch (err) { if (request === generation.current) setFileError(err instanceof Error ? err.message : 'Allegato non disponibile.'); }
    finally { if (request === generation.current) setFileLoading(false); }
  };
  const count = files?.length ?? storedNames.length;
  const previewType = selected ? mailAttachmentType(selected.type) : '';
  return <section className="mt-3 min-w-0 border-t pt-2" aria-label="Allegati email">
    <Button size="sm" variant="ghost" className="max-w-full px-1 text-xs" aria-expanded={expanded} disabled={loading} onClick={() => { if (expanded) setExpanded(false); else if (files !== null) setExpanded(true); else void load(); }}>
      {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Paperclip className="mr-1.5 h-3.5 w-3.5" />}Allegati{count > 0 ? ` (${count})` : ''}{expanded ? <ChevronUp className="ml-2 h-3.5 w-3.5" /> : <ChevronDown className="ml-2 h-3.5 w-3.5" />}
    </Button>
    {expanded && <div className="mt-1 space-y-2">
      {error ? <div className="space-y-1"><p role="alert" className="text-xs text-destructive">{error}</p><Button variant="outline" size="sm" onClick={() => void load()}><RefreshCw className="mr-2 h-3.5 w-3.5" />Riprova</Button></div> : loading ? <p className="text-xs text-muted-foreground" aria-live="polite">Recupero allegati…</p> : files?.length ? <ul className="space-y-1.5">{files.map(file => <li key={file.part}>
        <Button variant="outline" className="h-auto min-h-11 w-full justify-start gap-2 whitespace-normal px-3 py-2 text-left" onClick={() => void openFile(file)}>
          {file.type.startsWith('image/') ? <Image className="h-4 w-4 shrink-0 text-primary" /> : <FileText className="h-4 w-4 shrink-0 text-primary" />}<span className="min-w-0 flex-1"><span className="block break-words text-xs font-medium [overflow-wrap:anywhere]">{file.name}</span><span className="block text-[11px] text-muted-foreground">{[mailAttachmentSize(file.size), file.inline ? 'Immagine incorporata' : null].filter(Boolean).join(' · ')}</span></span>
        </Button>
      </li>)}</ul> : <p className="text-xs text-muted-foreground">Nessun allegato.</p>}
    </div>}
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open) { generation.current += 1; setSelected(null); setBlob(null); setFileLoading(false); } }}>
      <DialogContent className="flex max-h-[90dvh] w-[calc(100%-24px)] max-w-3xl flex-col overflow-hidden">
        <DialogHeader className="min-w-0 pr-6"><DialogTitle className="break-words leading-normal [overflow-wrap:anywhere]">{selected?.name || 'Allegato'}</DialogTitle><DialogDescription>{selected ? mailAttachmentSize(selected.size) || 'Allegato email' : 'Allegato email'}</DialogDescription></DialogHeader>
        {fileLoading ? <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Caricamento allegato" /></div> : fileError ? <div className="space-y-3"><p className="text-sm text-destructive" role="alert">{fileError}</p><Button variant="outline" onClick={() => { if (selected) void openFile(selected); }}><RefreshCw className="mr-2 h-4 w-4" />Riprova</Button></div> : url && blob && <>
          {previewType === 'application/pdf' || previewType.startsWith('image/') || previewType.startsWith('video/') ? <div className="h-[min(55dvh,550px)] min-h-0 overflow-hidden rounded-md border bg-muted/30"><MaterialPreview url={url} title={selected?.name || 'Allegato'} mimeType={previewType} expanded /></div> : previewType.startsWith('audio/') ? <audio controls preload="metadata" src={url} className="w-full" aria-label={selected?.name || 'Allegato audio'} /> : <div className="flex h-28 flex-col items-center justify-center gap-2 text-muted-foreground"><FileText className="h-8 w-8" /><p className="text-sm">Anteprima non disponibile</p></div>}
          <Button className="shrink-0 self-end" onClick={() => { if (selected) void saveMailAttachment(blob, selected.name).catch(() => setFileError('Download non riuscito. Riprova.')); }}><Download className="mr-2 h-4 w-4" />Scarica</Button>
        </>}
      </DialogContent>
    </Dialog>
  </section>;
}