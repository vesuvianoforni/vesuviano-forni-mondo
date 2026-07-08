import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Download, PenLine, CheckCircle2, FileText, Eye, EyeOff, Calendar, Truck, Shield, Wrench, CreditCard, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { generateContractPdf, type ContractVariableFields } from '@/components/erp/contractPdf';
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

  const buildPdfBlobUrl = async (c: Contract) => {
    const doc = await generateContractPdf({
      ...c,
      variable_fields: c.variable_fields || {},
    } as any);
    const blob = doc.output('blob');
    return URL.createObjectURL(blob);
  };

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

  return (
    <>
      <SEOHead title="Firma Contratto | Vesuviano Forni" description="Firma le Condizioni Generali di Vendita" lang="it" noIndex />
      <div className="min-h-screen bg-stone-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header brand */}
          <div className="bg-neutral-900 text-white rounded-t-xl p-6 flex items-center justify-between">
            <div>
              <div className="text-amber-400 font-bold text-lg tracking-wide">VESUVIANO FORNI</div>
              <div className="text-xs text-gray-400 mt-1">brand owned by UNITA 1 di Stanislao Elefante</div>
              <div className="text-xs text-gray-400">P.IVA IT02192040661 · PEC u1@pec.it</div>
            </div>
            <FileText className="w-10 h-10 text-amber-400" />
          </div>

          <div className="bg-white rounded-b-xl shadow-sm p-6 md:p-8 border border-t-0 border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Condizioni Generali di Vendita</h1>
            <p className="text-sm text-gray-600 mb-6">
              Rif. Offerta: <strong>{contract.offer_number || '—'}</strong> ·
              Cliente: <strong>{contract.client_name}</strong> ·
              Importo: <strong>{amountFmt}</strong>
            </p>

            {/* Summary */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-amber-900 mb-2">Riepilogo</h2>
              <ul className="text-sm text-amber-900/90 space-y-1">
                <li>• <strong>Cliente:</strong> {contract.client_name}</li>
                {contract.client_vat && <li>• <strong>P.IVA/CF:</strong> {contract.client_vat}</li>}
                {contract.destination && <li>• <strong>Destinazione:</strong> {contract.destination}</li>}
                <li>• <strong>Importo complessivo:</strong> {amountFmt}</li>
                <li>• <strong>Modalità di pagamento:</strong> {contract.payment_terms}</li>
                <li>• <strong>Garanzia:</strong> {contract.warranty_years} {contract.warranty_years === 1 ? 'anno' : 'anni'}</li>
              </ul>
            </div>

            <div className="mb-6">
              <Button variant="outline" onClick={handleDownloadPdf} className="border-amber-600 text-amber-800">
                <Download className="w-4 h-4 mr-2" /> Scarica il contratto completo (PDF)
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Leggi il PDF completo prima di firmare. La firma implica l'accettazione integrale delle Condizioni Generali di Vendita.
              </p>
            </div>

            {alreadySigned ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-900 text-lg mb-1">Contratto già firmato</h3>
                <p className="text-sm text-green-800 mb-4">
                  Firmato il {contract.client_signed_at ? new Date(contract.client_signed_at).toLocaleString('it-IT') : ''}
                </p>
                {contract.client_signature && (
                  <img src={contract.client_signature} alt="Firma" className="mx-auto max-h-24 bg-white border rounded p-2 mb-4" />
                )}
                <Button onClick={handleDownloadPdf} className="bg-green-700 hover:bg-green-800">
                  <Download className="w-4 h-4 mr-2" /> Scarica PDF firmato
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <PenLine className="w-5 h-5 text-amber-600" /> Firma
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome e cognome del firmatario</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Es. Mario Rossi"
                  />
                </div>

                <SignaturePad onChange={setSignature} />

                <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mt-1"
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
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-6 text-base"
                >
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Firma e scarica il PDF
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Dopo la firma il PDF firmato verrà scaricato automaticamente.
                </p>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Vesuviano Forni · UNITA 1 di Stanislao Elefante · Via Piaia, 44 – 67034 Pettorano sul Gizio (AQ)
          </p>
        </div>
      </div>
    </>
  );
};

export default PublicContractSign;
