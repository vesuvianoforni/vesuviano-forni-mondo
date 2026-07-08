import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Download, PenLine, CheckCircle2, FileText, Eye, EyeOff, Calendar, Truck, Shield, Wrench, CreditCard, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { generateContractPdf, buildOrderConfirmationSections, type ContractVariableFields } from '@/components/erp/contractPdf';
import SEOHead from '@/components/SEOHead';

interface Contract {
  id: string;
  client_name: string;
  client_email: string | null;
  client_address: string | null;
  client_vat: string | null;
  offer_number: string | null;
  offer_date: string | null;
  destination: string | null;
  place_signed: string | null;
  total_amount: number;
  currency: string;
  payment_terms: string;
  warranty_years: number;
  variable_fields: ContractVariableFields;
  status: string;
  client_signature: string | null;
  client_signed_at: string | null;
  created_at: string;
  signature_token: string;
}

const SignaturePad: React.FC<{ onChange: (dataUrl: string | null) => void }> = ({ onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStroke = useRef(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * ratio;
    c.height = rect.height * ratio;
    const ctx = c.getContext('2d')!;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#111';
  }, []);

  const getPos = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    hasStroke.current = true;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (hasStroke.current) onChange(canvasRef.current!.toDataURL('image/png'));
  };

  const clear = () => {
    const c = canvasRef.current!;
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
    hasStroke.current = false;
    onChange(null);
  };

  return (
    <div>
      <div className="rounded-lg border-2 border-dashed border-amber-500/60 bg-white">
        <canvas
          ref={canvasRef}
          className="w-full h-40 touch-none cursor-crosshair"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-500">Firma qui sopra con mouse o dito</span>
        <button type="button" onClick={clear} className="text-xs text-amber-700 hover:text-amber-900 underline">
          Cancella
        </button>
      </div>
    </div>
  );
};

