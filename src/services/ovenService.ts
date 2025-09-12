import { supabase } from '@/integrations/supabase/client';

export interface OvenData {
  name: string;
  category: 'mosaico' | 'misto' | 'legna';
  subcategory?: string;
  image_url: string;
  description?: string;
  specifications?: any;
  fuel_type?: 'gas/legna' | 'gas/legna/elettrico';
  coating_type?: 'mosaico' | 'verniciato' | 'metallico';
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
      },
        {
          name: 'Terra del Gusto Arancione',
          category: 'misto',
          subcategory: 'Verniciato Premium',
          image_url: '/lovable-uploads/forno-arancione-terra-del-gusto.png',
          description: 'Forno verniciato arancione con design moderno "Terra del Gusto", perfetto per gas e legna',
          fuel_type: 'gas/legna',
          coating_type: 'verniciato',
          specifications: {
            diameter: '120cm',
            cooking_surface: 'Pietra refrattaria',
            max_temperature: '480°C',
            fuel_type: 'Gas/Legna'
          }
        },
        {
          name: 'Forno Metallo Nero Professional',
          category: 'misto',
          subcategory: 'Rivestimento Metallo',
          image_url: '/lovable-uploads/forno-metallo-nero.png',
          description: 'Forno professionale con rivestimento in metallo nero, ideale per gas, legna ed elettrico',
          fuel_type: 'gas/legna/elettrico',
          coating_type: 'metallico',
          specifications: {
            diameter: '110cm',
            cooking_surface: 'Pietra refrattaria',
            max_temperature: '500°C',
            fuel_type: 'Gas/Legna/Elettrico'
          }
        },
        {
          name: 'Forno Metallo Bianco Design',
          category: 'misto',
          subcategory: 'Rivestimento Metallo',
          image_url: '/lovable-uploads/forno-metallo-bianco.png',
          description: 'Forno dal design elegante con rivestimento metallico bianco, versatile per ogni combustibile',
          fuel_type: 'gas/legna/elettrico',
          coating_type: 'metallico',
          specifications: {
            diameter: '100cm',
            cooking_surface: 'Pietra refrattaria',
            max_temperature: '480°C',
            fuel_type: 'Gas/Legna/Elettrico'
          }
        },
      {
        name: 'VesuvioBuono Mosaico Verde',
        category: 'legna',
        subcategory: 'VesuvioBuono Professional',
        image_url: '/lovable-uploads/vesuviobuono-verde-mosaico.jpg',
        description: 'Forno professionale VesuvioBuono con rivestimento a mosaico verde, ideale per pizzerie e ristoranti',
        specifications: {
          diameter: '120cm',
          cooking_surface: 'Pietra refrattaria',
          max_temperature: '500°C',
          fuel_type: 'Legna'
        }
      },
      {
        name: 'VesuvioBuono Mosaico Marrone',
        category: 'legna',
        subcategory: 'VesuvioBuono Professional',
        image_url: '/lovable-uploads/vesuviobuono-marrone-completo.jpg',
        description: 'Forno VesuvioBuono con elegante mosaico marrone, dotato di sistema di combustione avanzato',
        specifications: {
          diameter: '130cm',
          cooking_surface: 'Pietra refrattaria',
          max_temperature: '500°C',
          fuel_type: 'Legna'
        }
      },
      {
        name: 'VesuvioBuono Osteria Pizza',
        category: 'legna',
        subcategory: 'Linea Osteria',
        image_url: '/lovable-uploads/vesuviobuono-osteria-pizza.jpg',
        description: 'Forno della linea Osteria con mosaico sfumato, perfetto per l\'uso commerciale intensivo',
        specifications: {
          diameter: '140cm',
          cooking_surface: 'Pietra vulcanica',
          max_temperature: '520°C',
          fuel_type: 'Legna'
        }
      },
        {
          name: 'Forno Mosaico Rosso Premium',
          category: 'mosaico',
          subcategory: 'Doppia Alimentazione',
          image_url: '/lovable-uploads/forno-mosaico-rosso.jpg',
          description: 'Elegante forno con rivestimento a mosaico rosso, perfetto per ristoranti e location di prestigio. Doppia alimentazione legna e gas.',
          fuel_type: 'gas/legna',
          coating_type: 'mosaico',
          specifications: {
            diameter: '120cm',
            cooking_surface: 'Pietra refrattaria',
            max_temperature: '480°C',
            fuel_type: 'Gas/Legna'
          }
        },
        {
          name: 'Forno Mosaico Nero & Beige',
          category: 'mosaico',
          subcategory: 'Design Contemporaneo',
          image_url: '/lovable-uploads/forno-mosaico-nero-beige.jpg',
          description: 'Design sofisticato con mosaico nero e beige, ideale per ambienti contemporanei e di alta classe. Versatile per legna e gas.',
          fuel_type: 'gas/legna',
          coating_type: 'mosaico',
          specifications: {
            diameter: '110cm',
            cooking_surface: 'Pietra refrattaria',
            max_temperature: '470°C',
            fuel_type: 'Gas/Legna'
          }
        },
        {
          name: 'Forno Mosaico Grigio & Nero',
          category: 'mosaico',
          subcategory: 'Design Moderno',
          image_url: '/lovable-uploads/forno-mosaico-grigio-nero.jpg',
          description: 'Forno dal design moderno con mosaico grigio e nero, perfetto per ambienti contemporanei. Doppia alimentazione legna e gas.',
          fuel_type: 'gas/legna',
          coating_type: 'mosaico',
          specifications: {
            diameter: '100cm',
            cooking_surface: 'Pietra refrattaria',
            max_temperature: '460°C',
            fuel_type: 'Gas/Legna'
          }
        },
        {
          name: 'Forno Mosaico Bianco Elegante',
          category: 'mosaico',
          subcategory: 'Stile Classico',
          image_url: '/lovable-uploads/forno-mosaico-bianco.jpg',
          description: 'Elegante forno con rivestimento a mosaico bianco, ideale per ogni ambiente. Versatile per legna e gas.',
          fuel_type: 'gas/legna',
          coating_type: 'mosaico',
          specifications: {
            diameter: '110cm',
            cooking_surface: 'Pietra refrattaria',
            max_temperature: '470°C',
            fuel_type: 'Gas/Legna'
          }
        }
    ];

    // Sync defaults via Edge Function (runs with service role)
    const { error } = await supabase.functions.invoke('sync-ovens', {
      body: { ovens: defaultOvens }
    });
    if (error) throw error;

    // Return full, updated list
    const { data: all } = await supabase
      .from('ovens')
      .select('*')
      .order('created_at', { ascending: false });

    return all || [];
  }
};