
import React from 'react';
import { AlertCircle } from "lucide-react";

interface AlertNoticeProps {
  hasApiKey: boolean;
}

const AlertNotice = ({ hasApiKey }: AlertNoticeProps) => {
  if (hasApiKey) {
    return (
      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-800 text-sm md:text-base">
              AI Stability Attivato
            </h3>
            <p className="text-green-700 text-xs md:text-sm mt-1">
              L'integrazione AI è attiva e genererà visualizzazioni reali del forno nella tua cucina.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-yellow-800 text-sm md:text-base">
            Sistema AI Non Disponibile
          </h3>
          <p className="text-yellow-700 text-xs md:text-sm mt-1">
            Attualmente il sistema AI non è disponibile. Verrà utilizzata una simulazione di base.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlertNotice;
