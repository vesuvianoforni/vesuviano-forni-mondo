
import React from 'react';
import { AlertCircle } from "lucide-react";

const AlertNotice = () => {
  return (
    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-yellow-800 text-sm md:text-base">
            Funzionalità in Sviluppo
          </h3>
          <p className="text-yellow-700 text-xs md:text-sm mt-1">
            Attualmente questa è una simulazione. Per implementare l'AI reale di generazione immagini, 
            è necessario integrare servizi come Runware AI o Stability AI.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlertNotice;
