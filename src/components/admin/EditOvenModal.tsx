import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Plus, Trash2 } from 'lucide-react';

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

interface SizeOption {
  diameter: number;
  pizza_capacity: string;
  prices: {
    listA: { base: number; gas: number; electric: number; installation: number };
    listB: { base: number; gas: number; electric: number; installation: number };
    listC: { base: number; gas: number; electric: number; installation: number };
  };
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
    coatings: [] as Coating[],
    sizes: [] as SizeOption[],
    is_active: true,
  });

  const [newSize, setNewSize] = useState<SizeOption>({
    diameter: 0,
    pizza_capacity: "",
    prices: {
      listA: { base: 0, gas: 0, electric: 0, installation: 0 },
      listB: { base: 0, gas: 0, electric: 0, installation: 0 },
      listC: { base: 0, gas: 0, electric: 0, installation: 0 }
    }
  });

  useEffect(() => {
    if (open && oven) {
      let sizes = oven.sizes || [];
      if (sizes.length === 0 && oven.diameter) {
        sizes = [{
          diameter: oven.diameter,
          pizza_capacity: oven.pizza_capacity || "",
          prices: {
            listA: { base: oven.base_price_a || 0, gas: oven.gas_price_a || 0, electric: oven.electric_price_a || 0, installation: oven.installation_price_a || 0 },
            listB: { base: oven.base_price_b || 0, gas: oven.gas_price_b || 0, electric: oven.electric_price_b || 0, installation: oven.installation_price_b || 0 },
            listC: { base: oven.base_price_c || 0, gas: oven.gas_price_c || 0, electric: oven.electric_price_c || 0, installation: oven.installation_price_c || 0 }
          }
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
        coatings: (oven.coatings || []) as Coating[],
        sizes: sizes,
        is_active: oven.is_active,
      });
    }
  }, [open, oven]);

  const addSize = () => {
    if (!newSize.diameter || !newSize.pizza_capacity) return;
    setFormData(prev => ({ ...prev, sizes: [...prev.sizes, newSize] }));
    setNewSize({ diameter: 0, pizza_capacity: "", prices: { listA: { base: 0, gas: 0, electric: 0, installation: 0 }, listB: { base: 0, gas: 0, electric: 0, installation: 0 }, listC: { base: 0, gas: 0, electric: 0, installation: 0 } }});
  };

  const handleSave = async () => {
    const { error } = await supabase.from('configurator_ovens').update({
      ...formData,
      coatings: formData.coatings as any,
      sizes: formData.sizes as any,
      diameter: formData.sizes[0]?.diameter || 0,
      pizza_capacity: formData.sizes[0]?.pizza_capacity || "",
    }).eq('id', oven.id);
    
    if (!error) {
      toast.success("Forno aggiornato!");
      onUpdate();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Modifica Forno</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Button onClick={handleSave}>Salva</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditOvenModal;
