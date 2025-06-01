
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';

const ClientsMap = () => {
  const { t } = useTranslation();

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

  const getMarkerSize = (count: number) => {
    if (count >= 20) return "w-6 h-6";
    if (count >= 10) return "w-5 h-5";
    if (count >= 5) return "w-4 h-4";
    return "w-3 h-3";
  };

  const getMarkerColor = (region: string) => {
    switch (region) {
      case "italia": return "bg-vesuviano-500";
      case "europa": return "bg-blue-500";
      case "mondo": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <section id="clients-map" className="py-20 bg-gradient-to-br from-gray-50 to-stone-100">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
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

          {/* Mappa Stilizzata */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 mb-12 overflow-hidden">
            {/* Sfondo mappa stilizzata */}
            <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-blue-100 via-green-50 to-blue-50 rounded-xl overflow-hidden">
              {/* Continenti stilizzati */}
              <div className="absolute inset-0">
                {/* Europa/Italia */}
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-32 h-24 bg-green-200 rounded-full opacity-30"></div>
                {/* Nord America */}
                <div className="absolute top-12 left-1/4 w-28 h-32 bg-blue-200 rounded-lg opacity-30"></div>
                {/* Asia */}
                <div className="absolute top-8 right-1/4 w-36 h-28 bg-yellow-200 rounded-full opacity-30"></div>
                {/* Africa */}
                <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-20 h-32 bg-orange-200 rounded-lg opacity-30"></div>
              </div>

              {/* Markers dei clienti */}
              {clients.map((client, index) => {
                // Posizionamento relativo basato su coordinate semplificate
                const left = ((client.lng + 180) / 360) * 100;
                const top = ((90 - client.lat) / 180) * 100;
                
                return (
                  <div
                    key={index}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${getMarkerSize(client.count)} ${getMarkerColor(client.region)} rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-all duration-300 animate-pulse`}
                    style={{ 
                      left: `${Math.max(5, Math.min(95, left))}%`, 
                      top: `${Math.max(5, Math.min(95, top))}%`,
                      animationDelay: `${index * 0.1}s`
                    }}
                    title={`${client.name}, ${client.country} - ${client.count} clienti`}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="w-2 h-2 text-white" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="mt-8 flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-vesuviano-500 rounded-full"></div>
                <span className="text-sm font-medium text-stone-700">Italia ({clients.filter(c => c.region === 'italia').reduce((sum, c) => sum + c.count, 0)} clienti)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-stone-700">Europa ({clients.filter(c => c.region === 'europa').reduce((sum, c) => sum + c.count, 0)} clienti)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-stone-700">Mondo ({clients.filter(c => c.region === 'mondo').reduce((sum, c) => sum + c.count, 0)} clienti)</span>
              </div>
            </div>
          </div>

          {/* Statistiche */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-vesuviano-600 mb-2">
                {clients.filter(c => c.region === 'italia').length}
              </div>
              <div className="text-stone-600">Città Italiane</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {clients.filter(c => c.region === 'europa').length}
              </div>
              <div className="text-stone-600">Paesi Europei</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-lg">
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
