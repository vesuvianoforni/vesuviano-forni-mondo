import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

interface AddOptionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddOptionModal: React.FC<AddOptionModalProps> = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    price: 0,
    description: '',
    diameter: null as number | null,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('configurator_options')
        .insert({
          name: formData.name,
          type: formData.type,
          price: parseFloat(String(formData.price)),
          description: formData.description,
          diameter: formData.diameter ? parseInt(String(formData.diameter)) : null,
          is_active: formData.is_active,
        });

      if (error) throw error;

      toast.success('Opzione creata con successo');
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        type: '',
        price: 0,
        description: '',
        diameter: null,
        is_active: true,
      });
    } catch (error) {
      console.error('Errore creazione opzione:', error);
      toast.error('Errore durante la creazione dell\'opzione');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aggiungi Nuova Opzione</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="es: Spedizione in Europa"
            />
          </div>

          <div>
            <Label htmlFor="type">Tipo</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
              placeholder="es: shipping, on_site_installation"
            />
          </div>

          <div>
            <Label htmlFor="price">Prezzo (€)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div>
            <Label htmlFor="diameter">Diametro (cm) - opzionale</Label>
            <Input
              id="diameter"
              type="number"
              value={formData.diameter || ''}
              onChange={(e) => setFormData({ ...formData, diameter: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="Lascia vuoto per tutti i diametri"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Specifica un diametro per opzioni specifiche (es: 80, 100, 120, 130)
            </p>
          </div>

          <div>
            <Label htmlFor="description">Descrizione (opzionale)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrizione dell'opzione"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Attivo</Label>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Creazione...' : 'Crea Opzione'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddOptionModal;
