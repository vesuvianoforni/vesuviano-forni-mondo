import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';

const ContattiRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const whatsapp = searchParams.get('whatsapp');
    
    if (whatsapp === 'true') {
      // Redirect to WhatsApp
      window.location.href = 'https://api.whatsapp.com/send?phone=393509286941&text=Ciao%20Vesuviano%20Forni%2C%20';
    } else {
      // Redirect to homepage contact section
      navigate('/#consultation');
    }
  }, [searchParams, navigate]);

  return (

    <>
      <SEOHead title="Contatti | Vesuviano" description="Reindirizzamento contatti Vesuviano." lang="it" noIndex />
      <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Reindirizzamento...</p>
      </div>
    </div>
    </>
  );
};

export default ContattiRedirect;
