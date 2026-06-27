import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, TrendingUp, Package, Flame, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';

const ERPDashboard = () => {
  const navigate = useNavigate();

  const cards = [
    { title: 'CRM Configuratore', desc: 'Gestisci lead e sessioni', icon: Users, color: 'text-blue-400', bg: 'bg-blue-900/20', url: '/erp/crm' },
    { title: 'Pro-Forma', desc: 'Preventivi per clienti', icon: FileText, color: 'text-amber-400', bg: 'bg-amber-900/20', url: '/erp/proforma' },
    { title: 'Forni', desc: 'Catalogo e configurazione', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-900/20', url: '/erp/forni' },
    { title: 'Bruciatori', desc: 'Gestione bruciatori', icon: Package, color: 'text-green-400', bg: 'bg-green-900/20', url: '/erp/bruciatori' },
    { title: 'Lead Sito Web', desc: 'Richieste dal sito', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-900/20', url: '/erp/leads' },
    { title: 'Ordini', desc: 'Stato ordini e spedizioni', icon: CreditCard, color: 'text-cyan-400', bg: 'bg-cyan-900/20', url: '/erp/ordini' },
  ];

  return (

    <>
      <SEOHead title="ERP Dashboard | Vesuviano" description="Dashboard gestionale Vesuviano." lang="it" noIndex />
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-100">Dashboard</h1>
        <p className="text-gray-400 mt-1">Benvenuto nel gestionale Vesuviano</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card
            key={card.title}
            className="bg-[#1a1a1a] border-amber-900/20 cursor-pointer hover:border-amber-700/40 transition-all group"
            onClick={() => navigate(card.url)}
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className={`p-3 rounded-xl ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div>
                <CardTitle className="text-amber-100 text-lg group-hover:text-amber-50">{card.title}</CardTitle>
                <p className="text-gray-500 text-sm">{card.desc}</p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
    </>
  );
};

export default ERPDashboard;
