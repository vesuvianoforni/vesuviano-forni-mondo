import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

interface AIConversionMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  language?: string;
}

export const AIConversionMessageModal = ({
  open,
  onOpenChange,
  sessionId,
  language = 'it'
}: AIConversionMessageModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");

  const generateMessage = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-conversion-message', {
        body: { sessionId, language }
      });

      if (error) throw error;

      setSubject(data.subject);
      setMessage(data.message);
      setCustomerEmail(data.customerEmail);
      setCustomerName(data.customerName);
      
      toast.success(
        language === 'it' ? 'Messaggio generato con successo!' :
        language === 'en' ? 'Message generated successfully!' :
        'Message généré avec succès!'
      );
    } catch (error: any) {
      console.error('Error generating message:', error);
      toast.error(
        language === 'it' ? 'Errore nella generazione del messaggio' :
        language === 'en' ? 'Error generating message' :
        'Erreur lors de la génération du message'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmail = async () => {
    if (!customerEmail || !subject || !message) {
      toast.error(
        language === 'it' ? 'Compila tutti i campi prima di inviare' :
        language === 'en' ? 'Fill in all fields before sending' :
        'Remplissez tous les champs avant d\'envoyer'
      );
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-configuration-email', {
        body: {
          to: customerEmail,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #8B4513 0%, #CD5C5C 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Vesuviano Forni</h1>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <p style="white-space: pre-wrap; line-height: 1.6; color: #333;">${message}</p>
              </div>
              <div style="padding: 20px; background: #333; text-align: center;">
                <p style="color: #fff; margin: 0;">Vesuviano Forni - Sant'Anastasia, Napoli</p>
                <p style="color: #fff; margin: 5px 0 0 0;">info@vesuvianoforni.com</p>
              </div>
            </div>
          `,
          sessionId: sessionId
        }
      });

      if (error) throw error;

      toast.success(
        language === 'it' ? 'Email inviata con successo!' :
        language === 'en' ? 'Email sent successfully!' :
        'Email envoyé avec succès!'
      );
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(
        language === 'it' ? 'Errore nell\'invio dell\'email' :
        language === 'en' ? 'Error sending email' :
        'Erreur lors de l\'envoi de l\'email'
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {language === 'it' ? 'Messaggio AI di Conversione' :
             language === 'en' ? 'AI Conversion Message' :
             'Message de Conversion IA'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!message && (
            <div className="text-center py-8">
              <Button 
                onClick={generateMessage} 
                disabled={isGenerating}
                size="lg"
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {language === 'it' ? 'Generazione in corso...' :
                     language === 'en' ? 'Generating...' :
                     'Génération en cours...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    {language === 'it' ? 'Genera Messaggio Personalizzato' :
                     language === 'en' ? 'Generate Personalized Message' :
                     'Générer un Message Personnalisé'}
                  </>
                )}
              </Button>
            </div>
          )}

          {message && (
            <>
              <div>
                <Label htmlFor="email">
                  {language === 'it' ? 'Email Cliente' :
                   language === 'en' ? 'Customer Email' :
                   'Email Client'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="cliente@example.com"
                />
              </div>

              <div>
                <Label htmlFor="subject">
                  {language === 'it' ? 'Oggetto' :
                   language === 'en' ? 'Subject' :
                   'Objet'}
                </Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={
                    language === 'it' ? 'Oggetto dell\'email' :
                    language === 'en' ? 'Email subject' :
                    'Objet de l\'email'
                  }
                />
              </div>

              <div>
                <Label htmlFor="message">
                  {language === 'it' ? 'Messaggio' :
                   language === 'en' ? 'Message' :
                   'Message'}
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={12}
                  className="font-sans"
                />
              </div>
            </>
          )}
        </div>

        {message && (
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={generateMessage}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {language === 'it' ? 'Rigenera' :
               language === 'en' ? 'Regenerate' :
               'Régénérer'}
            </Button>
            <Button
              onClick={sendEmail}
              disabled={isSending || !customerEmail}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {language === 'it' ? 'Invia Email' :
               language === 'en' ? 'Send Email' :
               'Envoyer Email'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};