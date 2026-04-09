import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ClarityPageView = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).clarity) {
      (window as any).clarity('set', 'pageUrl', location.pathname + location.search);
      (window as any).clarity('upgrade', 'spa-nav');
    }
  }, [location.pathname, location.search]);

  return null;
};

export default ClarityPageView;
