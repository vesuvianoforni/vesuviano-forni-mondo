import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EditOvenModalProps {
  oven: any;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EditOvenModal = ({ oven, open, onClose, onUpdate }: EditOvenModalProps) => {
  const [formData, setFormData] = useState({
    model_name: oven.model_name,
    fuel_type: oven.fuel_type,
    diameter: oven.diameter,
    pizza_capacity: oven.pizza_capacity,
    base_price: oven.base_price,
    delivery_time_weeks: oven.delivery_time_weeks,
    image_url: oven.image_url,
    video_url_360: oven.video_url_360 || '',
    description: oven.description || '',
    is_active: oven.is_active,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('configurator_ovens')
        .update(formData)
        .eq('id', oven.id);

      if (error) throw error;

      toast.success('Forno aggiornato con successo');
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error('Errore durante l\'aggiornamento: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifica Forno</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Modello</Label>
              <Input value={formData.model_name} onChange={(e) => handleChange('model_name', e.target.value)} />
            </div>
            <div>
              <Label>Alimentazione</Label>
              <Input value={formData.fuel_type} onChange={(e) => handleChange('fuel_type', e.target.value)} />
            </div>
            <div>
              <Label>Diametro (cm)</Label>
              <Input type="number" value={formData.diameter} onChange={(e) => handleChange('diameter', parseInt(e.target.value))} />
            </div>
            <div>
              <Label>Capacità Pizze</Label>
              <Input value={formData.pizza_capacity} onChange={(e) => handleChange('pizza_capacity', e.target.value)} />
            </div>
            <div>
              <Label>Prezzo Base (€)</Label>
              <Input type="number" value={formData.base_price} onChange={(e) => handleChange('base_price', parseFloat(e.target.value))} />
            </div>
            <div>
              <Label>Tempo Consegna (settimane)</Label>
              <Input type="number" value={formData.delivery_time_weeks} onChange={(e) => handleChange('delivery_time_weeks', parseInt(e.target.value))} />
            </div>
          </div>
          <div>
            <Label>URL Immagine</Label>
            <Input value={formData.image_url} onChange={(e) => handleChange('image_url', e.target.value)} />
            {formData.image_url && (
              <div className="mt-2">
                <img src={formData.image_url} alt="Preview" className="w-32 h-32 object-cover rounded" />
              </div>
            )}
          </div>
          <div>
            <Label>URL Video 360°</Label>
            <Input 
              value={formData.video_url_360} 
              onChange={(e) => handleChange('video_url_360', e.target.value)}
              placeholder="/lovable-uploads/forno-360-video.mp4"
            />
          </div>
          <div>
            <Label>Descrizione</Label>
            <Textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="is_active">Attivo</Label>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? 'Salvataggio...' : 'Salva'}
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Annulla
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditOvenModal;
