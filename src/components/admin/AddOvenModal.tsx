import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Video } from "lucide-react";

interface AddOvenModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Coating {
  name: string;
  image_url: string;
  video_url_360?: string;
  prices: {
    listA: { base: number; gas: number; electric: number; onSite: number };
    listB: { base: number; gas: number; electric: number; onSite: number };
    listC: { base: number; gas: number; electric: number; onSite: number };
  };
}

interface SizeOption {
  diameter: number;
  pizza_capacity: string;
  coatings: Coating[];
  passage_space_cm: number | null;
  can_be_built_on_site: boolean;
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
    sizes: [] as SizeOption[],
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  const [newSize, setNewSize] = useState<SizeOption>({
    diameter: 0,
    pizza_capacity: "",
    coatings: [],
    passage_space_cm: null,
    can_be_built_on_site: true
  });

  const [newCoating, setNewCoating] = useState<Coating>({
    name: "",
    image_url: "",
    video_url_360: "",
    prices: {
      listA: { base: 0, gas: 0, electric: 0, onSite: 0 },
      listB: { base: 0, gas: 0, electric: 0, onSite: 0 },
      listC: { base: 0, gas: 0, electric: 0, onSite: 0 }
    }
  });

  const [editingSizeIndex, setEditingSizeIndex] = useState<number | null>(null);
  const [editingCoating, setEditingCoating] = useState<{ sizeIdx: number; coatingIdx: number } | null>(null);
  const [editingCoatingData, setEditingCoatingData] = useState<Coating | null>(null);

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

  const addSize = () => {
    if (!newSize.diameter || !newSize.pizza_capacity) {
      toast.error("Inserisci diametro e capacità");
      return;
    }
    setFormData(prev => ({ ...prev, sizes: [...prev.sizes, { ...newSize }] }));
    setNewSize({ diameter: 0, pizza_capacity: "", coatings: [], passage_space_cm: null, can_be_built_on_site: true });
    toast.success("Dimensione aggiunta");
  };

