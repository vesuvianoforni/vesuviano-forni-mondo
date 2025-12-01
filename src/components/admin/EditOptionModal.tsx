import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

interface EditOptionModalProps {
  option: any;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EditOptionModal: React.FC<EditOptionModalProps> = ({ option, open, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: option?.name || '',
    type: option?.type || '',
    price: option?.price || 0,
    description: option?.description || '',
    is_active: option?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('configurator_options')
        .update({
          name: formData.name,
          type: formData.type,
          price: parseFloat(String(formData.price)),
          description: formData.description,
          is_active: formData.is_active,
        })
        .eq('id', option.id);

      if (error) throw error;

      toast.success('Opzione aggiornata con successo');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Errore aggiornamento opzione:', error);
      toast.error('Errore durante l\'aggiornamento dell\'opzione');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifica Opzione</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
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
            <Label htmlFor="description">Descrizione (opzionale)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {saving ? 'Salvataggio...' : 'Salva Modifiche'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOptionModal;
