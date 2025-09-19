
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface OvenType {
  value: string;
  label: string;
  image: string;
  modelKey: string;
}

interface OvenTypeSelectorProps {
  ovenTypes: OvenType[];
  selectedOvenType: string;
  onOvenTypeChange: (value: string) => void;
}

const OvenTypeSelector = ({ ovenTypes, selectedOvenType, onOvenTypeChange }: OvenTypeSelectorProps) => {
  const { t } = useTranslation();
  const selectedOvenData = ovenTypes.find(oven => oven.value === selectedOvenType);

  return (
    <div>
      <Label htmlFor="oven-type" className="text-sm font-medium text-stone-700">
        {t('ovenVisualizer.ovenTypeSelector.label')}
      </Label>
      <Select value={selectedOvenType} onValueChange={onOvenTypeChange}>
        <SelectTrigger className="mt-2">
          <SelectValue placeholder={t('ovenVisualizer.ovenTypeSelector.placeholder')} />
        </SelectTrigger>
        <SelectContent>
          {ovenTypes.map((oven) => (
            <SelectItem key={oven.value} value={oven.value}>
              {oven.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedOvenData && (
        <div className="mt-3 md:mt-4 p-3 md:p-4 bg-white rounded-lg border border-stone-200">
          <p className="text-xs md:text-sm font-medium text-stone-700 mb-2">{t('ovenVisualizer.ovenTypeSelector.previewLabel')}</p>
          <img 
            src={selectedOvenData.image} 
            alt={selectedOvenData.label}
            className="w-full h-24 md:h-32 object-contain rounded-lg"
          />
          <p className="text-xs text-stone-500 mt-2 text-center">{selectedOvenData.label}</p>
        </div>
      )}
    </div>
  );
};

export default OvenTypeSelector;
