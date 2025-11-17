import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import InitConfiguratorData from '@/components/InitConfiguratorData';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import EditOvenModal from '@/components/admin/EditOvenModal';
import { LogOut, Edit } from 'lucide-react';

const AdminConfigurator = () => {
  const navigate = useNavigate();
  const [ovens, setOvens] = useState([]);
  const [options, setOptions] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingOven, setEditingOven] = useState<any>(null);

  useEffect(() => { 
    checkAuth(); 
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate('/admin/login');
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roles) {
      toast.error('Non hai i permessi di amministratore');
      navigate('/admin/login');
      return;
    }

    setIsAuthenticated(true);
    fetchData();
  };

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading || !isAuthenticated) return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestione Configuratore</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
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
                    <TableHead>Azioni</TableHead>
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
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => setEditingOven(oven)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
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
      {editingOven && (
        <EditOvenModal
          oven={editingOven}
          open={!!editingOven}
          onClose={() => setEditingOven(null)}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
};

export default AdminConfigurator;