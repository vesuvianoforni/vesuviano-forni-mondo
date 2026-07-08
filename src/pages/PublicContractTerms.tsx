import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import {
  buildTermsSections,
  generateContractPdf,
  isPietraCalda,
  type ContractLanguage,
  type ContractVariableFields,
} from '@/components/erp/contractPdf';
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

const PublicContractTerms: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<{ title: string; body: string }[] | null>(null);
  const [buildingPdf, setBuildingPdf] = useState(false);
  const [uiLang, setUiLang] = useState<ContractLanguage>('fr');

  const isPietra = !!contract && isPietraCalda(contract);

  useEffect(() => {
    (async () => {
      if (!token) {
        setError('Token mancante');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('signature_token', token)
        .maybeSingle();
      if (error || !data) {
        setError('Contratto non trovato o link non valido');
      } else {
        const c = data as any;
        setContract(c);
        const defaultLang: ContractLanguage = isPietraCalda(c) ? 'fr' : (c.language as ContractLanguage) || 'it';
        setUiLang(defaultLang);
      }
      setLoading(false);
    })();
  }, [token]);

  useEffect(() => {
    if (!contract) return;
    (async () => {
      const secs = await buildTermsSections(contract, uiLang);
      setSections(secs);
    })();
  }, [contract, uiLang]);

  const handleDownloadPdf = async () => {
    if (!contract) return;
    setBuildingPdf(true);
    try {
      const doc = await generateContractPdf(contract, { termsOnly: true, language: uiLang });
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const filename = `CGV_${contract.client_name.replace(/\s+/g, '_')}${contract.offer_number ? `_${contract.offer_number}` : ''}.pdf`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e: any) {
      toast.error('Errore PDF: ' + e.message);
    } finally {
      setBuildingPdf(false);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Termini non disponibili</h1>
          <p className="text-gray-600">{error || 'Link non valido o scaduto.'}</p>
        </div>
      </div>
    );
  }

  const T =
    uiLang === 'fr'
      ? {
          pageTitle: 'Conditions Générales de Vente',
          back: 'Retour au document',
          download: 'Télécharger PDF',
          offerRef: 'Réf. offre',
          client: 'Client',
          amount: 'Montant',
          langLabel: 'Langue',
        }
      : {
          pageTitle: 'Condizioni Generali di Vendita',
          back: 'Torna al documento',
          download: 'Scarica PDF',
          offerRef: 'Rif. Offerta',
          client: 'Cliente',
          amount: 'Importo',
          langLabel: 'Lingua',
        };

  const amountFmt = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: contract.currency || 'EUR',
  }).format(contract.total_amount || 0);

  return (
    <>
      <SEOHead title={`${T.pageTitle} | Vesuviano Forni`} description={T.pageTitle} lang={uiLang} noIndex />
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
            <div
              className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-30 blur-3xl"
              style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
            />
            <div
              className="pointer-events-none absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-20 blur-3xl"
              style={{ background: 'radial-gradient(circle, #dc2626 0%, transparent 70%)' }}
            />
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
                  <span className="text-xs font-semibold tracking-widest uppercase text-amber-300">
                    {T.pageTitle}
                  </span>
                </div>
                {isPietra && (
                  <div className="inline-flex items-center gap-1 mt-2 rounded-full border border-amber-400/30 bg-black/30 backdrop-blur-sm p-0.5">
                    <button
                      type="button"
                      onClick={() => setUiLang('fr')}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors ${uiLang === 'fr' ? 'bg-amber-500 text-black' : 'text-amber-200 hover:text-amber-100'}`}
                    >
                      FR
                    </button>
                    <button
                      type="button"
                      onClick={() => setUiLang('it')}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors ${uiLang === 'it' ? 'bg-amber-500 text-black' : 'text-amber-200 hover:text-amber-100'}`}
                    >
                      IT
                    </button>
                  </div>
                )}
                <div className="text-[11px] text-stone-400 mt-2">UNITA 1 di Stanislao Elefante</div>
                <div className="text-[11px] text-stone-500">P.IVA IT02192040661 · PEC u1@pec.it</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-b-2xl shadow-xl p-6 md:p-10 border border-t-0 border-stone-200/70">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <Link
                to={`/contratto/${token}`}
                className="inline-flex items-center text-sm text-amber-700 hover:text-amber-900 underline"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {T.back}
              </Link>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={buildingPdf}
                className="inline-flex items-center text-sm font-medium px-4 py-2 rounded-lg border border-amber-700 text-amber-800 hover:bg-amber-50 disabled:opacity-50"
              >
                {buildingPdf ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {T.download}
              </button>
            </div>

            <div className="mb-8">
              <div className="text-[11px] uppercase tracking-[0.2em] text-amber-700 font-semibold mb-2">Vesuviano Forni</div>
              <h1
                className="text-3xl md:text-4xl font-bold text-stone-900 leading-tight tracking-tight"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                {T.pageTitle}
              </h1>
              <div className="mt-3 h-[3px] w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #b45309, #f59e0b)' }} />
              <p className="text-sm text-stone-600 mt-4">
                {T.offerRef}: <strong className="text-stone-900">{contract.offer_number || '—'}</strong> ·
                {' '}{T.client}: <strong className="text-stone-900">{contract.client_name}</strong> ·
                {' '}{T.amount}: <strong className="text-stone-900">{amountFmt}</strong>
              </p>
            </div>

            {sections === null ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              </div>
            ) : (
              <div className="space-y-8">
                {sections.map((sec, i) => (
                  <div key={i} className="border-b border-stone-100 last:border-0 pb-6 last:pb-0">
                    <h2 className="text-base font-bold text-stone-900 mb-2">{sec.title}</h2>
                    <div className="text-[13px] text-stone-700 leading-relaxed whitespace-pre-line">{sec.body}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-stone-200">
              <Link
                to={`/contratto/${token}`}
                className="inline-flex items-center text-sm text-amber-700 hover:text-amber-900 underline"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {T.back}
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <img
              src="/lovable-uploads/vesuviano-logo-bianco.png"
              alt=""
              className="h-6 w-auto mx-auto opacity-40 mb-2 invert"
            />
            <p className="text-xs text-stone-500">Vesuviano Forni · UNITA 1 di Stanislao Elefante</p>
            <p className="text-[11px] text-stone-400">Via Piaia, 44 – 67034 Pettorano sul Gizio (AQ) · Italia</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicContractTerms;
