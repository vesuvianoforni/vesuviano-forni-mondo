import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, Languages } from "lucide-react";

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
  language: initialLanguage = 'it'
}: AIConversionMessageModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [ovenImageUrl, setOvenImageUrl] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);

  // Auto-generate message when modal opens
  React.useEffect(() => {
    if (open && sessionId && !message) {
      generateMessage();
    }
  }, [open, sessionId]);

  const generateMessage = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-conversion-message', {
        body: { sessionId, language: selectedLanguage }
      });

      if (error) throw error;

      setSubject(data.subject);
      setMessage(data.message);
      setCustomerEmail(data.customerEmail);
      setCustomerName(data.customerName);
      setOvenImageUrl(data.ovenImageUrl || "");
      
      toast.success(
        selectedLanguage === 'it' ? 'Messaggio generato con successo!' :
        selectedLanguage === 'en' ? 'Message generated successfully!' :
        'Message généré avec succès!'
      );
    } catch (error: any) {
      console.error('Error generating message:', error);
      toast.error(
        selectedLanguage === 'it' ? 'Errore nella generazione del messaggio' :
        selectedLanguage === 'en' ? 'Error generating message' :
        'Erreur lors de la génération du message'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmail = async () => {
    if (!customerEmail || !subject || !message) {
      toast.error(
        selectedLanguage === 'it' ? 'Compila tutti i campi prima di inviare' :
        selectedLanguage === 'en' ? 'Fill in all fields before sending' :
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
                ${ovenImageUrl ? `
                  <div style="text-align: center; margin-bottom: 25px;">
                    <img src="${ovenImageUrl}" alt="Il tuo forno Vesuviano" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
                  </div>
                ` : ''}
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
        selectedLanguage === 'it' ? 'Email inviata con successo!' :
        selectedLanguage === 'en' ? 'Email sent successfully!' :
        'Email envoyé avec succès!'
      );
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(
        selectedLanguage === 'it' ? 'Errore nell\'invio dell\'email' :
        selectedLanguage === 'en' ? 'Error sending email' :
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
            Messaggio AI di Conversione
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Language Selector */}
          <div className="mb-4 p-4 bg-muted/30 rounded-lg border">
            <Label htmlFor="language" className="flex items-center gap-2 mb-2">
              <Languages className="h-4 w-4" />
              Lingua Email / Email Language / Langue Email
            </Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
                <SelectItem value="fr">🇫🇷 Français</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isGenerating && !message && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">
                Generazione messaggio personalizzato in corso...
              </p>
            </div>
          )}

          {message && (
            <>
              {ovenImageUrl && (
                <div className="mb-4">
                  <Label>🔥 Forno Configurato</Label>
                  <div className="mt-2 text-center bg-muted/30 rounded-lg p-4">
                    <img 
                      src={ovenImageUrl} 
                      alt="Forno configurato" 
                      className="max-w-full h-auto rounded-lg mx-auto shadow-md"
                      style={{ maxHeight: '300px' }}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Questa immagine sarà inclusa nell'email
                    </p>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email">Email Cliente</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="cliente@example.com"
                />
              </div>

              <div>
                <Label htmlFor="subject">Oggetto</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Oggetto dell'email"
                />
              </div>

              <div>
                <Label htmlFor="message">Messaggio</Label>
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
              Rigenera
            </Button>
            <Button
              onClick={sendEmail}
              disabled={isSending || !customerEmail}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Invia Email
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};