
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Smartphone } from "lucide-react";

interface AlertNoticeProps {
  hasApiKey: boolean;
}

const AlertNotice = ({ hasApiKey }: AlertNoticeProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-800 text-sm md:text-base">
            {t('ovenVisualizer.alerts.arTechActivated')}
          </h3>
          <p className="text-blue-700 text-xs md:text-sm mt-1">
            {t('ovenVisualizer.alerts.arDescription')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlertNotice;
