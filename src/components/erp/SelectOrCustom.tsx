import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, ListChecks, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Preset {
  id?: string;
  value: string;
  label: string;
}

interface Props {
  fieldKey: string;
  value: string;
  onChange: (v: string) => void;
  presets: Preset[];
  type?: 'text' | 'textarea' | 'date' | 'number';
  onPresetAdded?: (p: Preset) => void;
  placeholder?: string;
}

const CUSTOM = '__custom__';

const SelectOrCustom: React.FC<Props> = ({ fieldKey, value, onChange, presets, type = 'text', onPresetAdded, placeholder }) => {
  const matchesPreset = presets.some(p => p.value === value);
  const [mode, setMode] = useState<'select' | 'custom'>(!value || matchesPreset ? 'select' : 'custom');

  useEffect(() => {
    if (value && !matchesPreset && mode === 'select') setMode('custom');
  }, [value, matchesPreset, mode]);

  const saveAsPreset = async () => {
    if (!value.trim()) { toast.error('Nessun valore da salvare'); return; }
    if (presets.some(p => p.value === value.trim())) { toast.info('Già presente nei preset'); return; }
    const label = value.trim().length > 40 ? value.trim().slice(0, 40) + '…' : value.trim();
    const { data, error } = await supabase.from('contract_field_presets').insert({
      field_key: fieldKey, value: value.trim(), label, sort_order: 99,
    }).select().maybeSingle();
    if (error) { toast.error('Errore salvataggio preset: ' + error.message); return; }
    toast.success('Preset salvato');
    if (data && onPresetAdded) onPresetAdded({ id: data.id, value: data.value, label: data.label });
  };

  if (mode === 'custom' || presets.length === 0) {
    return (
      <div className="flex gap-1">
        {type === 'textarea' ? (
          <Textarea value={value} onChange={e => onChange(e.target.value)} rows={2} placeholder={placeholder}
            className="bg-[#111] border-amber-900/30 text-sm flex-1" />
        ) : (
          <Input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className="bg-[#111] border-amber-900/30 flex-1" />
        )}
        <div className="flex flex-col gap-1">
          {presets.length > 0 && (
            <Button type="button" size="icon" variant="ghost" onClick={() => setMode('select')}
              title="Torna ai preset" className="h-8 w-8 text-amber-400">
              <ListChecks className="w-3.5 h-3.5" />
            </Button>
          )}
          {value.trim() && !matchesPreset && (
            <Button type="button" size="icon" variant="ghost" onClick={saveAsPreset}
              title="Salva come preset riutilizzabile" className="h-8 w-8 text-green-400">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      <Select value={matchesPreset ? value : ''} onValueChange={(v) => {
        if (v === CUSTOM) { setMode('custom'); return; }
        onChange(v);
      }}>
        <SelectTrigger className="bg-[#111] border-amber-900/30 flex-1">
          <SelectValue placeholder={placeholder || 'Seleziona…'} />
        </SelectTrigger>
        <SelectContent>
          {presets.map(p => (
            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
          ))}
          <SelectItem value={CUSTOM}>✏️ Personalizzato…</SelectItem>
        </SelectContent>
      </Select>
      <Button type="button" size="icon" variant="ghost" onClick={() => setMode('custom')}
        title="Inserisci valore personalizzato" className="h-8 w-8 text-amber-400">
        <Pencil className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};

export default SelectOrCustom;
