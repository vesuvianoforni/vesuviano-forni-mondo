
import React from 'react';
import { AlertCircle, Smartphone } from "lucide-react";

interface AlertNoticeProps {
  hasApiKey: boolean;
}

const AlertNotice = ({ hasApiKey }: AlertNoticeProps) => {
  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-800 text-sm md:text-base">
            Tecnologia AR Attivata
          </h3>
          <p className="text-blue-700 text-xs md:text-sm mt-1">
            Sistema di Realtà Aumentata pronto. Posiziona il forno direttamente nel tuo ambiente usando la fotocamera del dispositivo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlertNotice;
