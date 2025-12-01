import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";
import { syncEventToERP } from "@/services/erpSyncService";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    company_name: "",
    vat_number: "",
    billing_address: "",
    delivery_address: "",
    final_notes: "",
  });

  useEffect(() => {
    if (!sessionId) {
      toast.error("Sessione di pagamento non valida");
      navigate("/");
      return;
    }

    verifyPayment();
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: { sessionId },
      });

      if (error) throw error;

      if (data.success) {
        setQuote(data.quote);
        setPaymentInfo(data.session);
        setVerified(true);

        // Get session ID from quote to sync payment completion to ERP
        if (data.quote?.id) {
          // Find session associated with this quote
          const { data: sessionData } = await supabase
            .from('configurator_sessions')
            .select('id')
            .eq('quote_id', data.quote.id)
            .single();

          if (sessionData?.id) {
            // Sync payment completion to ERP
            syncEventToERP({
              session_id: sessionData.id,
              event_type: 'payment_completed',
              event_data: {
                quoteId: data.quote.id,
                totalPrice: data.quote.total_price,
                stripeSessionId: sessionId
              }
            });
          }
        }
      } else {
        toast.error("Pagamento non completato");
        navigate("/");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error("Errore nella verifica del pagamento");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("configurator_quotes")
        .update({
          company_name: formData.company_name,
          vat_number: formData.vat_number,
          billing_address: formData.billing_address,
          delivery_address: formData.delivery_address,
          final_notes: formData.final_notes,
          status: "confirmed",
        })
        .eq("id", quote.id);

      if (error) throw error;

      toast.success("Ordine confermato! Ti contatteremo a breve.");
      navigate("/thank-you");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Errore nel salvataggio dei dati");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Verifica pagamento in corso...</p>
        </div>
      </div>
    );
  }

  if (!verified || !quote) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
          <h1 className="text-4xl font-bold text-foreground">Pagamento Completato!</h1>
          <p className="text-xl text-muted-foreground">
            Grazie per il tuo acconto. Il tuo ordine è stato registrato.
          </p>
        </div>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Riepilogo Ordine</CardTitle>
            <CardDescription>Dettagli del tuo acquisto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Cliente</p>
                <p className="font-medium">{quote.customer_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{quote.customer_email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Telefono</p>
                <p className="font-medium">{quote.customer_phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Importo Pagato (Acconto)</p>
                <p className="font-medium text-green-600">
                  €{((paymentInfo.amount_total || 0) / 100).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Totale Ordine</p>
                <p className="font-medium">€{parseFloat(quote.total_price).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Saldo da Pagare</p>
                <p className="font-medium">
                  €{(parseFloat(quote.total_price) - (paymentInfo.amount_total || 0) / 100).toFixed(2)}
                </p>
              </div>
            </div>
            
            {quote.notes && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Note ordine</p>
                <p className="text-sm">{quote.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Final Details Form */}
        <Card>
          <CardHeader>
            <CardTitle>Completa i Dati dell'Ordine</CardTitle>
            <CardDescription>
              Inserisci i dati per la fatturazione e la consegna
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Ragione Sociale / Nome Azienda</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="Es: Pizzeria Da Mario SRL"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vat_number">Partita IVA</Label>
                  <Input
                    id="vat_number"
                    value={formData.vat_number}
                    onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
                    placeholder="Es: IT12345678901"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing_address">Indirizzo di Fatturazione</Label>
                <Textarea
                  id="billing_address"
                  value={formData.billing_address}
                  onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                  placeholder="Via, Numero Civico, CAP, Città, Provincia"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_address">Indirizzo di Consegna</Label>
                <Textarea
                  id="delivery_address"
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  placeholder="Via, Numero Civico, CAP, Città, Provincia (se diverso dall'indirizzo di fatturazione)"
                  rows={3}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Se l'indirizzo di consegna è lo stesso della fatturazione, ripeti lo stesso indirizzo
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="final_notes">Note Aggiuntive (Opzionale)</Label>
                <Textarea
                  id="final_notes"
                  value={formData.final_notes}
                  onChange={(e) => setFormData({ ...formData, final_notes: e.target.value })}
                  placeholder="Eventuali richieste speciali o informazioni aggiuntive..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={submitting || !formData.billing_address || !formData.delivery_address}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvataggio...
                    </>
                  ) : (
                    "Conferma Ordine"
                  )}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Un nostro commerciale ti contatterà entro 24 ore per confermare tutti i dettagli
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
