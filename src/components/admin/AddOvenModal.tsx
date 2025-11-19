import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Plus, Trash2 } from "lucide-react";

interface AddOvenModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Coating {
  type: string;
  name: string;
  image_url: string;
}

interface SizeOption {
  diameter: number;
  pizza_capacity: string;
  prices: {
    listA: { base: number; gas: number; electric: number; installation: number };
    listB: { base: number; gas: number; electric: number; installation: number };
    listC: { base: number; gas: number; electric: number; installation: number };
  };
}

export const AddOvenModal = ({ open, onClose, onSuccess }: AddOvenModalProps) => {
  const [formData, setFormData] = useState({
    model_name: "",
    fuel_type: [] as string[],
    description: "",
    delivery_time_weeks: 4,
    image_url: "",
    additional_images: [] as string[],
    video_url_360: "",
    coatings: [] as Coating[],
    sizes: [] as SizeOption[]
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingCoating, setUploadingCoating] = useState(false);
  const [newCoating, setNewCoating] = useState({ type: '', name: '', image_url: '' });
  const [newSize, setNewSize] = useState<SizeOption>({
    diameter: 0,
    pizza_capacity: "",
    prices: {
      listA: { base: 0, gas: 0, electric: 0, installation: 0 },
      listB: { base: 0, gas: 0, electric: 0, installation: 0 },
      listC: { base: 0, gas: 0, electric: 0, installation: 0 }
    }
  });

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

  const addSize = () => {
    if (!newSize.diameter || !newSize.pizza_capacity) {
      toast.error('Inserisci diametro e capacità');
      return;
    }
    
    handleChange('sizes', [...formData.sizes, newSize].sort((a, b) => a.diameter - b.diameter));
    setNewSize({
      diameter: 0,
      pizza_capacity: "",
      prices: {
        listA: { base: 0, gas: 0, electric: 0, installation: 0 },
        listB: { base: 0, gas: 0, electric: 0, installation: 0 },
        listC: { base: 0, gas: 0, electric: 0, installation: 0 }
      }
    });
    toast.success('Dimensione aggiunta');
  };

  const removeSize = (index: number) => {
    const newSizes = formData.sizes.filter((_, i) => i !== index);
    handleChange('sizes', newSizes);
  };

  const handleSave = async () => {
    if (!formData.model_name || formData.fuel_type.length === 0 || !formData.image_url || formData.sizes.length === 0) {
      toast.error("Compila tutti i campi obbligatori: nome, combustibili, immagine e almeno una dimensione");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('configurator_ovens')
        .insert([{
          model_name: formData.model_name,
          fuel_type: formData.fuel_type,
          description: formData.description,
          delivery_time_weeks: formData.delivery_time_weeks,
          image_url: formData.image_url,
          additional_images: formData.additional_images,
          video_url_360: formData.video_url_360,
          coatings: formData.coatings as any,
          sizes: formData.sizes as any,
          // Campi legacy per retrocompatibilità
          diameter: formData.sizes[0]?.diameter || 0,
          pizza_capacity: formData.sizes[0]?.pizza_capacity || "",
          base_price_a: formData.sizes[0]?.prices.listA.base || 0,
          base_price_b: formData.sizes[0]?.prices.listB.base || 0,
          base_price_c: formData.sizes[0]?.prices.listC.base || 0,
          gas_price_a: formData.sizes[0]?.prices.listA.gas || 0,
          gas_price_b: formData.sizes[0]?.prices.listB.gas || 0,
          gas_price_c: formData.sizes[0]?.prices.listC.gas || 0,
          electric_price_a: formData.sizes[0]?.prices.listA.electric || 0,
          electric_price_b: formData.sizes[0]?.prices.listB.electric || 0,
          electric_price_c: formData.sizes[0]?.prices.listC.electric || 0,
          installation_price_a: formData.sizes[0]?.prices.listA.installation || 0,
          installation_price_b: formData.sizes[0]?.prices.listB.installation || 0,
          installation_price_c: formData.sizes[0]?.prices.listC.installation || 0,
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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
              <label className="text-sm font-medium">Descrizione</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>
          </div>

          {/* Dimensionamenti */}
          <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
            <h3 className="font-semibold text-sm">Dimensionamenti * - Aggiungi dimensioni e relativi prezzi</h3>
            
            {/* Lista dimensioni già aggiunte */}
            {formData.sizes.length > 0 && (
              <div className="space-y-3">
                {formData.sizes.map((size, index) => (
                  <div key={index} className="p-3 bg-white rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">Ø {size.diameter}cm - {size.pizza_capacity}</p>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSize(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="font-semibold text-orange-600">Listino A</p>
                        <p>Base: €{size.prices.listA.base}</p>
                        <p>Gas: €{size.prices.listA.gas}</p>
                        <p>Elettrico: €{size.prices.listA.electric}</p>
                        <p>Install.: €{size.prices.listA.installation}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-green-600">Listino B</p>
                        <p>Base: €{size.prices.listB.base}</p>
                        <p>Gas: €{size.prices.listB.gas}</p>
                        <p>Elettrico: €{size.prices.listB.electric}</p>
                        <p>Install.: €{size.prices.listB.installation}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-purple-600">Listino C</p>
                        <p>Base: €{size.prices.listC.base}</p>
                        <p>Gas: €{size.prices.listC.gas}</p>
                        <p>Elettrico: €{size.prices.listC.electric}</p>
                        <p>Install.: €{size.prices.listC.installation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Form per aggiungere nuova dimensione */}
            <div className="space-y-3 p-3 border rounded bg-white">
              <label className="text-sm font-medium">Aggiungi Nuova Dimensione</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Diametro (cm) *</label>
                  <input
                    type="number"
                    value={newSize.diameter || ''}
                    onChange={(e) => setNewSize(prev => ({ ...prev, diameter: parseInt(e.target.value) || 0 }))}
                    className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                    placeholder="es. 100"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Capacità *</label>
                  <input
                    type="text"
                    value={newSize.pizza_capacity}
                    onChange={(e) => setNewSize(prev => ({ ...prev, pizza_capacity: e.target.value }))}
                    placeholder="es. 4-6 pizze"
                    className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="font-semibold text-orange-600">Listino A</p>
                  <div>
                    <label className="text-xs text-muted-foreground">Base</label>
                    <input
                      type="number"
                      value={newSize.prices.listA.base || ''}
                      onChange={(e) => setNewSize(prev => ({ ...prev, prices: { ...prev.prices, listA: { ...prev.prices.listA, base: parseInt(e.target.value) || 0 } } }))}
                      className="w-full mt-1 px-2 py-1 text-sm border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Gas</label>
                    <input
                      type="number"
                      value={newSize.prices.listA.gas || ''}
                      onChange={(e) => setNewSize(prev => ({ ...prev, prices: { ...prev.prices, listA: { ...prev.prices.listA, gas: parseInt(e.target.value) || 0 } } }))}
                      className="w-full mt-1 px-2 py-1 text-sm border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Elettrico</label>
                    <input
                      type="number"
                      value={newSize.prices.listA.electric || ''}
                      onChange={(e) => setNewSize(prev => ({ ...prev, prices: { ...prev.prices, listA: { ...prev.prices.listA, electric: parseInt(e.target.value) || 0 } } }))}
                      className="w-full mt-1 px-2 py-1 text-sm border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Installazione</label>
                    <input
                      type="number"
                      value={newSize.prices.listA.installation || ''}
                      onChange={(e) => setNewSize(prev => ({ ...prev, prices: { ...prev.prices, listA: { ...prev.prices.listA, installation: parseInt(e.target.value) || 0 } } }))}
                      className="w-full mt-1 px-2 py-1 text-sm border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-green-600">Listino B</p>
                  <div>
                    <label className="text-xs text-muted-foreground">Base</label>
                    <input
                      type="number"
                      value={newSize.prices.listB.base || ''}
                      onChange={(e) => setNewSize(prev => ({ ...prev, prices: { ...prev.prices, listB: { ...prev.prices.listB, base: parseInt(e.target.value) || 0 } } }))}
                      className="w-full mt-1 px-2 py-1 text-sm border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Gas</label>
                    <input
                      type="number"
                      value={newSize.prices.listB.gas || ''}
                      onChange={(e) => setNewSize(prev => ({ ...prev, prices: { ...prev.prices, listB: { ...prev.prices.listB, gas: parseInt(e.target.value) || 0 } } }))}
                      className="w-full mt-1 px-2 py-1 text-sm border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Elettrico</label>
                    <input
                      type="number"
                      value={newSize.prices.listB.electric || ''}
                      onChange={(e) => setNewSize(prev => ({ ...prev, prices: { ...prev.prices, listB: { ...prev.prices.listB, electric: parseInt(e.target.value) || 0 } } }))}
                      className="w-full mt-1 px-2 py-1 text-sm border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Installazione</label>
                    <input
                      type="number"
                      value={newSize.prices.listB.installation || ''}
                      onChange={(e) => setNewSize(prev => ({ ...prev, prices: { ...prev.prices, listB: { ...prev.prices.listB, installation: parseInt(e.target.value) || 0 } } }))}
                      className="w-full mt-1 px-2 py-1 text-sm border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-purple-600">Listino C</p>
                  <div>
                    <label className="text-xs text-muted-foreground">Base</label>
                    <input
                      type="number"
                      value={newSize.prices.listC.base || ''}
                      onChange={(e) => setNewSize(prev => ({ ...prev, prices: { ...prev.prices, listC: { ...prev.prices.listC, base: parseInt(e.target.value) || 0 } } }))}
                      className="w-full mt-1 px-2 py-1 text-sm border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Gas</label>
                    <input
                      type="number"
                      value={newSize.prices.listC.gas || ''}
                      onChange={(e) => setNewSize(prev => ({ ...prev, prices: { ...prev.prices, listC: { ...prev.prices.listC, gas: parseInt(e.target.value) || 0 } } }))}
                      className="w-full mt-1 px-2 py-1 text-sm border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Elettrico</label>
                    <input
                      type="number"
                      value={newSize.prices.listC.electric || ''}
                      onChange={(e) => setNewSize(prev => ({ ...prev, prices: { ...prev.prices, listC: { ...prev.prices.listC, electric: parseInt(e.target.value) || 0 } } }))}
                      className="w-full mt-1 px-2 py-1 text-sm border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Installazione</label>
                    <input
                      type="number"
                      value={newSize.prices.listC.installation || ''}
                      onChange={(e) => setNewSize(prev => ({ ...prev, prices: { ...prev.prices, listC: { ...prev.prices.listC, installation: parseInt(e.target.value) || 0 } } }))}
                      className="w-full mt-1 px-2 py-1 text-sm border rounded-md"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={addSize}
                disabled={!newSize.diameter || !newSize.pizza_capacity}
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Dimensione
              </Button>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Media</h3>
            <div>
              <label className="text-sm font-medium">Immagine Principale *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full mt-1"
              />
              {uploadingImage && <p className="text-xs text-muted-foreground">Caricamento...</p>}
              {formData.image_url && <img src={formData.image_url} alt="Anteprima" className="mt-2 max-h-40 rounded-md" />}
            </div>
            <div>
              <label className="text-sm font-medium">Altre Immagini (Galleria)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="w-full mt-1"
              />
              {uploadingImage && <p className="text-xs text-muted-foreground">Caricamento...</p>}
              <div className="mt-2 flex space-x-2 overflow-x-auto">
                {formData.additional_images.map((url, index) => (
                  <div key={index} className="relative">
                    <img src={url} alt={`Immagine ${index + 1}`} className="max-h-24 rounded-md" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 bg-white/50 hover:bg-white/80 rounded-full"
                      onClick={() => removeAdditionalImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Video 360° (URL)</label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="w-full mt-1"
              />
              {uploadingVideo && <p className="text-xs text-muted-foreground">Caricamento...</p>}
              {formData.video_url_360 && <p className="text-xs text-muted-foreground">Video caricato</p>}
            </div>
          </div>

          {/* Rivestimenti */}
          <div className="space-y-4 p-4 border rounded-lg bg-orange-50/50">
            <h3 className="font-semibold text-sm">Rivestimenti</h3>

            {/* Lista rivestimenti già aggiunti */}
            {formData.coatings.length > 0 && (
              <div className="space-y-3">
                {formData.coatings.map((coating, index) => (
                  <div key={index} className="p-3 bg-white rounded border flex items-center justify-between">
                    <div>
                      <p className="font-medium">{coating.name} ({coating.type})</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <img src={coating.image_url} alt={coating.name} className="max-h-16 rounded-md" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeCoating(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Form per aggiungere nuovo rivestimento */}
            <div className="space-y-3 p-3 border rounded bg-white">
              <label className="text-sm font-medium">Aggiungi Nuovo Rivestimento</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Tipo</label>
                  <input
                    type="text"
                    value={newCoating.type}
                    onChange={(e) => setNewCoating(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                    placeholder="es. Standard"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Nome</label>
                  <input
                    type="text"
                    value={newCoating.name}
                    onChange={(e) => setNewCoating(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md"
                    placeholder="es. Acciaio Inox"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Immagine</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoatingImageUpload}
                  className="w-full mt-1"
                />
                {uploadingCoating && <p className="text-xs text-muted-foreground">Caricamento...</p>}
                {newCoating.image_url && <img src={newCoating.image_url} alt="Anteprima Rivestimento" className="mt-2 max-h-20 rounded-md" />}
              </div>
              <Button
                type="button"
                onClick={addCoating}
                disabled={!newCoating.type || !newCoating.name || !newCoating.image_url}
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
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
