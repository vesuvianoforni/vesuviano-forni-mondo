import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Video, Upload } from 'lucide-react';

interface EditOvenModalProps {
  oven: any;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

interface Coating {
  name: string;
  image_url: string;
  video_url_360?: string;
  render_images?: string[];
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

const EditOvenModal = ({ oven, open, onClose, onUpdate }: EditOvenModalProps) => {
  const [formData, setFormData] = useState({
    model_name: '',
    fuel_type: [] as string[],
    description: '',
    delivery_time_weeks: 4,
    image_url: '',
    additional_images: [] as string[],
    video_url_360: '',
    sizes: [] as SizeOption[],
    is_active: true,
  });

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCoatingImage, setUploadingCoatingImage] = useState(false);
  const [uploadingCoatingVideo, setUploadingCoatingVideo] = useState(false);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);

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

  useEffect(() => {
    if (open && oven) {
      let sizes = oven.sizes || [];
      
      // Migration: convert old format to new format with coatings
      if (sizes.length === 0 && oven.diameter) {
        sizes = [{
          diameter: oven.diameter,
          pizza_capacity: oven.pizza_capacity || "",
          coatings: []
        }];
      }
      
      setFormData({
        model_name: oven.model_name,
        fuel_type: Array.isArray(oven.fuel_type) ? oven.fuel_type : [oven.fuel_type],
        description: oven.description || '',
        delivery_time_weeks: oven.delivery_time_weeks,
        image_url: oven.image_url,
        additional_images: oven.additional_images || [],
        video_url_360: oven.video_url_360 || '',
        sizes: sizes,
        is_active: oven.is_active,
      });
    }
  }, [open, oven]);

