import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, RefreshCw } from "lucide-react";

export const SessionLinksManager = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const generateLink = async () => {
    setLoading(true);
    try {
      const token = generateToken();
      const { data, error } = await supabase
        .from('configurator_sessions')
        .insert({
          token,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/configuratore/${token}`;
      await navigator.clipboard.writeText(link);
      
      toast.success("Link generato e copiato negli appunti!");
      loadSessions();
    } catch (error) {
      console.error('Error generating link:', error);
      toast.error("Errore nella generazione del link");
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('configurator_sessions')
        .select('*, configurator_quotes(*)')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const copyLink = async (token: string) => {
    const link = `${window.location.origin}/configuratore/${token}`;
    await navigator.clipboard.writeText(link);
    toast.success("Link copiato!");
  };

  const regenerateLink = async (sessionId: string) => {
    try {
      const newToken = generateToken();
      const { error } = await supabase
        .from('configurator_sessions')
        .update({ token: newToken, is_used: false })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success("Link rigenerato!");
      loadSessions();
    } catch (error) {
      console.error('Error regenerating link:', error);
      toast.error("Errore nella rigenerazione del link");
    }
  };

  useState(() => {
    loadSessions();
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      configured: "bg-blue-500/10 text-blue-500",
      interested: "bg-green-500/10 text-green-500",
      completed: "bg-primary/10 text-primary"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || colors.draft}`}>
        {status}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestione Link Configuratore</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={generateLink} disabled={loading} className="w-full">
          Genera Nuovo Link
        </Button>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Link Recenti</h3>
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusBadge(session.status)}
                  <span className="text-xs text-muted-foreground">
                    {new Date(session.created_at).toLocaleString('it-IT')}
                  </span>
                </div>
                {session.is_used && (
                  <p className="text-xs text-muted-foreground">Utilizzato</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyLink(session.token)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => regenerateLink(session.id)}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};