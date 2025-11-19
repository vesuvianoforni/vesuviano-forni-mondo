import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

interface EditOvenModalProps {
  oven: any;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

interface Coating {
  type: string;
  name: string;
  image_url: string;
}

const EditOvenModal = ({ oven, open, onClose, onUpdate }: EditOvenModalProps) => {
  const [formData, setFormData] = useState({
    model_name: oven.model_name,
    fuel_type: Array.isArray(oven.fuel_type) ? oven.fuel_type : [oven.fuel_type],
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
    coatings: (oven.coatings || []) as Coating[],
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newCoating, setNewCoating] = useState({ type: '', name: '', image_url: '' });
  const [uploadingCoating, setUploadingCoating] = useState(false);

  useEffect(() => {
    if (open && oven) {
      setFormData({
        model_name: oven.model_name,
        fuel_type: Array.isArray(oven.fuel_type) ? oven.fuel_type : [oven.fuel_type],
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
        coatings: (oven.coatings || []) as Coating[],
      });
    }
  }, [open, oven]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFuelTypeToggle = (fuel: string) => {
    const current = formData.fuel_type;
    if (current.includes(fuel)) {
      handleChange('fuel_type', current.filter(f => f !== fuel));
    } else {
      handleChange('fuel_type', [...current, fuel]);
    }
  };

  const uploadFile = async (file: File, type: 'image' | 'video' | 'gallery' | 'coating') => {
    if (type === 'coating') setUploadingCoating(true);
    else setUploading(true);
    
    try {
      const bucket = type === 'video' ? 'videos' : 'oven-gallery';
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (type === 'image') {
        handleChange('image_url', publicUrl);
        toast.success('Immagine caricata!');
      } else if (type === 'video') {
        handleChange('video_url_360', publicUrl);
        toast.success('Video caricato!');
      } else if (type === 'gallery') {
        handleChange('additional_images', [...formData.additional_images, publicUrl]);
        toast.success('Immagine aggiunta alla galleria!');
      } else if (type === 'coating') {
        return publicUrl;
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Errore durante il caricamento');
      throw error;
    } finally {
      if (type === 'coating') setUploadingCoating(false);
      else setUploading(false);
    }
  };

  const handleCoatingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const url = await uploadFile(file, 'coating');
      setNewCoating(prev => ({ ...prev, image_url: url as string }));
    } catch (error) {
      console.error('Coating image upload error:', error);
    }
  };

  const addCoating = () => {
    if (!newCoating.type || !newCoating.name || !newCoating.image_url) {
      toast.error('Compila tutti i campi del rivestimento');
      return;
    }
    handleChange('coatings', [...formData.coatings, newCoating]);
    setNewCoating({ type: '', name: '', image_url: '' });
    toast.success('Rivestimento aggiunto!');
  };

  const removeCoating = (index: number) => {
    handleChange('coatings', formData.coatings.filter((_, i) => i !== index));
  };

  const removeAdditionalImage = (index: number) => {
    handleChange('additional_images', formData.additional_images.filter((_, i) => i !== index));
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'gallery') => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (type === 'gallery') {
        for (let i = 0; i < files.length; i++) {
          await uploadFile(files[i], type);
        }
      } else {
        await uploadFile(files[0], type);
      }
    }
  };

  const handleSave = async () => {
    if (formData.fuel_type.length === 0) {
      toast.error('Seleziona almeno un tipo di alimentazione');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('configurator_ovens')
        .update(formData)
        .eq('id', oven.id);

      if (error) throw error;

      toast.success('Forno aggiornato!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Errore durante il salvataggio');
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nome Modello</Label>
              <Input value={formData.model_name} onChange={(e) => handleChange('model_name', e.target.value)} />
            </div>
            <div>
              <Label>Diametro (cm)</Label>
              <Input type="number" value={formData.diameter} onChange={(e) => handleChange('diameter', parseInt(e.target.value))} />
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Tipi di Alimentazione</Label>
            <div className="flex gap-4">
              {['legna', 'gas', 'elettrico'].map(fuel => (
                <div key={fuel} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`fuel-${fuel}`}
                    checked={formData.fuel_type.includes(fuel)}
                    onCheckedChange={() => handleFuelTypeToggle(fuel)}
                  />
                  <label htmlFor={`fuel-${fuel}`} className="capitalize cursor-pointer">{fuel}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Capacità Pizza</Label>
            <Input value={formData.pizza_capacity} onChange={(e) => handleChange('pizza_capacity', e.target.value)} />
          </div>

          <div>
            <Label>Descrizione</Label>
            <Textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
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

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Rivestimenti</h3>
            
            {formData.coatings.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-4">
                {formData.coatings.map((coating, index) => (
                  <div key={index} className="relative border rounded-lg p-2">
                    <Button variant="destructive" size="sm" className="absolute -top-2 -right-2 h-6 w-6 p-0" onClick={() => removeCoating(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                    <img src={coating.image_url} alt={coating.name} className="w-full h-24 object-cover rounded" />
                    <p className="text-xs font-semibold mt-1">{coating.name}</p>
                    <p className="text-xs text-gray-500">{coating.type}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-semibold mb-3">Aggiungi Rivestimento</h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Label className="text-xs">Tipo</Label>
                  <Input placeholder="es. Mosaico" value={newCoating.type} onChange={(e) => setNewCoating(prev => ({ ...prev, type: e.target.value }))} className="h-8" />
                </div>
                <div>
                  <Label className="text-xs">Nome</Label>
                  <Input placeholder="es. Blu Mare" value={newCoating.name} onChange={(e) => setNewCoating(prev => ({ ...prev, name: e.target.value }))} className="h-8" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Immagine</Label>
                {newCoating.image_url ? (
                  <div className="flex items-center gap-2">
                    <img src={newCoating.image_url} alt="Preview" className="w-16 h-16 object-cover rounded" />
                    <Button variant="outline" size="sm" onClick={() => setNewCoating(prev => ({ ...prev, image_url: '' }))}>Cambia</Button>
                  </div>
                ) : (
                  <div>
                    <input type="file" accept="image/*" onChange={handleCoatingImageUpload} className="hidden" id="coating-image-upload" />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('coating-image-upload')?.click()} disabled={uploadingCoating}>
                      {uploadingCoating ? 'Caricamento...' : 'Carica Immagine'}
                    </Button>
                  </div>
                )}
              </div>
              <Button onClick={addCoating} size="sm" className="mt-3 w-full" disabled={!newCoating.type || !newCoating.name || !newCoating.image_url}>
                Aggiungi Rivestimento
              </Button>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label>Immagine Forno</Label>
            <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center border-border">
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
            <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center border-border">
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
            <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center border-border">
              {formData.additional_images.length > 0 ? (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {formData.additional_images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img src={url} alt={`Anteprima ${index + 1}`} className="max-h-24 mx-auto rounded" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                        onClick={() => removeAdditionalImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <Upload className="w-12 h-12 mx-auto mb-2" />
                  <p>Trascina immagini aggiuntive o</p>
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
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button onClick={handleSave} disabled={saving || formData.fuel_type.length === 0}>
            {saving ? 'Salvataggio...' : 'Salva'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditOvenModal;
