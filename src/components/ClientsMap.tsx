
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const ClientsMap = () => {
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const clients = [
    // Italia - concentrazione principale
    { name: "Napoli", country: "Italia", lat: 40.8518, lng: 14.2681, count: 25, region: "italia" },
    { name: "Roma", country: "Italia", lat: 41.9028, lng: 12.4964, count: 18, region: "italia" },
    { name: "Milano", country: "Italia", lat: 45.4642, lng: 9.1900, count: 22, region: "italia" },
    { name: "Firenze", country: "Italia", lat: 43.7696, lng: 11.2558, count: 12, region: "italia" },
    { name: "Bologna", country: "Italia", lat: 44.4949, lng: 11.3426, count: 15, region: "italia" },
    { name: "Palermo", country: "Italia", lat: 38.1157, lng: 13.3615, count: 8, region: "italia" },
    { name: "Bari", country: "Italia", lat: 41.1171, lng: 16.8719, count: 10, region: "italia" },
    
    // Europa
    { name: "Parigi", country: "Francia", lat: 48.8566, lng: 2.3522, count: 6, region: "europa" },
    { name: "Barcellona", country: "Spagna", lat: 41.3851, lng: 2.1734, count: 4, region: "europa" },
    { name: "Berlino", country: "Germania", lat: 52.5200, lng: 13.4050, count: 3, region: "europa" },
    { name: "Londra", country: "Regno Unito", lat: 51.5074, lng: -0.1278, count: 5, region: "europa" },
    { name: "Amsterdam", country: "Paesi Bassi", lat: 52.3676, lng: 4.9041, count: 2, region: "europa" },
    
    // Mondo
    { name: "New York", country: "USA", lat: 40.7128, lng: -74.0060, count: 3, region: "mondo" },
    { name: "Città del Messico", country: "Messico", lat: 19.4326, lng: -99.1332, count: 2, region: "mondo" },
    { name: "Hong Kong", country: "Cina", lat: 22.3193, lng: 114.1694, count: 1, region: "mondo" },
    { name: "Tbilisi", country: "Georgia", lat: 41.7151, lng: 44.8271, count: 1, region: "mondo" },
    { name: "Città del Capo", country: "Sud Africa", lat: -33.9249, lng: 18.4241, count: 1, region: "mondo" },
  ];

  const getMarkerColor = (region: string) => {
    switch (region) {
      case "italia": return "#e11d48"; // vesuviano-500 equivalent
      case "europa": return "#3b82f6"; // blue-500
      case "mondo": return "#22c55e"; // green-500
      default: return "#6b7280"; // gray-500
    }
  };

  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      const loader = new Loader({
        apiKey: 'AIzaSyBFw0Qbyq9zTFTd-tUY6dQTuuCC3F_DqFi', // Chiave pubblica di esempio - sostituire con la propria
        version: 'weekly',
        libraries: ['maps', 'marker']
      });

      const { Map } = await loader.importLibrary('maps');
      
      const map = new Map(mapRef.current, {
        center: { lat: 41.9028, lng: 12.4964 }, // Centrato su Roma
        zoom: 4,
        styles: [
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#e9e9e9' }]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }]
          }
        ]
      });

      // Aggiungi marker per ogni cliente
      clients.forEach(client => {
        const marker = new google.maps.Marker({
          position: { lat: client.lat, lng: client.lng },
          map: map,
          title: `${client.name}, ${client.country} - ${client.count} clienti`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: Math.max(6, client.count / 3),
            fillColor: getMarkerColor(client.region),
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-weight: bold;">${client.name}</h3>
              <p style="margin: 0; color: #666;">${client.country}</p>
              <p style="margin: 4px 0 0 0; font-weight: bold; color: ${getMarkerColor(client.region)};">${client.count} clienti</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });

      setMapLoaded(true);
    } catch (error) {
      console.error('Errore nel caricamento della mappa:', error);
    }
  };

  useEffect(() => {
    initializeMap();
  }, []);

  return (
    <section id="clients-map" className="py-20 bg-gradient-to-br from-gray-50 to-stone-100">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-vesuviano-600 border-vesuviano-200">
              {t('clientsMap.badge', 'Presenza Globale')}
            </Badge>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal-900 mb-4">
              {t('clientsMap.title', 'I Nostri')} <span className="text-vesuviano-600">{t('clientsMap.titleHighlight', 'Clienti')}</span>
            </h2>
            <p className="font-inter text-lg text-stone-600 max-w-3xl mx-auto">
              {t('clientsMap.subtitle', 'Da Napoli al mondo intero: i forni Vesuviano portano il sapore autentico della tradizione napoletana in ogni angolo del pianeta.')}
            </p>
          </div>

          {/* Google Maps */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 mb-12">
            <div className="relative w-full h-96 md:h-[500px] bg-slate-100 rounded-xl border-2 border-stone-200 overflow-hidden">
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vesuviano-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Caricamento mappa...</p>
                  </div>
                </div>
              )}
              <div ref={mapRef} className="w-full h-full rounded-xl" />
            </div>

            {/* Legenda */}
            <div className="mt-8 flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
                <div className="w-4 h-4 bg-vesuviano-500 rounded-full"></div>
                <span className="text-sm font-medium text-stone-700">Italia ({clients.filter(c => c.region === 'italia').reduce((sum, c) => sum + c.count, 0)} clienti)</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-stone-700">Europa ({clients.filter(c => c.region === 'europa').reduce((sum, c) => sum + c.count, 0)} clienti)</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-stone-700">Mondo ({clients.filter(c => c.region === 'mondo').reduce((sum, c) => sum + c.count, 0)} clienti)</span>
              </div>
            </div>
          </div>

          {/* Statistiche */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-3xl font-bold text-vesuviano-600 mb-2">
                {clients.filter(c => c.region === 'italia').length}
              </div>
              <div className="text-stone-600">Città Italiane</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {clients.filter(c => c.region === 'europa').length}
              </div>
              <div className="text-stone-600">Paesi Europei</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {clients.filter(c => c.region === 'mondo').length}
              </div>
              <div className="text-stone-600">Continenti Extra-UE</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientsMap;
