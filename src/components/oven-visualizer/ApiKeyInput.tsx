
import React, { useState } from 'react';
import { Key, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
  isValid: boolean;
}

const ApiKeyInput = ({ onApiKeySet, isValid }: ApiKeyInputProps) => {
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
          Configurazione API Runware
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="api-key" className="text-sm font-medium text-blue-700">
              Chiave API Runware
            </Label>
            <div className="mt-2 relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Inserisci la tua chiave API Runware"
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
            Configura API
          </Button>
          
          <div className="text-xs text-blue-600 bg-blue-100 p-3 rounded-lg">
            <p className="font-medium mb-1">Come ottenere la chiave API:</p>
            <p>1. Vai su <a href="https://runware.ai/" target="_blank" rel="noopener noreferrer" className="underline">runware.ai</a></p>
            <p>2. Crea un account o accedi</p>
            <p>3. Trova la chiave API nella sezione "API Keys" del dashboard</p>
          </div>
          
          {isValid && (
            <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
              ✅ API configurata correttamente
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ApiKeyInput;
