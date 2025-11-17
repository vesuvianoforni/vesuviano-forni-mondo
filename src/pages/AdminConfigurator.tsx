import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import InitConfiguratorData from '@/components/InitConfiguratorData';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const AdminConfigurator = () => {
  const [ovens, setOvens] = useState([]);
  const [options, setOptions] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [ovensResult, optionsResult, quotesResult] = await Promise.all([
        supabase.from('configurator_ovens').select('*').order('created_at', { ascending: false }),
        supabase.from('configurator_options').select('*').order('created_at', { ascending: false }),
        supabase.from('configurator_quotes').select('*').order('created_at', { ascending: false })
      ]);
      setOvens(ovensResult.data || []);
      setOptions(optionsResult.data || []);
      setQuotes(quotesResult.data || []);
    } catch (error) {
      toast.error('Errore caricamento');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Gestione Configuratore</h1>
        {ovens.length === 0 && <InitConfiguratorData />}
        <Tabs defaultValue="ovens">
          <TabsList className="mb-6">
            <TabsTrigger value="ovens">Forni ({ovens.length})</TabsTrigger>
            <TabsTrigger value="options">Opzioni ({options.length})</TabsTrigger>
            <TabsTrigger value="quotes">Preventivi ({quotes.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="ovens">
            <Card>
              <CardHeader><CardTitle>Forni Configurabili</CardTitle></CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Immagine</TableHead>
                    <TableHead>Modello</TableHead>
                    <TableHead>Alimentazione</TableHead>
                    <TableHead>Diametro</TableHead>
                    <TableHead>Capacità</TableHead>
                    <TableHead>Prezzo</TableHead>
                    <TableHead>Stato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ovens.map((oven: any) => (
                    <TableRow key={oven.id}>
                      <TableCell>
                        {oven.image_url && (
                          <img src={oven.image_url} alt={oven.model_name} className="w-16 h-16 object-cover rounded" />
                        )}
                      </TableCell>
                      <TableCell>{oven.model_name}</TableCell>
                      <TableCell>{oven.fuel_type}</TableCell>
                      <TableCell>{oven.diameter}cm</TableCell>
                      <TableCell>{oven.pizza_capacity}</TableCell>
                      <TableCell>€{oven.base_price}</TableCell>
                      <TableCell><Badge variant={oven.is_active ? 'default' : 'secondary'}>{oven.is_active ? 'Attivo' : 'Inattivo'}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          <TabsContent value="options">
            <Card>
              <CardHeader><CardTitle>Opzioni Disponibili</CardTitle></CardHeader>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Nome</TableHead><TableHead>Tipo</TableHead><TableHead>Prezzo</TableHead><TableHead>Stato</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {options.map((opt: any) => (
                    <TableRow key={opt.id}>
                      <TableCell>{opt.name}</TableCell>
                      <TableCell>{opt.type}</TableCell>
                      <TableCell>€{opt.price}</TableCell>
                      <TableCell><Badge variant={opt.is_active ? 'default' : 'secondary'}>{opt.is_active ? 'Attivo' : 'Inattivo'}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          <TabsContent value="quotes">
            <Card>
              <CardHeader><CardTitle>Preventivi Ricevuti</CardTitle></CardHeader>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Data</TableHead><TableHead>Cliente</TableHead><TableHead>Totale</TableHead><TableHead>Stato</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote: any) => (
                    <TableRow key={quote.id}>
                      <TableCell>{new Date(quote.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{quote.customer_name || 'N/A'}</TableCell>
                      <TableCell>€{quote.total_price}</TableCell>
                      <TableCell><Badge>{quote.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminConfigurator;