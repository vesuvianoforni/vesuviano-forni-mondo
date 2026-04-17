import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";

const ConsultationForm = lazy(() => import("@/components/ConsultationForm"));

/**
 * Routes (or path prefixes) where this pre-footer form must NOT appear:
 *  - private / admin routes
 *  - flow-specific routes (configurator, proforma, payment, booking, thank-you)
 *  - pages that already render <ConsultationForm /> in-page
 *
 * Everything else (homepage, blog, useful info, ready-to-ship, etc.) will
 * receive the form right above the footer.
 */
const HIDE_PATTERNS: RegExp[] = [
  /^\/erp(\/|$)/i,
  /^\/admin(\/|$)/i,
  /^\/configuratore(\/|$)/i,
  /^\/proforma(\/|$)/i,
  /^\/success(\/|$)/i,
  /\/thank-you/i,
  /^\/book-a-slot-call(\/|$)/i,
  /^\/appointments(\/|$)/i,
  /^\/built-on-place(\/|$)/i,
  // Product pages already render <ConsultationForm /> inline:
  /\/(forni-tradizionali|traditional-ovens|fours-traditionnels|hornos-tradicionales|traditionelle-oefen)(\/|$)/i,
  /\/(forni-gas|gas-ovens|fours-gaz|hornos-gas|gasoefen)(\/|$)/i,
  /\/(forni-elettrici|electric-ovens|fours-electriques|hornos-electricos|elektrooefen)(\/|$)/i,
  /\/(forni-rotanti|rotating-ovens|fours-rotatifs|hornos-rotativos|drehoefen)(\/|$)/i,
  /\/(sistema-vesuviobuono|vesuviobuono-system|systeme-vesuviobuono)(\/|$)/i,
  /\/(chi-siamo|about-us|qui-sommes-nous|quienes-somos|ueber-uns)(\/|$)/i,
  /\/(bruciatori|burners|bruleurs|quemadores|brenner)(\/|$)/i,
  /\/(depuratore-fumi|wood-smoke-purifier|purificateur-fumee|purificador-humo|rauchfilter)(\/|$)/i,
];

const PreFooterConsultation = () => {
  const { pathname } = useLocation();

  if (HIDE_PATTERNS.some((re) => re.test(pathname))) return null;

  return (
    <Suspense fallback={null}>
      <ConsultationForm />
    </Suspense>
  );
};

export default PreFooterConsultation;
