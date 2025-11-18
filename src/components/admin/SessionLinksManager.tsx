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

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [priceList, setPriceList] = useState("A");
  const [showForm, setShowForm] = useState(false);

  const generateLink = async () => {
    if (!customerName || !customerEmail || !customerPhone) {
      toast.error("Compila tutti i campi del cliente");
      return;
    }

    setLoading(true);
    try {
      const token = generateToken();
      const { data, error } = await supabase
        .from('configurator_sessions')
        .insert({
          token,
          status: 'draft',
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          price_list: priceList
        })
        .select()
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/configuratore/${token}`;
      await navigator.clipboard.writeText(link);
      
      toast.success("Link generato e copiato negli appunti!");
      setShowForm(false);
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setPriceList("A");
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
        {!showForm ? (
          <Button onClick={() => setShowForm(true)} disabled={loading} className="w-full">
            Genera Nuovo Link
          </Button>
        ) : (
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Nuovo Link Configuratore</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Nome Cliente *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="Mario Rossi"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email Cliente *</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="mario@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Telefono Cliente *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="+39 123 456 7890"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Listino Prezzi</label>
                <select
                  value={priceList}
                  onChange={(e) => setPriceList(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="A">Listino A</option>
                  <option value="B">Listino B</option>
                  <option value="C">Listino C</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={generateLink} disabled={loading} className="flex-1">
                Genera Link
              </Button>
              <Button 
                onClick={() => {
                  setShowForm(false);
                  setCustomerName("");
                  setCustomerEmail("");
                  setCustomerPhone("");
                  setPriceList("A");
                }} 
                variant="outline"
              >
                Annulla
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Link Recenti</h3>
          {sessions.map((session) => (
            <div key={session.id} className="flex flex-col p-3 border rounded-lg gap-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(session.status)}
                    <span className="text-xs font-semibold text-primary">
                      Listino {session.price_list}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{session.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{session.customer_email}</p>
                  <p className="text-xs text-muted-foreground">{session.customer_phone}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Creato: {new Date(session.created_at).toLocaleString('it-IT')}
                  </p>
                  {session.is_used && (
                    <p className="text-xs text-green-600 font-medium mt-1">✓ Link utilizzato</p>
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};