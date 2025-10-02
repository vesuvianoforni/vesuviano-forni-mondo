import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Home, Phone, Mail } from "lucide-react";

interface ThankYouProps {
  lang: string;
}

const ThankYou = ({ lang }: ThankYouProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  const handleGoHome = () => {
    navigate(`/${lang}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-vesuviano-50 flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-12 px-6 md:px-12 text-center">
          <div className="mb-8 flex justify-center">
            <div className="bg-green-100 rounded-full p-6">
              <CheckCircle className="text-green-600 w-16 h-16" />
            </div>
          </div>

          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('thankYou.title')}
          </h1>

          <p className="font-inter text-lg text-gray-600 mb-6">
            {t('thankYou.subtitle')}
          </p>

          <div className="bg-vesuviano-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-lg mb-4 text-gray-900">
              {t('thankYou.nextSteps')}
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="text-vesuviano-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
                <span>{t('thankYou.step1')}</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-vesuviano-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
                <span>{t('thankYou.step2')}</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-vesuviano-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
                <span>{t('thankYou.step3')}</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg border">
              <Phone className="text-vesuviano-600 flex-shrink-0" size={24} />
              <div className="text-left">
                <p className="font-semibold text-sm">{t('thankYou.phone')}</p>
                <p className="text-sm text-gray-600">+39 350 928 6941</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg border">
              <Mail className="text-vesuviano-600 flex-shrink-0" size={24} />
              <div className="text-left">
                <p className="font-semibold text-sm">{t('thankYou.email')}</p>
                <p className="text-sm text-gray-600">info@vesuvianoforni.com</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGoHome}
            size="lg"
            className="bg-vesuviano-600 hover:bg-vesuviano-700 text-white"
          >
            <Home className="mr-2" size={20} />
            {t('thankYou.backHome')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThankYou;
