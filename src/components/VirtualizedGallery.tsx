import React, { useState, useMemo, useCallback } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OptimizedImage from "@/components/optimized/OptimizedImage";
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface OvenItem {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  image_url: string;
  description?: string;
  specifications?: any;
  fuel_type?: string;
  coating_type?: string;
}

interface VirtualizedGalleryProps {
  ovens: OvenItem[];
  loading: boolean;
  selectedCategory?: string;
  selectedFuelType?: string;
  onCategoryChange?: (category: string) => void;
  onFuelTypeChange?: (fuelType: string) => void;
}

interface CellProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    items: OvenItem[];
    columnCount: number;
    onItemClick?: (item: OvenItem) => void;
  };
}

const OvenCell: React.FC<CellProps> = ({ columnIndex, rowIndex, style, data }) => {
  const { items, columnCount, onItemClick } = data;
  const index = rowIndex * columnCount + columnIndex;
  const item = items[index];

  if (!item) {
    return <div style={style} />;
  }

  return (
    <div style={{ ...style, padding: '8px' }}>
      <Card 
        className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-stone-200 hover:border-vesuviano-300 cursor-pointer h-full"
        onClick={() => onItemClick?.(item)}
      >
        <CardContent className="p-0 h-full flex flex-col">
          <div className="relative overflow-hidden h-48 flex-shrink-0">
            <OptimizedImage
              src={item.image_url}
              alt={`${item.name} - Forno artigianale Vesuviano`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <Badge 
                variant="secondary" 
                className="bg-white/90 text-vesuviano-700 hover:bg-vesuviano-50"
              >
                {item.category}
              </Badge>
            </div>
            
            {/* Fuel Type Badge */}
            {item.fuel_type && (
              <div className="absolute top-3 right-3">
                <Badge 
                  variant="outline" 
                  className="bg-white/90 border-stone-300 text-stone-700 text-xs"
                >
                  {item.fuel_type}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="font-playfair text-lg font-semibold text-charcoal-900 mb-2 line-clamp-2">
              {item.name}
            </h3>
            
            {item.subcategory && (
              <p className="text-sm text-vesuviano-600 font-medium mb-2">
                {item.subcategory}
              </p>
            )}
            
            <p className="text-sm text-stone-600 line-clamp-3 mb-3 flex-1">
              {item.description}
            </p>
            
            {/* Specifications */}
            {item.specifications && (
              <div className="text-xs text-stone-500 space-y-1">
                {item.specifications.diameter && (
                  <div className="flex justify-between">
                    <span>Diametro:</span>
                    <span className="font-medium">{item.specifications.diameter}</span>
                  </div>
                )}
                {item.specifications.max_temperature && (
                  <div className="flex justify-between">
                    <span>Temp. Max:</span>
                    <span className="font-medium">{item.specifications.max_temperature}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const VirtualizedGallery: React.FC<VirtualizedGalleryProps> = ({
  ovens,
  loading,
  selectedCategory = 'all',
  selectedFuelType = 'all',
  onCategoryChange,
  onFuelTypeChange,
}) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter items
  const filteredItems = useMemo(() => {
    return ovens.filter(item => {
      const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
      const fuelMatch = selectedFuelType === 'all' || 
                       (item.fuel_type && item.fuel_type.includes(selectedFuelType));
      return categoryMatch && fuelMatch;
    });
  }, [ovens, selectedCategory, selectedFuelType]);

  // Pagination
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Grid dimensions
  const getColumnCount = useCallback(() => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }, []);

  const [columnCount, setColumnCount] = useState(getColumnCount);
  const [containerWidth, setContainerWidth] = useState(1200);

  // Handle resize
  React.useEffect(() => {
    const handleResize = () => {
      setColumnCount(getColumnCount());
      const container = document.getElementById('gallery-container');
      if (container) {
        setContainerWidth(container.offsetWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getColumnCount]);

  const rowCount = Math.ceil(paginatedItems.length / columnCount);

  // Categories for filtering
  const categories = useMemo(() => {
    const cats = new Set(ovens.map(item => item.category));
    return ['all', ...Array.from(cats)];
  }, [ovens]);

  // Fuel types for filtering
  const fuelTypes = useMemo(() => {
    const types = new Set();
    ovens.forEach(item => {
      if (item.fuel_type) {
        item.fuel_type.split('/').forEach(type => types.add(type.trim()));
      }
    });
    return ['all', ...Array.from(types)];
  }, [ovens]);

  const handleItemClick = useCallback((item: OvenItem) => {
    // Handle item click - could open modal, navigate, etc.
    console.log('Item clicked:', item);
  }, []);

  if (loading) {
    return (
      <div className="py-20 bg-white">
        <div className="container mx-auto px-6 animate-pulse">
          <div className="text-center mb-16">
            <div className="h-8 bg-stone-200 rounded w-72 mx-auto mb-6"></div>
            <div className="h-6 bg-stone-200 rounded w-96 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-stone-200 rounded-2xl h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal-900 mb-6">
            Galleria dei Nostri Forni
          </h2>
          <p className="font-inter text-xl text-stone-600 max-w-3xl mx-auto mb-8">
            Ogni forno racconta una storia di passione, tradizione e innovazione. 
            Scopri l'artigianato napoletano che conquista il mondo.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category: string) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category 
                    ? "bg-vesuviano-500 text-white hover:bg-vesuviano-600 border-vesuviano-500" 
                    : "text-vesuviano-700 border-vesuviano-300 hover:bg-vesuviano-50"
                }`}
                onClick={() => onCategoryChange?.(category)}
              >
                {category === 'all' ? 'Tutti' : category}
              </Badge>
            ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {fuelTypes.map((fuelType: string) => (
              <Badge
                key={fuelType}
                variant={selectedFuelType === fuelType ? "default" : "outline"}
                className={`cursor-pointer px-3 py-1 text-xs transition-all duration-300 ${
                  selectedFuelType === fuelType 
                    ? "bg-stone-600 text-white" 
                    : "text-stone-600 border-stone-300 hover:bg-stone-50"
                }`}
                onClick={() => onFuelTypeChange?.(fuelType)}
              >
                {fuelType === 'all' ? 'Tutti i combustibili' : String(fuelType)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Virtualized Grid */}
        {isIntersecting && paginatedItems.length > 0 && (
          <div id="gallery-container" className="w-full">
            <Grid
              columnCount={columnCount}
              columnWidth={containerWidth / columnCount}
              height={Math.min(800, rowCount * 320)} // Max height with fallback
              rowCount={rowCount}
              rowHeight={320}
              width={containerWidth}
              itemData={{
                items: paginatedItems,
                columnCount,
                onItemClick: handleItemClick,
              }}
            >
              {OvenCell}
            </Grid>
          </div>
        )}

        {/* Pagination */}
        {filteredItems.length > itemsPerPage && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-vesuviano-500 text-white rounded-lg disabled:bg-stone-300 disabled:cursor-not-allowed hover:bg-vesuviano-600 transition-colors"
            >
              Precedente
            </button>
            
            <span className="text-stone-600">
              Pagina {currentPage} di {Math.ceil(filteredItems.length / itemsPerPage)}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => 
                Math.min(Math.ceil(filteredItems.length / itemsPerPage), prev + 1))
              }
              disabled={currentPage >= Math.ceil(filteredItems.length / itemsPerPage)}
              className="px-4 py-2 bg-vesuviano-500 text-white rounded-lg disabled:bg-stone-300 disabled:cursor-not-allowed hover:bg-vesuviano-600 transition-colors"
            >
              Successivo
            </button>
          </div>
        )}

        {/* No results */}
        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-stone-600 text-lg">
              Nessun forno trovato per i filtri selezionati.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default VirtualizedGallery;