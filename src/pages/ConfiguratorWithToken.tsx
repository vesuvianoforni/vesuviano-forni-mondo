import { useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Configurator from "./Configurator";
import { toast } from "sonner";

export default function ConfiguratorWithToken() {
  const { token } = useParams();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('configurator_sessions')
          .select('*')
          .eq('token', token)
          .single();

        if (error) throw error;

        if (data.is_used) {
          toast.error("Questo link è già stato utilizzato");
          setValid(false);
        } else {
          // Mark as used
          await supabase
            .from('configurator_sessions')
            .update({ is_used: true })
            .eq('id', data.id);

          setSession(data);
          setValid(true);
        }
      } catch (error) {
        console.error('Error validating token:', error);
        toast.error("Link non valido o scaduto");
        setValid(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!valid) {
    return <Navigate to="/" replace />;
  }

  return <Configurator sessionId={session?.id} />;
}