  const toggleFuelType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      fuel_type: prev.fuel_type.includes(type)
        ? prev.fuel_type.filter(t => t !== type)
        : [...prev.fuel_type, type]
    }));
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

    try {
      const { error } = await supabase.from('configurator_ovens').update({
        ...formData,
        sizes: formData.sizes as any,
        diameter: formData.sizes[0]?.diameter || 0,
        pizza_capacity: formData.sizes[0]?.pizza_capacity || "",
        coatings: null,
      }).eq('id', oven.id);
      
      if (error) throw error;

      toast.success("Forno aggiornato!");
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating oven:', error);
      toast.error("Errore nell'aggiornamento");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifica Forno</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nome Modello *</Label>
              <Input 
                value={formData.model_name} 
                onChange={(e) => setFormData(prev => ({ ...prev, model_name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Tempi di Consegna (settimane)</Label>
              <Input 
                type="number" 
                value={formData.delivery_time_weeks} 
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_time_weeks: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>Descrizione</Label>
            <Textarea 
              value={formData.description} 
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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

          {/* Main Image Upload */}
          <div>
            <Label>Immagine Principale</Label>
            <div className="space-y-2">
              <Input 
                value={formData.image_url} 
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://..."
              />
              <div className="text-center text-sm text-muted-foreground">oppure</div>
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('image/')) {
                    setUploadingMainImage(true);
                    try {
                      const url = await uploadFile(file, 'oven-gallery');
                      setFormData(prev => ({ ...prev, image_url: url }));
                      toast.success('Immagine caricata con successo');
                    } catch (error) {
                      console.error('Error uploading image:', error);
                      toast.error('Errore nel caricamento dell\'immagine');
                    } finally {
                      setUploadingMainImage(false);
                    }
                  }
                }}
                onClick={() => document.getElementById('main-image-upload')?.click()}
              >
                {uploadingMainImage ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Caricamento...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Trascina qui l'immagine o clicca per selezionare
                    </p>
                  </>
                )}
              </div>
              <input
                id="main-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadingMainImage(true);
                    try {
                      const url = await uploadFile(file, 'oven-gallery');
                      setFormData(prev => ({ ...prev, image_url: url }));
                      toast.success('Immagine caricata con successo');
                    } catch (error) {
                      console.error('Error uploading image:', error);
                      toast.error('Errore nel caricamento dell\'immagine');
                    } finally {
                      setUploadingMainImage(false);
                    }
                  }
                }}
              />
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="w-full h-32 object-contain rounded border" />
              )}
            </div>
          </div>

          {/* Video 360 URL */}
          <div>
            <Label>URL Video 360</Label>
            <Input 
              value={formData.video_url_360} 
              onChange={(e) => setFormData(prev => ({ ...prev, video_url_360: e.target.value }))}
            />
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
                                  
                                  {/* Edit name */}
                                  <div>
                                    <Label className="text-xs">Nome Rivestimento</Label>
                                    <Input
                                      value={displayCoating.name}
                                      onChange={(e) => {
                                        if (!editingCoatingData) return;
                                        setEditingCoatingData({ ...editingCoatingData, name: e.target.value });
                                      }}
                                      className="h-8"
                                    />
                                  </div>

                                  {/* Edit Image */}
                                  <div>
                                    <Label className="text-xs">Immagine Rivestimento</Label>
                                    <div 
                                      className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                                      onClick={() => document.getElementById(`edit-coating-upload-${sizeIdx}-${coatingIdx}`)?.click()}
                                    >
                                      <input
                                        id={`edit-coating-upload-${sizeIdx}-${coatingIdx}`}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            setUploadingImage(true);
                                            try {
                                              const url = await uploadFile(file, 'oven-gallery');
                                              if (editingCoatingData) {
                                                setEditingCoatingData({ ...editingCoatingData, image_url: url });
                                              }
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
                                      {displayCoating.image_url ? (
                                        <div className="flex items-center gap-2 justify-center">
                                          <img src={displayCoating.image_url} alt="Preview" className="h-16 w-16 object-cover rounded" />
                                          <span className="text-xs text-muted-foreground">Caricata</span>
                                        </div>
                                      ) : (
                                        <div className="text-sm text-muted-foreground">
                                          {uploadingImage ? "Caricamento..." : "Clicca per caricare nuova immagine"}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Edit Video 360 */}
                                  <div>
                                    <Label className="text-xs">Video 360° Rivestimento (opzionale)</Label>
                                    <div 
                                      className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                                      onClick={() => document.getElementById(`edit-coating-video-upload-${sizeIdx}-${coatingIdx}`)?.click()}
                                    >
                                      <input
                                        id={`edit-coating-video-upload-${sizeIdx}-${coatingIdx}`}
                                        type="file"
                                        accept="video/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            setUploadingImage(true);
                                            try {
                                              const url = await uploadFile(file, 'videos');
                                              if (editingCoatingData) {
                                                setEditingCoatingData({ ...editingCoatingData, video_url_360: url });
                                              }
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
                                      {displayCoating.video_url_360 ? (
                                        <div className="flex items-center gap-2 justify-center">
                                          <Video className="h-6 w-6 text-primary" />
                                          <span className="text-xs text-green-600">Video caricato</span>
                                        </div>
                                      ) : (
                                        <div className="text-sm text-muted-foreground">
                                          {uploadingImage ? "Caricamento..." : "Clicca per caricare video"}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Edit Render Images */}
                                  <div>
                                    <Label className="text-xs">Immagini Render (opzionali)</Label>
                                    <div className="space-y-2 mt-2">
                                      {(displayCoating.render_images || []).map((img, imgIdx) => (
                                        <div key={imgIdx} className="flex gap-2 items-center">
                                          <img src={img} alt={`Render ${imgIdx + 1}`} className="h-12 w-12 object-cover rounded" />
                                          <Input
                                            value={img}
                                            readOnly
                                            className="h-8 text-xs flex-1"
                                          />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              if (!editingCoatingData) return;
                                              const newRenderImages = [...(editingCoatingData.render_images || [])];
                                              newRenderImages.splice(imgIdx, 1);
                                              setEditingCoatingData({ ...editingCoatingData, render_images: newRenderImages });
                                            }}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                      <div 
                                        className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                                        onClick={() => document.getElementById(`edit-coating-render-upload-${sizeIdx}-${coatingIdx}`)?.click()}
                                      >
                                        <input
                                          id={`edit-coating-render-upload-${sizeIdx}-${coatingIdx}`}
                                          type="file"
                                          accept="image/*"
                                          multiple
                                          className="hidden"
                                          onChange={async (e) => {
                                            const files = Array.from(e.target.files || []);
                                            if (files.length > 0) {
                                              setUploadingImage(true);
                                              try {
                                                const uploadPromises = files.map(file => uploadFile(file, 'oven-gallery'));
                                                const urls = await Promise.all(uploadPromises);
                                                if (editingCoatingData) {
                                                  const currentRenderImages = editingCoatingData.render_images || [];
                                                  setEditingCoatingData({ 
                                                    ...editingCoatingData, 
                                                    render_images: [...currentRenderImages, ...urls]
                                                  });
                                                }
                                                toast.success(`${urls.length} immagine/i caricata/e!`);
                                              } catch (error) {
                                                console.error('Error uploading images:', error);
                                                toast.error("Errore nel caricamento");
                                              } finally {
                                                setUploadingImage(false);
                                              }
                                            }
                                          }}
                                        />
                                        <div className="text-sm text-muted-foreground">
                                          {uploadingImage ? "Caricamento..." : "Clicca per caricare immagini render (multiplo)"}
                                        </div>
                                      </div>
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

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: !!checked }))}
            />
            <Label>Forno Attivo</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button onClick={handleSave}>
              Salva Modifiche
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditOvenModal;
