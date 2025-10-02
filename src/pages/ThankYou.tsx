import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Home, Phone, Mail, Sparkles } from "lucide-react";

const ThankYou = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-vesuviano-50 flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full shadow-xl">
        <CardContent className="pt-12 pb-12 px-6 md:px-12 text-center">
          {/* Success Icon */}
          <div className="mb-8 flex justify-center">
            <div className="bg-green-100 rounded-full p-6 animate-pulse">
              <CheckCircle className="text-green-600 w-16 h-16" />
            </div>
          </div>

          {/* Main Title with emoji */}
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            🎉 Grazie per la Tua Richiesta! 🎉
          </h1>

          <p className="font-inter text-lg text-gray-600 mb-2">
            Abbiamo ricevuto la tua richiesta di consulenza gratuita
          </p>
          <p className="font-inter text-base text-gray-500 mb-8">
            <span className="inline-flex items-center">
              ✉️ Email di conferma inviata
            </span>
          </p>

          {/* Next Steps with visual icons */}
          <div className="bg-gradient-to-br from-vesuviano-50 to-fire-50 rounded-lg p-6 mb-8 text-left border-2 border-vesuviano-200">
            <h2 className="font-semibold text-lg mb-4 text-gray-900 flex items-center justify-center md:justify-start">
              <Sparkles className="mr-2 text-vesuviano-600" size={24} />
              Cosa Succede Ora:
            </h2>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start">
                <div className="bg-white rounded-full p-2 mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-2xl">📧</span>
                </div>
                <div>
                  <p className="font-semibold">Step 1</p>
                  <p className="text-sm">Riceverai un'email di conferma</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-white rounded-full p-2 mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-2xl">👨‍💼</span>
                </div>
                <div>
                  <p className="font-semibold">Step 2</p>
                  <p className="text-sm">Un nostro esperto ti contatterà entro 24h</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-white rounded-full p-2 mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-2xl">🔥</span>
                </div>
                <div>
                  <p className="font-semibold">Step 3</p>
                  <p className="text-sm">Discuteremo la soluzione perfetta per te</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-vesuviano-400 transition-colors">
              <Phone className="text-vesuviano-600 flex-shrink-0" size={24} />
              <div className="text-left">
                <p className="font-semibold text-sm">📞 Telefono</p>
                <p className="text-sm text-gray-600">+39 350 928 6941</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-vesuviano-400 transition-colors">
              <Mail className="text-vesuviano-600 flex-shrink-0" size={24} />
              <div className="text-left">
                <p className="font-semibold text-sm">✉️ Email</p>
                <p className="text-sm text-gray-600">info@vesuvianoforni.com</p>
              </div>
            </div>
          </div>

          {/* Back Home Button */}
          <Button 
            onClick={handleGoHome}
            size="lg"
            className="bg-vesuviano-600 hover:bg-vesuviano-700 text-white text-lg px-8 py-6 h-auto"
          >
            <Home className="mr-2" size={20} />
            Torna alla Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThankYou;
