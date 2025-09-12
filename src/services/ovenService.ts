import { supabase } from '@/integrations/supabase/client';

export interface OvenData {
  name: string;
  category: 'mosaico' | 'gas' | 'legna';
  subcategory?: string;
  image_url: string;
  description?: string;
  specifications?: any;
}

export const ovenService = {
  // Get all ovens
  async getAll() {
    const { data, error } = await supabase
      .from('ovens')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get ovens by category
  async getByCategory(category: string) {
    const { data, error } = await supabase
      .from('ovens')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Add new oven
  async create(ovenData: OvenData) {
    const { data, error } = await supabase
      .from('ovens')
      .insert([ovenData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update oven
  async update(id: string, ovenData: Partial<OvenData>) {
    const { data, error } = await supabase
      .from('ovens')
      .update(ovenData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete oven
  async delete(id: string) {
    const { error } = await supabase
      .from('ovens')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Upload image to storage
  async uploadImage(file: File, fileName: string) {
    const { data, error } = await supabase.storage
      .from('oven-gallery')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from('oven-gallery')
      .getPublicUrl(fileName);

    return publicUrl.publicUrl;
  },

  // Initialize default ovens data
  async initializeDefaultOvens() {
    const defaultOvens: OvenData[] = [
      {
        name: 'Forno Mosaico Rosso',
        category: 'mosaico',
        subcategory: 'Rivestimento Ceramico',
        image_url: '/lovable-uploads/d8ae740a-0162-4627-9957-c270493577e3.png',
        description: 'Elegante forno con rivestimento a mosaico rosso, perfetto per esterni e terrazze',
        specifications: {
          diameter: '120cm',
          cooking_surface: 'Pietra refrattaria',
          max_temperature: '450°C',
          fuel_type: 'Legna'
        }
      },
      {
        name: 'Forno Mosaico Beige',
        category: 'mosaico',
        subcategory: 'Rivestimento Neutro',
        image_url: '/lovable-uploads/9d70e9e8-6075-4970-9315-6d928fece2da.png',
        description: 'Forno con elegante mosaico beige, si integra perfettamente in ogni ambiente',
        specifications: {
          diameter: '110cm',
          cooking_surface: 'Pietra refrattaria',
          max_temperature: '450°C',
          fuel_type: 'Legna'
        }
      },
      {
        name: 'Forno Mosaico Nero',
        category: 'mosaico',
        subcategory: 'Design Moderno',
        image_url: '/lovable-uploads/d3b23d88-fb1f-4fd5-a7db-581e1902a044.png',
        description: 'Design contemporaneo con mosaico nero, ideale per cucine moderne',
        specifications: {
          diameter: '100cm',
          cooking_surface: 'Pietra refrattaria',
          max_temperature: '450°C',
          fuel_type: 'Legna'
        }
      },
      {
        name: 'Forno Bianco Tradizionale',
        category: 'legna',
        subcategory: 'Stile Classico',
        image_url: '/lovable-uploads/fc010a6d-d23b-4cbd-8baf-f26de115b64c.png',
        description: 'Forno tradizionale bianco, perfetto per chi ama lo stile classico napoletano',
        specifications: {
          diameter: '130cm',
          cooking_surface: 'Pietra vulcanica',
          max_temperature: '500°C',
          fuel_type: 'Legna'
        }
      }
    ];

    // Check if ovens already exist
    const { data: existingOvens } = await supabase
      .from('ovens')
      .select('id')
      .limit(1);

    if (existingOvens && existingOvens.length === 0) {
      const { data, error } = await supabase
        .from('ovens')
        .insert(defaultOvens)
        .select();

      if (error) throw error;
      return data;
    }

    return existingOvens;
  }
};