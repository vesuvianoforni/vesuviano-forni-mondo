import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface AddOvenModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddOvenModal = ({ open, onClose, onSuccess }: AddOvenModalProps) => {
  const [formData, setFormData] = useState({
    model_name: "",
    fuel_type: [] as string[],
    diameter: 0,
    pizza_capacity: "",
    description: "",
    base_price_a: 0,
    base_price_b: 0,
    base_price_c: 0,
    gas_price_a: 0,
    gas_price_b: 0,
    gas_price_c: 0,
    electric_price_a: 0,
    electric_price_b: 0,
    electric_price_c: 0,
    installation_price_a: 0,
    installation_price_b: 0,
    installation_price_c: 0,
    delivery_time_weeks: 4,
    image_url: "",
    additional_images: [] as string[],
    video_url_360: "",
    coatings: [] as Array<{type: string; name: string; image_url: string}>
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingCoating, setUploadingCoating] = useState(false);
  const [newCoating, setNewCoating] = useState({ type: '', name: '', image_url: '' });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadFile(file, 'oven-gallery');
      handleChange('image_url', url);
      toast.success("Immagine caricata!");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Errore nel caricamento dell'immagine");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadFile(file, 'oven-gallery'));
      const urls = await Promise.all(uploadPromises);
      handleChange('additional_images', [...formData.additional_images, ...urls]);
      toast.success(`${files.length} immagini caricate!`);
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      toast.error("Errore nel caricamento delle immagini");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeAdditionalImage = (index: number) => {
    const newImages = formData.additional_images.filter((_, i) => i !== index);
    handleChange('additional_images', newImages);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const url = await uploadFile(file, 'videos');
      handleChange('video_url_360', url);
      toast.success("Video caricato!");
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error("Errore nel caricamento del video");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleCoatingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCoating(true);
    try {
      const url = await uploadFile(file, 'oven-gallery');
      setNewCoating(prev => ({ ...prev, image_url: url }));
      toast.success("Immagine rivestimento caricata!");
    } catch (error) {
      console.error('Error uploading coating image:', error);
      toast.error("Errore nel caricamento dell'immagine");
    } finally {
      setUploadingCoating(false);
    }
  };

  const addCoating = () => {
    if (!newCoating.type || !newCoating.name || !newCoating.image_url) {
      toast.error('Compila tutti i campi del rivestimento');
      return;
    }
    
    handleChange('coatings', [...formData.coatings, newCoating]);
    setNewCoating({ type: '', name: '', image_url: '' });
    toast.success('Rivestimento aggiunto');
  };

  const removeCoating = (index: number) => {
    const newCoatings = formData.coatings.filter((_, i) => i !== index);
    handleChange('coatings', newCoatings);
  };

  const toggleFuelType = (fuel: string) => {
    const current = formData.fuel_type;
    if (current.includes(fuel)) {
      handleChange('fuel_type', current.filter(f => f !== fuel));
    } else {
      handleChange('fuel_type', [...current, fuel]);
    }
  };

  const handleSave = async () => {
    if (!formData.model_name || formData.fuel_type.length === 0 || !formData.image_url) {
      toast.error("Compila tutti i campi obbligatori (nome, almeno un tipo combustibile, immagine)");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('configurator_ovens')
        .insert([{
          ...formData,
          coatings: formData.coatings as any
        }]);

      if (error) throw error;

      toast.success("Forno aggiunto con successo!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding oven:', error);
      toast.error("Errore nell'aggiunta del forno");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aggiungi Nuovo Forno</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Informazioni Base *</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome Modello *</label>
                <input
                  type="text"
                  value={formData.model_name}
                  onChange={(e) => handleChange('model_name', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo Combustibile * (seleziona uno o più)</label>
                <div className="space-y-2 mt-1 px-3 py-2 border rounded-md">
                  {['legna', 'gas', 'elettrico', 'rotativo'].map((fuel) => (
                    <label key={fuel} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.fuel_type.includes(fuel)}
                        onChange={() => toggleFuelType(fuel)}
                        className="rounded"
                      />
                      <span className="capitalize">{fuel}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Diametro (cm)</label>
                <input
                  type="number"
                  value={formData.diameter}
                  onChange={(e) => handleChange('diameter', parseInt(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Capacità Pizze</label>
                <input
                  type="text"
                  value={formData.pizza_capacity}
                  onChange={(e) => handleChange('pizza_capacity', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="es. 4-6 pizze"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tempo Consegna (settimane)</label>
                <input
                  type="number"
                  value={formData.delivery_time_weeks}
                  onChange={(e) => handleChange('delivery_time_weeks', parseInt(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Descrizione</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>
          </div>

          {/* Listino A */}
          <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
            <h3 className="font-semibold text-sm">Listino A</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Prezzo Base (€)</label>
                <input
                  type="number"
                  value={formData.base_price_a}
                  onChange={(e) => handleChange('base_price_a', parseFloat(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prezzo Gas (€)</label>
                <input
                  type="number"
                  value={formData.gas_price_a}
                  onChange={(e) => handleChange('gas_price_a', parseFloat(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prezzo Elettrico (€)</label>
                <input
                  type="number"
                  value={formData.electric_price_a}
                  onChange={(e) => handleChange('electric_price_a', parseFloat(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prezzo Montaggio sul Posto (€)</label>
                <input
                  type="number"
                  value={formData.installation_price_a}
                  onChange={(e) => handleChange('installation_price_a', parseFloat(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Listino B */}
          <div className="space-y-4 p-4 border rounded-lg bg-green-50/50">
            <h3 className="font-semibold text-sm">Listino B</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Prezzo Base (€)</label>
                <input
                  type="number"
                  value={formData.base_price_b}
                  onChange={(e) => handleChange('base_price_b', parseFloat(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prezzo Gas (€)</label>
                <input
                  type="number"
                  value={formData.gas_price_b}
                  onChange={(e) => handleChange('gas_price_b', parseFloat(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prezzo Elettrico (€)</label>
                <input
                  type="number"
                  value={formData.electric_price_b}
                  onChange={(e) => handleChange('electric_price_b', parseFloat(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prezzo Montaggio sul Posto (€)</label>
                <input
                  type="number"
                  value={formData.installation_price_b}
                  onChange={(e) => handleChange('installation_price_b', parseFloat(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Listino C */}
          <div className="space-y-4 p-4 border rounded-lg bg-purple-50/50">
            <h3 className="font-semibold text-sm">Listino C</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Prezzo Base (€)</label>
                <input
                  type="number"
                  value={formData.base_price_c}
                  onChange={(e) => handleChange('base_price_c', parseFloat(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prezzo Gas (€)</label>
                <input
                  type="number"
                  value={formData.gas_price_c}
                  onChange={(e) => handleChange('gas_price_c', parseFloat(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prezzo Elettrico (€)</label>
                <input
                  type="number"
                  value={formData.electric_price_c}
                  onChange={(e) => handleChange('electric_price_c', parseFloat(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prezzo Montaggio sul Posto (€)</label>
                <input
                  type="number"
                  value={formData.installation_price_c}
                  onChange={(e) => handleChange('installation_price_c', parseFloat(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Media *</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Immagine Forno *</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => handleChange('image_url', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md"
                    placeholder="URL immagine o carica file"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadingImage}
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingImage ? "Caricamento..." : "Carica"}
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                {formData.image_url && (
                  <img src={formData.image_url} alt="Preview" className="mt-2 h-32 object-cover rounded" />
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Video 360°</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={formData.video_url_360}
                    onChange={(e) => handleChange('video_url_360', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md"
                    placeholder="URL video o carica file"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadingVideo}
                    onClick={() => document.getElementById('video-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingVideo ? "Caricamento..." : "Carica"}
                  </Button>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Galleria Immagini Aggiuntive</label>
                {formData.additional_images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2 mb-2">
                    {formData.additional_images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-24 object-cover rounded" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeAdditionalImage(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadingImage}
                    onClick={() => document.getElementById('gallery-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingImage ? "Caricamento..." : "Aggiungi Immagini alla Galleria"}
                  </Button>
                  <input
                    id="gallery-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rivestimenti */}
          <div className="space-y-4 p-4 border rounded-lg bg-amber-50/50">
            <h3 className="font-semibold text-sm">Rivestimenti</h3>
            
            {/* Lista rivestimenti esistenti */}
            {formData.coatings.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Rivestimenti aggiunti:</label>
                <div className="grid grid-cols-2 gap-2">
                  {formData.coatings.map((coating, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                      <img src={coating.image_url} alt={coating.name} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{coating.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{coating.type}</p>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => removeCoating(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form per aggiungere nuovo rivestimento */}
            <div className="space-y-3 p-3 border rounded bg-white">
              <label className="text-sm font-medium">Aggiungi Rivestimento</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Tipo</label>
                  <input
                    type="text"
                    value={newCoating.type}
                    onChange={(e) => setNewCoating(prev => ({ ...prev, type: e.target.value }))}
                    placeholder="es. mosaico, ceramica"
                    className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Nome</label>
                  <input
                    type="text"
                    value={newCoating.name}
                    onChange={(e) => setNewCoating(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="es. Mosaico Blu"
                    className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Immagine</label>
                <div className="flex gap-2 mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingCoating}
                    onClick={() => document.getElementById('coating-upload')?.click()}
                    className="flex-1"
                  >
                    <Upload className="h-3 w-3 mr-2" />
                    {uploadingCoating ? "Caricamento..." : "Carica Immagine"}
                  </Button>
                  <input
                    id="coating-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleCoatingImageUpload}
                    className="hidden"
                  />
                </div>
                {newCoating.image_url && (
                  <div className="mt-2">
                    <img src={newCoating.image_url} alt="Preview" className="w-20 h-20 object-cover rounded" />
                  </div>
                )}
              </div>
              <Button
                type="button"
                onClick={addCoating}
                disabled={!newCoating.type || !newCoating.name || !newCoating.image_url}
                className="w-full"
                size="sm"
              >
                <Upload className="h-3 w-3 mr-2" />
                Aggiungi Rivestimento
              </Button>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvataggio..." : "Aggiungi Forno"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
