import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';

const AIChatWidget = lazy(() => import('@/components/chat/AIChatWidget'));
const ReadyToShipPopup = lazy(() => import('@/components/ReadyToShipPopup'));

const PublicEngagement = () => {
  const { pathname } = useLocation();

  // Keep conversion, administration and checkout screens free from promotional overlays.
  if (/^\/(erp|admin|configuratore|proforma|contratto)(\/|$)/.test(pathname) ||
      /^\/(success|appointments)(\/|$)/.test(pathname) ||
      /\/thank-you-(it|en|fr|de|es)$/.test(pathname)) return null;

  const isReadyToShip = /^\/(it\/pronta-consegna|en\/ready-to-ship|fr\/pret-a-expedier|es\/listo-para-enviar|de\/sofort-lieferbar)$/.test(pathname);

  return (
    <Suspense fallback={null}>
      <AIChatWidget />
      {!isReadyToShip && <ReadyToShipPopup />}
    </Suspense>
  );
};

export default PublicEngagement;