  const removeSize = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      sizes: prev.sizes.filter((_, i) => i !== index) 
    }));
    toast.success("Dimensione rimossa");
  };

  const addCoatingToSize = (sizeIndex: number) => {
    if (!newCoating.name || !newCoating.image_url) {
      toast.error("Inserisci nome e immagine del rivestimento");
      return;
    }
    
    const updatedSizes = [...formData.sizes];
    updatedSizes[sizeIndex].coatings.push({ ...newCoating });
    setFormData(prev => ({ ...prev, sizes: updatedSizes }));
    
    setNewCoating({
      name: "",
      image_url: "",
      video_url_360: "",
      prices: {
        listA: { base: 0, gas: 0, electric: 0, onSite: 0 },
        listB: { base: 0, gas: 0, electric: 0, onSite: 0 },
        listC: { base: 0, gas: 0, electric: 0, onSite: 0 }
      }
    });
    setEditingSizeIndex(null);
    toast.success("Rivestimento aggiunto");
  };

  const removeCoatingFromSize = (sizeIndex: number, coatingIndex: number) => {
    const updatedSizes = [...formData.sizes];
    updatedSizes[sizeIndex].coatings.splice(coatingIndex, 1);
    setFormData(prev => ({ ...prev, sizes: updatedSizes }));
    toast.success("Rivestimento rimosso");
  };

  const startEditingCoating = (sizeIdx: number, coatingIdx: number) => {
    const coating = formData.sizes[sizeIdx].coatings[coatingIdx];
    setEditingCoating({ sizeIdx, coatingIdx });
    setEditingCoatingData({ ...coating });
  };

  const cancelEditingCoating = () => {
    setEditingCoating(null);
    setEditingCoatingData(null);
  };

  const saveEditingCoating = () => {
    if (!editingCoating || !editingCoatingData) return;
    
    const updatedSizes = [...formData.sizes];
    updatedSizes[editingCoating.sizeIdx].coatings[editingCoating.coatingIdx] = { ...editingCoatingData };
    setFormData(prev => ({ ...prev, sizes: updatedSizes }));
    
    toast.success("Rivestimento aggiornato");
    cancelEditingCoating();
  };

  const handleSave = async () => {
    if (!formData.model_name || formData.fuel_type.length === 0 || formData.sizes.length === 0) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('configurator_ovens').insert({
        model_name: formData.model_name,
        fuel_type: formData.fuel_type,
        description: formData.description,
        delivery_time_weeks: formData.delivery_time_weeks,
        image_url: formData.image_url,
        additional_images: formData.additional_images,
        video_url_360: formData.video_url_360,
        sizes: formData.sizes as any,
        diameter: formData.sizes[0]?.diameter || 0,
        pizza_capacity: formData.sizes[0]?.pizza_capacity || "",
        base_price_a: 0,
        coatings: null,
      } as any).select().single();

      if (error) throw error;

      toast.success("Forno aggiunto!");
      setFormData({
        model_name: "",
        fuel_type: [] as string[],
        description: "",
        delivery_time_weeks: 4,
        image_url: "",
        additional_images: [] as string[],
        video_url_360: "",
        sizes: [] as SizeOption[],
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving oven:', error);
      toast.error("Errore nel salvataggio");
    } finally {
      setSaving(false);
    }
  };

  const toggleFuelType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      fuel_type: prev.fuel_type.includes(type)
        ? prev.fuel_type.filter(t => t !== type)
        : [...prev.fuel_type, type]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aggiungi Nuovo Forno</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nome Modello *</Label>
              <Input 
                value={formData.model_name} 
                onChange={(e) => handleChange('model_name', e.target.value)}
                placeholder="es. Vesuvio Buono"
              />
            </div>
            <div>
              <Label>Tempi di Consegna (settimane)</Label>
              <Input 
                type="number" 
                value={formData.delivery_time_weeks} 
                onChange={(e) => handleChange('delivery_time_weeks', parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>Descrizione</Label>
            <Textarea 
              value={formData.description} 
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Fuel Types */}
          <div>
            <Label>Alimentazioni *</Label>
            <div className="flex gap-4 mt-2">
              {['Legna', 'Gas', 'Elettrico'].map(fuel => (
                <div key={fuel} className="flex items-center space-x-2">
                  <Checkbox 
                    checked={formData.fuel_type.includes(fuel)}
                    onCheckedChange={() => toggleFuelType(fuel)}
                  />
                  <Label className="cursor-pointer">{fuel}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label>Immagine Principale</Label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="h-16 w-16 object-cover rounded" />
              )}
            </div>
          </div>

          {/* Video 360 Upload */}
          <div>
            <Label>Video 360</Label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                disabled={uploadingVideo}
              />
              {formData.video_url_360 && (
                <span className="text-sm text-green-600">Video caricato</span>
              )}
            </div>
          </div>

          {/* Sizes Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Dimensioni, Rivestimenti e Prezzi *</h3>
            
            {/* Add New Size */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Aggiungi Nuova Dimensione</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Diametro (cm)</Label>
                    <Input 
                      type="number" 
                      value={newSize.diameter || ''} 
                      onChange={(e) => setNewSize(prev => ({ ...prev, diameter: parseInt(e.target.value) || 0 }))}
                      placeholder="es. 80"
                    />
                  </div>
                  <div>
                    <Label>Capacità Pizze</Label>
                    <Input 
                      value={newSize.pizza_capacity} 
                      onChange={(e) => setNewSize(prev => ({ ...prev, pizza_capacity: e.target.value }))}
                      placeholder="es. 2-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Spazio passaggio forno già pronto (cm)</Label>
                    <Input 
                      type="number" 
                      value={newSize.passage_space_cm || ''} 
                      onChange={(e) => setNewSize(prev => ({ ...prev, passage_space_cm: e.target.value ? parseInt(e.target.value) : null }))}
                      placeholder="es. 150"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox 
                      checked={newSize.can_be_built_on_site}
                      onCheckedChange={(checked) => setNewSize(prev => ({ ...prev, can_be_built_on_site: !!checked }))}
                    />
                    <Label className="cursor-pointer">Può essere costruito sul posto</Label>
                  </div>
                </div>

                <Button type="button" onClick={addSize} className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Aggiungi Dimensione
                </Button>
              </CardContent>
            </Card>

            {/* Existing Sizes List with Coatings */}
            {formData.sizes.map((size, sizeIdx) => (
              <Card key={sizeIdx}>
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="font-medium text-lg">Ø {size.diameter}cm - {size.pizza_capacity} pizze</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs">Spazio passaggio (cm)</Label>
                          <Input 
                            type="number" 
                            value={size.passage_space_cm || ''} 
                            onChange={(e) => {
                              const newSizes = [...formData.sizes];
                              newSizes[sizeIdx].passage_space_cm = e.target.value ? parseInt(e.target.value) : null;
                              setFormData(prev => ({ ...prev, sizes: newSizes }));
                            }}
                            placeholder="es. 150"
                            className="h-8"
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-5">
                          <Checkbox 
                            checked={size.can_be_built_on_site}
                            onCheckedChange={(checked) => {
                              const newSizes = [...formData.sizes];
                              newSizes[sizeIdx].can_be_built_on_site = !!checked;
                              setFormData(prev => ({ ...prev, sizes: newSizes }));
                            }}
                          />
                          <Label className="cursor-pointer text-xs">Costruibile sul posto</Label>
                        </div>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeSize(sizeIdx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Add Coating Section */}
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Aggiungi Rivestimento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Nome Rivestimento</Label>
                          <Input 
                            value={editingSizeIndex === sizeIdx ? newCoating.name : ''} 
                            onChange={(e) => {
                              setEditingSizeIndex(sizeIdx);
                              setNewCoating(prev => ({ ...prev, name: e.target.value }));
                            }}
                            placeholder="es. Verniciato"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Immagine Rivestimento</Label>
                          <div 
                            className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.add('border-primary');
                            }}
                            onDragLeave={(e) => {
                              e.currentTarget.classList.remove('border-primary');
                            }}
                            onDrop={async (e) => {
                              e.preventDefault();
                              e.currentTarget.classList.remove('border-primary');
                              const file = e.dataTransfer.files?.[0];
                              if (file && file.type.startsWith('image/')) {
                                setUploadingImage(true);
                                try {
                                  const url = await uploadFile(file, 'oven-gallery');
                                  setEditingSizeIndex(sizeIdx);
                                  setNewCoating(prev => ({ ...prev, image_url: url }));
                                  toast.success("Immagine caricata!");
                                } catch (error) {
                                  console.error('Error uploading image:', error);
                                  toast.error("Errore nel caricamento");
                                } finally {
                                  setUploadingImage(false);
                                }
                              }
                            }}
                            onClick={() => document.getElementById(`coating-upload-${sizeIdx}`)?.click()}
                          >
                            <input
                              id={`coating-upload-${sizeIdx}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setUploadingImage(true);
                                  try {
                                    const url = await uploadFile(file, 'oven-gallery');
                                    setEditingSizeIndex(sizeIdx);
                                    setNewCoating(prev => ({ ...prev, image_url: url }));
                                    toast.success("Immagine caricata!");
                                  } catch (error) {
                                    console.error('Error uploading image:', error);
                                    toast.error("Errore nel caricamento");
                                  } finally {
                                    setUploadingImage(false);
                                  }
                                }
                              }}
                            />
                            {editingSizeIndex === sizeIdx && newCoating.image_url ? (
                              <div className="flex items-center gap-2 justify-center">
                                <img src={newCoating.image_url} alt="Preview" className="h-16 w-16 object-cover rounded" />
                                <span className="text-xs text-muted-foreground">Caricata</span>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                {uploadingImage ? "Caricamento..." : "Trascina immagine o clicca per caricare"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Video 360 Upload for Coating */}
                      {editingSizeIndex === sizeIdx && (
                        <div>
                          <Label className="text-xs">Video 360° Rivestimento (opzionale)</Label>
                          <div 
                            className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.add('border-primary');
                            }}
                            onDragLeave={(e) => {
                              e.currentTarget.classList.remove('border-primary');
                            }}
                            onDrop={async (e) => {
                              e.preventDefault();
                              e.currentTarget.classList.remove('border-primary');
                              const file = e.dataTransfer.files?.[0];
                              if (file && file.type.startsWith('video/')) {
                                setUploadingImage(true);
                                try {
                                  const url = await uploadFile(file, 'videos');
                                  setNewCoating(prev => ({ ...prev, video_url_360: url }));
                                  toast.success("Video caricato!");
                                } catch (error) {
                                  console.error('Error uploading video:', error);
                                  toast.error("Errore nel caricamento");
                                } finally {
                                  setUploadingImage(false);
                                }
                              }
                            }}
                            onClick={() => document.getElementById(`coating-video-upload-${sizeIdx}`)?.click()}
                          >
                            <input
                              id={`coating-video-upload-${sizeIdx}`}
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setUploadingImage(true);
                                  try {
                                    const url = await uploadFile(file, 'videos');
                                    setNewCoating(prev => ({ ...prev, video_url_360: url }));
                                    toast.success("Video caricato!");
                                  } catch (error) {
                                    console.error('Error uploading video:', error);
                                    toast.error("Errore nel caricamento");
                                  } finally {
                                    setUploadingImage(false);
                                  }
                                }
                              }}
                            />
                            {newCoating.video_url_360 ? (
                              <div className="flex items-center gap-2 justify-center">
                                <Video className="h-6 w-6 text-primary" />
                                <span className="text-xs text-green-600">Video caricato</span>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                {uploadingImage ? "Caricamento..." : "Trascina video o clicca per caricare"}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Prices for coating */}
                      {editingSizeIndex === sizeIdx && (
                        <div className="space-y-2">
                          {(['A', 'B', 'C'] as const).map(list => (
                            <Card key={list}>
                              <CardHeader>
                                <CardTitle className="text-xs">Listino {list}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-4 gap-2">
                                  <div>
                                    <Label className="text-xs">Base</Label>
                                    <Input 
                                      type="number" 
                                      value={newCoating.prices[`list${list}` as keyof typeof newCoating.prices].base || ''} 
                                      onChange={(e) => setNewCoating(prev => ({
                                        ...prev,
                                        prices: {
                                          ...prev.prices,
                                          [`list${list}`]: { 
                                            ...prev.prices[`list${list}` as keyof typeof prev.prices], 
                                            base: parseFloat(e.target.value) || 0 
                                          }
                                        }
                                      }))}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Gas</Label>
                                    <Input 
                                      type="number" 
                                      value={newCoating.prices[`list${list}` as keyof typeof newCoating.prices].gas || ''} 
                                      onChange={(e) => setNewCoating(prev => ({
                                        ...prev,
                                        prices: {
                                          ...prev.prices,
                                          [`list${list}`]: { 
                                            ...prev.prices[`list${list}` as keyof typeof prev.prices], 
                                            gas: parseFloat(e.target.value) || 0 
                                          }
                                        }
                                      }))}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Elettrico</Label>
                                    <Input 
                                      type="number" 
                                      value={newCoating.prices[`list${list}` as keyof typeof newCoating.prices].electric || ''} 
                                      onChange={(e) => setNewCoating(prev => ({
                                        ...prev,
                                        prices: {
                                          ...prev.prices,
                                          [`list${list}`]: { 
                                            ...prev.prices[`list${list}` as keyof typeof prev.prices], 
                                            electric: parseFloat(e.target.value) || 0 
                                          }
                                        }
                                      }))}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Costruito sul Posto (€)</Label>
                                    <Input 
                                      type="number" 
                                      value={newCoating.prices[`list${list}` as keyof typeof newCoating.prices].onSite || ''} 
                                      onChange={(e) => setNewCoating(prev => ({
                                        ...prev,
                                        prices: {
                                          ...prev.prices,
                                          [`list${list}`]: { 
                                            ...prev.prices[`list${list}` as keyof typeof prev.prices], 
                                            onSite: parseFloat(e.target.value) || 0 
                                          }
                                        }
                                      }))}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      <Button 
                        type="button" 
                        onClick={() => addCoatingToSize(sizeIdx)}
                        size="sm"
                        className="w-full"
                      >
                        <Plus className="mr-2 h-3 w-3" /> Aggiungi Rivestimento
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Existing Coatings */}
                  {size.coatings.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Rivestimenti Configurati</h5>
                      {size.coatings.map((coating, coatingIdx) => {
                        const isEditing = editingCoating?.sizeIdx === sizeIdx && editingCoating?.coatingIdx === coatingIdx;
                        const displayCoating = isEditing && editingCoatingData ? editingCoatingData : coating;
                        
                        return (
                          <Card key={coatingIdx} className="bg-muted/30">
                            <CardContent className="p-3">
                              {!isEditing ? (
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{coating.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{coating.image_url}</p>
                                    <div className="text-xs text-muted-foreground mt-1 space-y-1">
                                      {(['A', 'B', 'C'] as const).map(list => (
                                        <div key={list}>
                                          <strong>Listino {list}:</strong> Base: €{coating.prices[`list${list}` as keyof typeof coating.prices].base}, 
                                          Gas: €{coating.prices[`list${list}` as keyof typeof coating.prices].gas}, 
                                          Elettrico: €{coating.prices[`list${list}` as keyof typeof coating.prices].electric}, 
                                          Sul Posto: €{coating.prices[`list${list}` as keyof typeof coating.prices].onSite}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => startEditingCoating(sizeIdx, coatingIdx)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => removeCoatingFromSize(sizeIdx, coatingIdx)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <p className="font-medium text-sm">Modifica: {coating.name}</p>
                                    <div className="flex gap-2">
                                      <Button 
                                        type="button" 
                                        size="sm" 
                                        onClick={saveEditingCoating}
                                      >
                                        Salva
                                      </Button>
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm"
                                        onClick={cancelEditingCoating}
                                      >
                                        Annulla
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {(['A', 'B', 'C'] as const).map(list => (
                                    <div key={list} className="space-y-2">
                                      <Label className="text-xs font-semibold">Listino {list}</Label>
                                      <div className="grid grid-cols-4 gap-2">
                                        <div>
                                          <Label className="text-xs">Base (€)</Label>
                                          <Input
                                            type="number"
                                            value={displayCoating.prices[`list${list}` as keyof typeof displayCoating.prices].base}
                                            onChange={(e) => {
                                              if (!editingCoatingData) return;
                                              const newData = { ...editingCoatingData };
                                              newData.prices[`list${list}` as keyof typeof newData.prices].base = Number(e.target.value);
                                              setEditingCoatingData(newData);
                                            }}
                                            className="h-8 text-xs"
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs">Gas (€)</Label>
                                          <Input
                                            type="number"
                                            value={displayCoating.prices[`list${list}` as keyof typeof displayCoating.prices].gas}
                                            onChange={(e) => {
                                              if (!editingCoatingData) return;
                                              const newData = { ...editingCoatingData };
                                              newData.prices[`list${list}` as keyof typeof newData.prices].gas = Number(e.target.value);
                                              setEditingCoatingData(newData);
                                            }}
                                            className="h-8 text-xs"
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs">Elettrico (€)</Label>
                                          <Input
                                            type="number"
                                            value={displayCoating.prices[`list${list}` as keyof typeof displayCoating.prices].electric}
                                            onChange={(e) => {
                                              if (!editingCoatingData) return;
                                              const newData = { ...editingCoatingData };
                                              newData.prices[`list${list}` as keyof typeof newData.prices].electric = Number(e.target.value);
                                              setEditingCoatingData(newData);
                                            }}
                                            className="h-8 text-xs"
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs">Sul Posto (€)</Label>
                                          <Input
                                            type="number"
                                            value={displayCoating.prices[`list${list}` as keyof typeof displayCoating.prices].onSite}
                                            onChange={(e) => {
                                              if (!editingCoatingData) return;
                                              const newData = { ...editingCoatingData };
                                              newData.prices[`list${list}` as keyof typeof newData.prices].onSite = Number(e.target.value);
                                              setEditingCoatingData(newData);
                                            }}
                                            className="h-8 text-xs"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvataggio..." : "Salva Forno"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddOvenModal;
