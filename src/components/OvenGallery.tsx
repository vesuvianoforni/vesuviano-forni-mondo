import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import { Loader2 } from "lucide-react";

interface Oven {
  id: string;
  name: string;
  category: string;
  subcategory?: string | null;
  image_url: string;
  description?: string | null;
  specifications?: any;
  fuel_type?: string | null;
  coating_type?: string | null;
  created_at: string;
  updated_at: string;
}

const OvenGallery = () => {
  const { t } = useTranslation();
  const [ovens, setOvens] = useState<Oven[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCoating, setSelectedCoating] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'Tutti i Forni', color: 'bg-stone-100 text-stone-800' },
    { value: 'mosaico', label: 'Forni Mosaico', color: 'bg-vesuviano-100 text-vesuviano-800' },
    { value: 'gas', label: 'Forni a Gas', color: 'bg-blue-100 text-blue-800' },
    { value: 'legna', label: 'Forni a Legna', color: 'bg-green-100 text-green-800' }
  ];

  const coatingTypes = [
    { value: 'all', label: 'Tutti i Rivestimenti', color: 'bg-gray-100 text-gray-800' },
    { value: 'mosaico', label: 'Rivestimento Mosaico', color: 'bg-amber-100 text-amber-800' },
    { value: 'verniciato', label: 'Rivestimento Verniciato', color: 'bg-orange-100 text-orange-800' },
    { value: 'metallico', label: 'Rivestimento Metallico', color: 'bg-slate-100 text-slate-800' }
  ];

  useEffect(() => {
    fetchOvens();
  }, []);

  const fetchOvens = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ovens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOvens(data || []);
    } catch (error) {
      console.error('Error fetching ovens:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOvens = ovens.filter(oven => {
    const categoryMatch = selectedCategory === 'all' || oven.category === selectedCategory;
    const coatingMatch = selectedCoating === 'all' || oven.coating_type === selectedCoating;
    return categoryMatch && coatingMatch;
  });

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.value === category) || categories[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-vesuviano-600" />
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-stone-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-stone-800 mb-4">
            La Nostra Collezione di Forni
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Scopri la nostra selezione di forni artigianali, classificati per tipologia e caratteristiche tecniche
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-stone-700 mb-3 text-center">Filtra per Combustibile</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="transition-all duration-300"
              >
                {category.label}
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-white/20"
                >
                  {category.value === 'all' ? ovens.length : ovens.filter(o => o.category === category.value).length}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Coating Type Filters */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-stone-700 mb-3 text-center">Filtra per Rivestimento</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {coatingTypes.map((coating) => (
              <Button
                key={coating.value}
                variant={selectedCoating === coating.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCoating(coating.value)}
                className="transition-all duration-300"
              >
                {coating.label}
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-white/20"
                >
                  {coating.value === 'all' ? ovens.length : ovens.filter(o => o.coating_type === coating.value).length}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Ovens Grid */}
        {filteredOvens.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-500 text-lg">Nessun forno trovato per questa categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOvens.map((oven) => {
              const categoryInfo = getCategoryInfo(oven.category);
              
              return (
                <Card 
                  key={oven.id} 
                  className="group hover:shadow-xl transition-all duration-300 border-stone-200 hover:border-vesuviano-300"
                >
                  <CardHeader className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg aspect-square bg-white">
                      <img
                        src={oven.image_url}
                        alt={oven.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-white"
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {oven.fuel_type && (
                          <Badge className="bg-blue-500 text-white text-xs">
                            a {oven.fuel_type.charAt(0).toUpperCase() + oven.fuel_type.slice(1)}
                          </Badge>
                        )}
                        {oven.coating_type && (
                          <Badge className="bg-amber-500 text-white text-xs">
                            {oven.coating_type.charAt(0).toUpperCase() + oven.coating_type.slice(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-playfair text-stone-800 mb-2 group-hover:text-vesuviano-700 transition-colors">
                      {oven.name}
                    </CardTitle>
                    
                    {oven.description && (
                      <p className="text-stone-600 text-sm mb-3 line-clamp-2">
                        {oven.description}
                      </p>
                    )}

                    {oven.subcategory && (
                      <div className="mb-3">
                        <Badge variant="outline" className="text-xs">
                          {oven.subcategory}
                        </Badge>
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full group-hover:bg-vesuviano-600 group-hover:text-white group-hover:border-vesuviano-600 transition-all"
                    >
                      Dettagli Tecnici
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12 p-8 bg-vesuviano-50 rounded-2xl border border-vesuviano-100">
          <h3 className="font-playfair text-2xl font-bold text-stone-800 mb-4">
            Hai bisogno di una consulenza personalizzata?
          </h3>
          <p className="text-stone-600 mb-6 max-w-xl mx-auto">
            I nostri esperti sono a disposizione per aiutarti a scegliere il forno più adatto alle tue esigenze
          </p>
          <Button size="lg" className="bg-vesuviano-600 hover:bg-vesuviano-700">
            Contatta un Esperto
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OvenGallery;