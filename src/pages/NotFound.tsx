import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    // Set page title for SEO
    document.title = "Pagina non trovata - Vesuviano Forni";
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/lovable-uploads/vesuviano-logo-bianco.png" 
            alt="Vesuviano Forni" 
            className="w-20 h-20 mx-auto opacity-60"
          />
        </div>
        
        {/* 404 Title */}
        <h1 className="text-6xl font-bold text-stone-800 mb-4">404</h1>
        
        {/* Error Message */}
        <h2 className="text-2xl font-semibold text-stone-700 mb-3">
          Pagina non trovata
        </h2>
        <p className="text-stone-600 mb-8 leading-relaxed">
          La pagina che stai cercando non esiste o è stata spostata. 
          Torna alla homepage per scoprire i nostri forni artigianali napoletani.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => window.history.back()} 
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Torna indietro</span>
          </Button>
          
          <Button 
            onClick={() => window.location.href = "/"} 
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
          >
            <Home className="w-4 h-4" />
            <span>Homepage</span>
          </Button>
        </div>
        
        {/* Additional Info */}
        <div className="mt-12 text-sm text-stone-500">
          <p>© 2025 Vesuviano Forni - Tradizione artigianale dal 1950</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
