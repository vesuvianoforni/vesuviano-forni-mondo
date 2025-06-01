
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';

const ClientsMap = () => {
  const { t } = useTranslation();

  const clients = [
    // Italia - concentrazione principale
    { name: "Napoli", country: "Italia", x: 52, y: 35, count: 25, region: "italia" },
    { name: "Roma", country: "Italia", x: 51, y: 40, count: 18, region: "italia" },
    { name: "Milano", country: "Italia", x: 49, y: 32, count: 22, region: "italia" },
    { name: "Firenze", country: "Italia", x: 50, y: 37, count: 12, region: "italia" },
    { name: "Bologna", country: "Italia", x: 50, y: 34, count: 15, region: "italia" },
    { name: "Palermo", country: "Italia", x: 52, y: 48, count: 8, region: "italia" },
    { name: "Bari", country: "Italia", x: 55, y: 42, count: 10, region: "italia" },
    
    // Europa
    { name: "Parigi", country: "Francia", x: 45, y: 30, count: 6, region: "europa" },
    { name: "Barcellona", country: "Spagna", x: 42, y: 40, count: 4, region: "europa" },
    { name: "Berlino", country: "Germania", x: 52, y: 25, count: 3, region: "europa" },
    { name: "Londra", country: "Regno Unito", x: 43, y: 25, count: 5, region: "europa" },
    { name: "Amsterdam", country: "Paesi Bassi", x: 48, y: 25, count: 2, region: "europa" },
    
    // Mondo
    { name: "New York", country: "USA", x: 20, y: 30, count: 3, region: "mondo" },
    { name: "Città del Messico", country: "Messico", x: 15, y: 45, count: 2, region: "mondo" },
    { name: "Hong Kong", country: "Cina", x: 80, y: 40, count: 1, region: "mondo" },
    { name: "Tbilisi", country: "Georgia", x: 62, y: 32, count: 1, region: "mondo" },
    { name: "Città del Capo", country: "Sud Africa", x: 55, y: 75, count: 1, region: "mondo" },
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

          {/* Mappa Stilizzata */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 mb-12">
            {/* Contenitore mappa con altezza fissa */}
            <div className="relative w-full h-96 md:h-[500px] bg-slate-100 rounded-xl border-2 border-stone-200 overflow-hidden">
              {/* Continenti stilizzati - forme più semplici e statiche */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice">
                {/* Europa */}
                <ellipse cx="50" cy="25" rx="15" ry="8" fill="#e5e7eb" opacity="0.6"/>
                {/* Nord America */}
                <ellipse cx="20" cy="20" rx="12" ry="15" fill="#e5e7eb" opacity="0.6"/>
                {/* Asia */}
                <ellipse cx="75" cy="25" rx="18" ry="12" fill="#e5e7eb" opacity="0.6"/>
                {/* Africa */}
                <ellipse cx="52" cy="45" rx="8" ry="12" fill="#e5e7eb" opacity="0.6"/>
                {/* Sud America */}
                <ellipse cx="25" cy="50" rx="6" ry="10" fill="#e5e7eb" opacity="0.6"/>
              </svg>

              {/* Markers dei clienti */}
              {clients.map((client, index) => (
                <div
                  key={index}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${getMarkerSize(client.count)} ${getMarkerColor(client.region)} rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200 z-10 flex items-center justify-center`}
                  style={{ 
                    left: `${client.x}%`, 
                    top: `${client.y}%`,
                  }}
                  title={`${client.name}, ${client.country} - ${client.count} clienti`}
                >
                  <MapPin className="w-2 h-2 md:w-3 md:h-3 text-white" />
                </div>
              ))}
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
