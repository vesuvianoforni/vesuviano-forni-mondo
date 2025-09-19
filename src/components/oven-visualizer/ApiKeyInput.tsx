
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Key, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card,CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
  isValid: boolean;
}

const ApiKeyInput = ({ onApiKeySet, isValid }: ApiKeyInputProps) => {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState<string>("");
  const [showKey, setShowKey] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('runware_api_key', apiKey.trim());
      onApiKeySet(apiKey.trim());
    }
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
          <Key className="w-5 h-5" />
          {t('ovenVisualizer.apiConfig.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="api-key" className="text-sm font-medium text-blue-700">
              {t('ovenVisualizer.apiConfig.label')}
            </Label>
            <div className="mt-2 relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={t('ovenVisualizer.apiConfig.placeholder')}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={!apiKey.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {t('ovenVisualizer.apiConfig.configButton')}
          </Button>
          
          <div className="text-xs text-blue-600 bg-blue-100 p-3 rounded-lg">
            <p className="font-medium mb-1">{t('ovenVisualizer.apiConfig.howToGet')}</p>
            <p>1. {t('ovenVisualizer.apiConfig.step1')}</p>
            <p>2. {t('ovenVisualizer.apiConfig.step2')}</p>
            <p>3. {t('ovenVisualizer.apiConfig.step3')}</p>
          </div>
          
          {isValid && (
            <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
              ✅ {t('ovenVisualizer.apiConfig.configured')}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ApiKeyInput;
