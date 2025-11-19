import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

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
    base_price_a: oven.base_price_a || oven.base_price || 0,
    base_price_b: oven.base_price_b || 0,
    base_price_c: oven.base_price_c || 0,
    gas_price_a: oven.gas_price_a || oven.gas_price || 0,
    gas_price_b: oven.gas_price_b || 0,
    gas_price_c: oven.gas_price_c || 0,
    electric_price_a: oven.electric_price_a || oven.electric_price || 0,
    electric_price_b: oven.electric_price_b || 0,
    electric_price_c: oven.electric_price_c || 0,
    installation_price_a: oven.installation_price_a || oven.installation_price || 0,
    installation_price_b: oven.installation_price_b || 0,
    installation_price_c: oven.installation_price_c || 0,
    delivery_time_weeks: oven.delivery_time_weeks,
    image_url: oven.image_url,
    additional_images: oven.additional_images || [],
    video_url_360: oven.video_url_360 || '',
    description: oven.description || '',
    is_active: oven.is_active,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState({ image: false, video: false, gallery: false });

  useEffect(() => {
    if (open && oven) {
      setFormData({
        model_name: oven.model_name,
        fuel_type: oven.fuel_type,
        diameter: oven.diameter,
        pizza_capacity: oven.pizza_capacity,
        base_price_a: oven.base_price_a || oven.base_price || 0,
        base_price_b: oven.base_price_b || 0,
        base_price_c: oven.base_price_c || 0,
        gas_price_a: oven.gas_price_a || oven.gas_price || 0,
        gas_price_b: oven.gas_price_b || 0,
        gas_price_c: oven.gas_price_c || 0,
        electric_price_a: oven.electric_price_a || oven.electric_price || 0,
        electric_price_b: oven.electric_price_b || 0,
        electric_price_c: oven.electric_price_c || 0,
        installation_price_a: oven.installation_price_a || oven.installation_price || 0,
        installation_price_b: oven.installation_price_b || 0,
        installation_price_c: oven.installation_price_c || 0,
        delivery_time_weeks: oven.delivery_time_weeks,
        image_url: oven.image_url,
        additional_images: oven.additional_images || [],
        video_url_360: oven.video_url_360 || '',
        description: oven.description || '',
        is_active: oven.is_active,
      });
    }
  }, [open, oven]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadFile = async (file: File, type: 'image' | 'video' | 'gallery') => {
    setUploading(true);
    try {
      const bucket = type === 'video' ? 'videos' : 'oven-gallery';
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
      } else if (type === 'video') {
        handleChange('video_url_360', publicUrl);
      } else if (type === 'gallery') {
        handleChange('additional_images', [...formData.additional_images, publicUrl]);
      }

      toast.success(`${type === 'video' ? 'Video' : 'Immagine'} caricato con successo`);
    } catch (error: any) {
      toast.error('Errore durante il caricamento: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeAdditionalImage = (index: number) => {
    const newImages = formData.additional_images.filter((_, i) => i !== index);
    handleChange('additional_images', newImages);
  };

  const handleDrag = (e: React.DragEvent, type: 'image' | 'video' | 'gallery') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = async (e: React.DragEvent, type: 'image' | 'video' | 'gallery') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));

    const files = e.dataTransfer.files;
    if (type === 'gallery' && files.length > 0) {
      // Handle multiple files for gallery
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          await uploadFile(file, 'gallery');
        }
      }
    } else if (files && files[0]) {
      const file = files[0];
      const isValidType = type === 'video' 
        ? file.type.startsWith('video/')
        : file.type.startsWith('image/');
      
      if (isValidType) {
        await uploadFile(file, type);
      } else {
        toast.error(`Seleziona un file ${type === 'video' ? 'video' : 'immagine'} valido`);
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'gallery') => {
    const files = e.target.files;
    if (type === 'gallery' && files && files.length > 0) {
      // Handle multiple files for gallery
      for (let i = 0; i < files.length; i++) {
        await uploadFile(files[i], 'gallery');
      }
    } else if (files && files[0]) {
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
      toast.error('Errore durante il salvataggio: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifica Forno</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nome Modello</Label>
              <Input
                value={formData.model_name}
                onChange={(e) => handleChange('model_name', e.target.value)}
              />
            </div>
            <div>
              <Label>Tipo Combustibile</Label>
              <Input
                value={formData.fuel_type}
                onChange={(e) => handleChange('fuel_type', e.target.value)}
              />
            </div>
            <div>
              <Label>Diametro (cm)</Label>
              <Input
                type="number"
                value={formData.diameter}
                onChange={(e) => handleChange('diameter', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label>Capacità Pizze</Label>
              <Input
                value={formData.pizza_capacity}
                onChange={(e) => handleChange('pizza_capacity', e.target.value)}
              />
            </div>
            <div>
              <Label>Tempo Consegna (settimane)</Label>
              <Input
                type="number"
                value={formData.delivery_time_weeks}
                onChange={(e) => handleChange('delivery_time_weeks', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label>Descrizione</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Listino A */}
          <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
            <h3 className="font-semibold">Listino A</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prezzo Base (€)</Label>
                <Input
                  type="number"
                  value={formData.base_price_a}
                  onChange={(e) => handleChange('base_price_a', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label>Prezzo Gas (€)</Label>
                <Input
                  type="number"
                  value={formData.gas_price_a}
                  onChange={(e) => handleChange('gas_price_a', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label>Prezzo Elettrico (€)</Label>
                <Input
                  type="number"
                  value={formData.electric_price_a}
                  onChange={(e) => handleChange('electric_price_a', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label>Prezzo Montaggio sul Posto (€)</Label>
                <Input
                  type="number"
                  value={formData.installation_price_a}
                  onChange={(e) => handleChange('installation_price_a', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Listino B */}
          <div className="space-y-4 p-4 border rounded-lg bg-green-50/50">
            <h3 className="font-semibold">Listino B</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prezzo Base (€)</Label>
                <Input
                  type="number"
                  value={formData.base_price_b}
                  onChange={(e) => handleChange('base_price_b', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label>Prezzo Gas (€)</Label>
                <Input
                  type="number"
                  value={formData.gas_price_b}
                  onChange={(e) => handleChange('gas_price_b', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label>Prezzo Elettrico (€)</Label>
                <Input
                  type="number"
                  value={formData.electric_price_b}
                  onChange={(e) => handleChange('electric_price_b', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label>Prezzo Montaggio sul Posto (€)</Label>
                <Input
                  type="number"
                  value={formData.installation_price_b}
                  onChange={(e) => handleChange('installation_price_b', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Listino C */}
          <div className="space-y-4 p-4 border rounded-lg bg-purple-50/50">
            <h3 className="font-semibold">Listino C</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prezzo Base (€)</Label>
                <Input
                  type="number"
                  value={formData.base_price_c}
                  onChange={(e) => handleChange('base_price_c', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label>Prezzo Gas (€)</Label>
                <Input
                  type="number"
                  value={formData.gas_price_c}
                  onChange={(e) => handleChange('gas_price_c', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label>Prezzo Elettrico (€)</Label>
                <Input
                  type="number"
                  value={formData.electric_price_c}
                  onChange={(e) => handleChange('electric_price_c', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label>Prezzo Montaggio sul Posto (€)</Label>
                <Input
                  type="number"
                  value={formData.installation_price_c}
                  onChange={(e) => handleChange('installation_price_c', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label>Immagine Forno</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center ${
                dragActive.image ? 'border-primary bg-primary/10' : 'border-border'
              }`}
              onDragEnter={(e) => handleDrag(e, 'image')}
              onDragLeave={(e) => handleDrag(e, 'image')}
              onDragOver={(e) => handleDrag(e, 'image')}
              onDrop={(e) => handleDrop(e, 'image')}
            >
              {formData.image_url ? (
                <div>
                  <img src={formData.image_url} alt="Preview" className="max-h-48 mx-auto mb-4 rounded" />
                  <Input
                    value={formData.image_url}
                    onChange={(e) => handleChange('image_url', e.target.value)}
                    className="mb-2"
                  />
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <Upload className="w-12 h-12 mx-auto mb-2" />
                  <p>Trascina un'immagine o</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileInput(e, 'image')}
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                {uploading ? 'Caricamento...' : 'Seleziona Immagine'}
              </Button>
            </div>
          </div>

          {/* Video Upload */}
          <div>
            <Label>Video 360° (opzionale)</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center ${
                dragActive.video ? 'border-primary bg-primary/10' : 'border-border'
              }`}
              onDragEnter={(e) => handleDrag(e, 'video')}
              onDragLeave={(e) => handleDrag(e, 'video')}
              onDragOver={(e) => handleDrag(e, 'video')}
              onDrop={(e) => handleDrop(e, 'video')}
            >
              {formData.video_url_360 ? (
                <div>
                  <video src={formData.video_url_360} controls className="max-h-48 mx-auto mb-4 rounded" />
                  <Input
                    value={formData.video_url_360}
                    onChange={(e) => handleChange('video_url_360', e.target.value)}
                    className="mb-2"
                  />
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <Upload className="w-12 h-12 mx-auto mb-2" />
                  <p>Trascina un video o</p>
                </div>
              )}
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileInput(e, 'video')}
                className="hidden"
                id="video-upload"
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => document.getElementById('video-upload')?.click()}
              >
                {uploading ? 'Caricamento...' : 'Seleziona Video'}
              </Button>
            </div>
          </div>

          {/* Additional Images Gallery */}
          <div>
            <Label>Galleria Immagini Aggiuntive (opzionale)</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center ${
                dragActive.gallery ? 'border-primary bg-primary/10' : 'border-border'
              }`}
              onDragEnter={(e) => handleDrag(e, 'gallery')}
              onDragLeave={(e) => handleDrag(e, 'gallery')}
              onDragOver={(e) => handleDrag(e, 'gallery')}
              onDrop={(e) => handleDrop(e, 'gallery')}
            >
              {formData.additional_images.length > 0 ? (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {formData.additional_images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-32 object-cover rounded" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeAdditionalImage(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground mb-4">
                  <Upload className="w-12 h-12 mx-auto mb-2" />
                  <p>Trascina immagini multiple o</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileInput(e, 'gallery')}
                className="hidden"
                id="gallery-upload"
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => document.getElementById('gallery-upload')?.click()}
              >
                {uploading ? 'Caricamento...' : 'Aggiungi Immagini'}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {saving ? 'Salvataggio...' : 'Salva Modifiche'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditOvenModal;
