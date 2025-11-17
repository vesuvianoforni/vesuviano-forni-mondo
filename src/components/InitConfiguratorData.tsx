import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Database } from 'lucide-react';

const InitConfiguratorData = () => {
  const [loading, setLoading] = useState(false);

  const handleInitialize = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('init-configurator-data');

      if (error) {
        console.error('Error initializing data:', error);
        throw error;
      }

      console.log('Initialization result:', data);
      toast.success(`Dati inizializzati con successo! ${data.ovens_count} forni e ${data.options_count} opzioni aggiunte.`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Errore nell\'inizializzazione dei dati');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Inizializza Configuratore
        </CardTitle>
        <CardDescription>
          Popola il database con i modelli di forni già presenti sul sito
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleInitialize} 
          disabled={loading}
          className="w-full"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {loading ? 'Inizializzazione in corso...' : 'Inizializza Dati'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default InitConfiguratorData;