const PublicContractSign: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [buildingPdf, setBuildingPdf] = useState(false);
  const [uiLang, setUiLang] = useState<'fr' | 'it'>('fr');

  const buildPdfBlobUrl = async (c: Contract) => {
    const doc = await generateContractPdf({
      ...c,
      variable_fields: c.variable_fields || {},
      language: uiLang,
    } as any);
    const blob = doc.output('blob');
    return URL.createObjectURL(blob);
  };

  useEffect(() => {
    // Regenerate the PDF when language changes
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiLang]);


  useEffect(() => {
    return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
  }, [pdfUrl]);

  const ensurePdfUrl = async (c: Contract) => {
    if (pdfUrl) return pdfUrl;
    setBuildingPdf(true);
    try {
      const url = await buildPdfBlobUrl(c);
      setPdfUrl(url);
      return url;
    } finally {
      setBuildingPdf(false);
    }
  };

  const handleTogglePreview = async () => {
    if (!contract) return;
    if (showPreview) { setShowPreview(false); return; }
    try {
      await ensurePdfUrl(contract);
      setShowPreview(true);
    } catch (e: any) {
      toast.error('Errore anteprima: ' + e.message);
    }
  };

  useEffect(() => {
    (async () => {
      if (!token) { setError('Token mancante'); setLoading(false); return; }
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('signature_token', token)
        .maybeSingle();
      if (error || !data) {
        setError('Contratto non trovato o link non valido');
      } else {
        setContract(data as any);
        setFullName((data as any).client_name || '');
      }
      setLoading(false);
    })();
  }, [token]);

  const handleDownloadPdf = async () => {
    if (!contract) return;
    try {
      const url = await ensurePdfUrl(contract);
      const filename = `CGV_${contract.client_name.replace(/\s+/g, '_')}${contract.offer_number ? `_${contract.offer_number}` : ''}.pdf`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      toast.error('Errore PDF: ' + e.message);
    }
  };

  const handleSubmitSignature = async () => {
    if (!contract) return;
    if (!signature) { toast.error('Inserisci la firma'); return; }
    if (!fullName.trim()) { toast.error('Inserisci nome e cognome'); return; }
    if (!accepted) { toast.error('Devi accettare le condizioni'); return; }
    setSubmitting(true);
    try {
      // Best-effort IP capture
      let ip = '';
      try {
        const r = await fetch('https://api.ipify.org?format=json');
        if (r.ok) { const j = await r.json(); ip = j.ip || ''; }
      } catch { /* ignore */ }

      const { error } = await supabase
        .from('contracts')
        .update({
          client_signature: signature,
          client_signed_at: new Date().toISOString(),
          client_signature_ip: ip || null,
          status: 'signed',
          signed_at: new Date().toISOString(),
        })
        .eq('signature_token', contract.signature_token);
      if (error) throw error;

      // Reload contract with signature applied
      const { data } = await supabase
        .from('contracts')
        .select('*')
        .eq('signature_token', contract.signature_token)
        .maybeSingle();
      if (data) setContract(data as any);

      toast.success('Contratto firmato con successo. Puoi ora scaricare il PDF.');

      // Auto-download
      setTimeout(() => handleDownloadPdf(), 500);
    } catch (e: any) {
      toast.error('Errore: ' + (e.message || 'firma non salvata'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Contratto non disponibile</h1>
          <p className="text-gray-600">{error || 'Link non valido o scaduto.'}</p>
        </div>
      </div>
    );
  }

  const amountFmt = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: contract.currency || 'EUR',
  }).format(contract.total_amount || 0);

  const alreadySigned = !!contract.client_signature;

  const isOrderConfirmation = /pietra calda|l'?\s*arche/i.test(contract.client_name || '');
  const T = uiLang === 'fr'
    ? {
        docTitleOC: "Confirmation de Commande",
        docTitleCGV: 'Conditions Générales de Vente',
        badgeOC: 'Confirmation de Commande',
        badgeCGV: 'Document Contractuel',
        offerRef: 'Réf. offre',
        client: 'Client',
        amount: 'Montant',
        supplier: 'Fournisseur',
      }
    : {
        docTitleOC: "Conferma d'Ordine",
        docTitleCGV: 'Condizioni Generali di Vendita',
        badgeOC: "Conferma d'Ordine",
        badgeCGV: 'Documento Contrattuale',
        offerRef: 'Rif. Offerta',
        client: 'Cliente',
        amount: 'Importo',
        supplier: 'Fornitore',
      };
  const docTitle = isOrderConfirmation ? T.docTitleOC : T.docTitleCGV;

  return (
    <>
      <SEOHead title={`${docTitle} | Vesuviano Forni`} description="Firma le Condizioni Generali di Vendita" lang="it" noIndex />
      <div
        className="min-h-screen py-8 px-4"
        style={{
          background:
            'radial-gradient(ellipse at top, hsl(28 40% 96%) 0%, hsl(30 25% 92%) 45%, hsl(24 20% 88%) 100%)',
        }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Header brand */}
          <div
            className="relative overflow-hidden rounded-t-2xl p-6 md:p-8 text-white shadow-xl"
            style={{
              background:
                'linear-gradient(135deg, #0a0a0a 0%, #1a1410 45%, #2a1a10 100%)',
            }}
          >
            {/* Ember glow accents */}
            <div
              className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-30 blur-3xl"
              style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
            />
            <div
              className="pointer-events-none absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-20 blur-3xl"
              style={{ background: 'radial-gradient(circle, #dc2626 0%, transparent 70%)' }}
            />
            {/* Gold hairline */}
            <div
              className="absolute inset-x-0 bottom-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, transparent, #f59e0b 50%, transparent)' }}
            />

            <div className="relative flex items-center justify-between gap-4 flex-wrap">
              <img
                src="/lovable-uploads/vesuviano-logo-bianco.png"
                alt="Vesuviano Forni"
                className="h-14 md:h-16 w-auto"
              />
              <div className="text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 backdrop-blur-sm">
                  <FileSignatureIcon />
                  <span className="text-xs font-semibold tracking-widest uppercase text-amber-300">
                    {isOrderConfirmation ? "Conferma d'Ordine" : 'Documento Contrattuale'}
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 mt-2">
                  UNITA 1 di Stanislao Elefante
                </div>
                <div className="text-[11px] text-stone-500">
                  P.IVA IT02192040661 · PEC u1@pec.it
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-b-2xl shadow-xl p-6 md:p-10 border border-t-0 border-stone-200/70">
            <div className="mb-8">
              <div className="text-[11px] uppercase tracking-[0.2em] text-amber-700 font-semibold mb-2">Vesuviano Forni</div>
              <h1 className="text-3xl md:text-4xl font-bold text-stone-900 leading-tight tracking-tight" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                {docTitle}
              </h1>
              <div className="mt-3 h-[3px] w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #b45309, #f59e0b)' }} />
              <p className="text-sm text-stone-600 mt-4">
                Rif. Offerta: <strong className="text-stone-900">{contract.offer_number || '—'}</strong> ·
                Cliente: <strong className="text-stone-900">{contract.client_name}</strong> ·
                Importo: <strong className="text-stone-900">{amountFmt}</strong>
              </p>
            </div>

            {/* Conferma d'Ordine — testo completo (prima degli highlights) */}
            {isOrderConfirmation && (() => {
              const sections = buildOrderConfirmationSections(contract as any);
              return (
                <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 mb-8 border border-stone-200 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-amber-700 font-semibold">Fornitore</div>
                      <div className="text-sm font-bold text-stone-900 mt-1">Vesuviano Forni — UNITA 1</div>
                      <div className="text-xs text-stone-600">di Stanislao Elefante</div>
                      <div className="text-[11px] text-stone-500 mt-1">P.IVA IT02192040661</div>
                      <div className="text-[11px] text-stone-500">Via Piaia, 44 — 67034 Pettorano sul Gizio (AQ)</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-widest text-amber-700 font-semibold">Cliente</div>
                      <div className="text-sm font-bold text-stone-900 mt-1">{contract.client_name}</div>
                      {contract.client_address && <div className="text-xs text-stone-600 whitespace-pre-line">{contract.client_address}</div>}
                      {contract.client_vat && <div className="text-[11px] text-stone-500 mt-1">TVA: {contract.client_vat}</div>}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {sections.map((sec, i) => (
                      <div key={i}>
                        <h3 className="text-sm font-bold text-stone-900 mb-1.5">{sec.title}</h3>
                        <div className="text-[13px] text-stone-700 leading-relaxed whitespace-pre-line">{sec.body}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Highlights contrattuali */}
            {(() => {
              const vf = contract.variable_fields || {};
              const items: { icon: any; label: string; value: string }[] = [];
              items.push({ icon: CreditCard, label: 'Importo complessivo', value: amountFmt });
              items.push({ icon: CreditCard, label: 'Modalità di pagamento', value: contract.payment_terms });
              items.push({ icon: Shield, label: 'Garanzia', value: `${contract.warranty_years} ${contract.warranty_years === 1 ? 'anno' : 'anni'}${vf.warranty_coverage ? ' — ' + vf.warranty_coverage : ''}` });
              if (vf.production_time || vf.production_days) items.push({ icon: Calendar, label: 'Tempi di produzione', value: vf.production_time || `${vf.production_days} giorni` });
              if (vf.delivery_estimate || vf.shipping_days) items.push({ icon: Truck, label: 'Consegna stimata', value: vf.delivery_estimate || `${vf.shipping_days} giorni` });
              if (vf.shipping_method || vf.incoterms) items.push({ icon: Truck, label: 'Spedizione', value: [vf.shipping_method, vf.incoterms].filter(Boolean).join(' · ') });
              if (vf.shipping_included) items.push({ icon: Truck, label: 'Trasporto incluso', value: vf.shipping_included });
              if (vf.unloading_included) items.push({ icon: Wrench, label: 'Scarico incluso', value: vf.unloading_included });
              if (vf.installation_included || vf.assembly_included) items.push({ icon: Wrench, label: 'Installazione/Montaggio', value: [vf.assembly_included, vf.installation_included].filter(Boolean).join(' · ') });
              if (vf.startup_included) items.push({ icon: Wrench, label: 'Avviamento', value: vf.startup_included });
              if (vf.training_included) items.push({ icon: Wrench, label: 'Formazione', value: vf.training_included });
              if (contract.destination) items.push({ icon: MapPin, label: 'Destinazione', value: contract.destination });
              if (vf.refund_days) items.push({ icon: CreditCard, label: 'Termini di recesso', value: `${vf.refund_days} giorni` });

              return (
                <div
                  className="relative overflow-hidden rounded-2xl p-6 mb-8 border border-amber-200/70"
                  style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fed7aa 100%)' }}
                >
                  <div
                    className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-30 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
                  />
                  <h2 className="relative font-bold text-stone-900 mb-5 flex items-center gap-2 text-lg">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
                      <FileText className="w-4 h-4" />
                    </span>
                    Highlights contrattuali
                  </h2>
                  <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map((it, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 bg-white/90 backdrop-blur-sm rounded-xl p-3.5 border border-amber-100/80 shadow-sm hover:shadow-md hover:border-amber-300 transition-all"
                      >
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 shrink-0">
                          <it.icon className="w-4 h-4 text-amber-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] uppercase tracking-widest text-amber-800/80 font-semibold">{it.label}</div>
                          <div className="text-sm text-stone-900 break-words leading-snug mt-0.5">{it.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="relative mt-5 pt-4 border-t border-amber-300/40 text-xs text-amber-900/90">
                    <strong>Cliente:</strong> {contract.client_name}
                    {contract.client_vat && <> · <strong>P.IVA/CF:</strong> {contract.client_vat}</>}
                    {contract.offer_number && <> · <strong>Offerta:</strong> {contract.offer_number}</>}
                  </div>
                </div>
              );
            })()}

            <div className="mb-6 flex flex-wrap gap-3">
              <Button
                onClick={handleTogglePreview}
                disabled={buildingPdf}
                className="text-white shadow-lg hover:shadow-xl transition-shadow"
                style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #ea580c 100%)' }}
              >
                {buildingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showPreview ? 'Nascondi anteprima' : (isOrderConfirmation ? 'Leggi la conferma e i termini' : 'Leggi il contratto qui')}
              </Button>
              <Button variant="outline" onClick={handleDownloadPdf} className="border-amber-700 text-amber-800 hover:bg-amber-50">
                <Download className="w-4 h-4 mr-2" /> Scarica PDF
              </Button>
            </div>

            {showPreview && pdfUrl && (
              <div className="mb-6 border border-amber-200 rounded-xl overflow-hidden bg-neutral-100 shadow-inner">
                <iframe
                  src={pdfUrl}
                  title={isOrderConfirmation ? "Anteprima conferma d'ordine" : 'Anteprima contratto'}
                  className="w-full"
                  style={{ height: '80vh', minHeight: 600 }}
                />
                <p className="text-xs text-stone-500 p-2 bg-white border-t border-amber-100">
                  Se l'anteprima non si vede sul tuo dispositivo, usa "Scarica PDF".
                </p>
              </div>
            )}

            <p className="text-xs text-stone-500 mb-6">
              {isOrderConfirmation
                ? "Leggi la conferma d'ordine e i termini e condizioni prima di firmare. La firma implica l'accettazione integrale."
                : "Leggi il contratto completo prima di firmare. La firma implica l'accettazione integrale delle Condizioni Generali di Vendita."}
            </p>

            {alreadySigned ? (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center shadow-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg mx-auto mb-4">
                  <CheckCircle2 className="w-9 h-9 text-white" />
                </div>
                <h3 className="font-bold text-green-900 text-xl mb-1">Contratto firmato</h3>
                <p className="text-sm text-green-800 mb-4">
                  Firmato il {contract.client_signed_at ? new Date(contract.client_signed_at).toLocaleString('it-IT') : ''}
                </p>
                {contract.client_signature && (
                  <img src={contract.client_signature} alt="Firma" className="mx-auto max-h-24 bg-white border border-green-200 rounded-lg p-2 mb-4 shadow-sm" />
                )}
                <Button onClick={handleDownloadPdf} className="bg-green-700 hover:bg-green-800 shadow-md">
                  <Download className="w-4 h-4 mr-2" /> Scarica PDF firmato
                </Button>
              </div>
            ) : (
              <div className="space-y-4 bg-stone-50/50 rounded-2xl p-6 border border-stone-200/70">
                <h2 className="font-bold text-stone-900 flex items-center gap-2 text-lg">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
                    <PenLine className="w-4 h-4" />
                  </span>
                  Firma il documento
                </h2>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Nome e cognome del firmatario</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                    placeholder="Es. Mario Rossi"
                  />
                </div>

                <SignaturePad onChange={setSignature} />

                <label className="flex items-start gap-2 text-sm text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mt-1 accent-amber-600"
                  />
                  <span>
                    Dichiaro di aver letto, compreso e accettato integralmente le Condizioni Generali di Vendita
                    e di approvare specificamente, ai sensi degli artt. 1341 e 1342 c.c., le clausole relative a
                    pagamento, tempi non essenziali, garanzia, trasporto, riserva di proprietà, forza maggiore e foro competente.
                  </span>
                </label>

                <Button
                  onClick={handleSubmitSignature}
                  disabled={submitting || !signature || !accepted || !fullName.trim()}
                  className="w-full text-white py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
                  style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #ea580c 100%)' }}
                >
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Firma e scarica il PDF
                </Button>
                <p className="text-xs text-stone-500 text-center">
                  Dopo la firma il PDF firmato verrà scaricato automaticamente.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <img
              src="/lovable-uploads/vesuviano-logo-bianco.png"
              alt=""
              className="h-6 w-auto mx-auto opacity-40 mb-2 invert"
            />
            <p className="text-xs text-stone-500">
              Vesuviano Forni · UNITA 1 di Stanislao Elefante
            </p>
            <p className="text-[11px] text-stone-400">
              Via Piaia, 44 – 67034 Pettorano sul Gizio (AQ) · Italia
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

const FileSignatureIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-300"><path d="M20 19.5V6.4c0-.7-.4-1.4-1-1.7l-6.4-3.2c-.5-.3-1.2-.3-1.7 0L4.6 4.7c-.6.3-1 1-1 1.7v13.1c0 1.1.9 2 2 2h12.3c1.2 0 2.1-.9 2.1-2Z"/><path d="M8 12h4"/><path d="M8 16h6"/><path d="M14 3.5v3a1 1 0 0 0 1 1h3"/></svg>
);

export default PublicContractSign;
