import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

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
    gas_price: oven.gas_price || 0,
    electric_price: oven.electric_price || 0,
    installation_price: oven.installation_price || 0,
    delivery_time_weeks: oven.delivery_time_weeks,
    image_url: oven.image_url,
    video_url_360: oven.video_url_360 || '',
    description: oven.description || '',
    is_active: oven.is_active,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState({ image: false, video: false });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadFile = async (file: File, type: 'image' | 'video') => {
    setUploading(true);
    try {
      const bucket = type === 'image' ? 'oven-gallery' : 'videos';
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (type === 'image') {
        handleChange('image_url', publicUrl);
      } else {
        handleChange('video_url_360', publicUrl);
      }

      toast.success(`${type === 'image' ? 'Immagine' : 'Video'} caricato con successo`);
    } catch (error: any) {
      toast.error('Errore durante il caricamento: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent, type: 'image' | 'video') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = async (e: React.DragEvent, type: 'image' | 'video') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      const isValidType = type === 'image' 
        ? file.type.startsWith('image/')
        : file.type.startsWith('video/');
      
      if (isValidType) {
        await uploadFile(file, type);
      } else {
        toast.error(`Seleziona un file ${type === 'image' ? 'immagine' : 'video'} valido`);
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = e.target.files;
    if (files && files[0]) {
      await uploadFile(files[0], type);
    }
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
              <Label>Prezzo Base - Legna (€)</Label>
              <Input type="number" value={formData.base_price} onChange={(e) => handleChange('base_price', parseFloat(e.target.value))} />
            </div>
            <div>
              <Label>Prezzo Gas (€)</Label>
              <Input type="number" value={formData.gas_price} onChange={(e) => handleChange('gas_price', parseFloat(e.target.value))} placeholder="0" />
            </div>
            <div>
              <Label>Prezzo Elettrico (€)</Label>
              <Input type="number" value={formData.electric_price} onChange={(e) => handleChange('electric_price', parseFloat(e.target.value))} placeholder="0" />
            </div>
            <div>
              <Label>Prezzo Montaggio sul Posto (€)</Label>
              <Input type="number" value={formData.installation_price} onChange={(e) => handleChange('installation_price', parseFloat(e.target.value))} placeholder="0" />
            </div>
            <div>
              <Label>Tempo Consegna (settimane)</Label>
              <Input type="number" value={formData.delivery_time_weeks} onChange={(e) => handleChange('delivery_time_weeks', parseInt(e.target.value))} />
            </div>
          </div>
          <div>
            <Label>Immagine Forno</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                dragActive.image ? 'border-vesuviano-500 bg-vesuviano-50' : 'border-stone-300 hover:border-vesuviano-400'
              }`}
              onDragEnter={(e) => handleDrag(e, 'image')}
              onDragLeave={(e) => handleDrag(e, 'image')}
              onDragOver={(e) => handleDrag(e, 'image')}
              onDrop={(e) => handleDrop(e, 'image')}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-stone-400" />
              <p className="text-sm text-stone-600 mb-2">Trascina un'immagine qui o</p>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileInput(e, 'image')}
                className="hidden"
                id="image-upload"
                disabled={uploading}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                disabled={uploading}
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                Seleziona file
              </Button>
            </div>
            <div className="mt-2">
              <Label>Oppure inserisci URL</Label>
              <Input value={formData.image_url} onChange={(e) => handleChange('image_url', e.target.value)} placeholder="https://..." />
            </div>
            {formData.image_url && (
              <div className="mt-2">
                <img src={formData.image_url} alt="Preview" className="w-32 h-32 object-cover rounded" />
              </div>
            )}
          </div>
          <div>
            <Label>Video 360° del Forno</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                dragActive.video ? 'border-vesuviano-500 bg-vesuviano-50' : 'border-stone-300 hover:border-vesuviano-400'
              }`}
              onDragEnter={(e) => handleDrag(e, 'video')}
              onDragLeave={(e) => handleDrag(e, 'video')}
              onDragOver={(e) => handleDrag(e, 'video')}
              onDrop={(e) => handleDrop(e, 'video')}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-stone-400" />
              <p className="text-sm text-stone-600 mb-2">Trascina un video qui o</p>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileInput(e, 'video')}
                className="hidden"
                id="video-upload"
                disabled={uploading}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                disabled={uploading}
                onClick={() => document.getElementById('video-upload')?.click()}
              >
                Seleziona file
              </Button>
            </div>
            <div className="mt-2">
              <Label>Oppure inserisci URL</Label>
              <Input 
                value={formData.video_url_360} 
                onChange={(e) => handleChange('video_url_360', e.target.value)}
                placeholder="/lovable-uploads/forno-360-video.mp4"
              />
            </div>
            {formData.video_url_360 && (
              <div className="mt-2">
                <video src={formData.video_url_360} className="w-full max-h-32 rounded" controls />
              </div>
            )}
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
