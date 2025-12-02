import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, Languages, Eye, Edit } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Genera HTML preview
  const generateEmailPreview = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 650px; margin: 0 auto; background: white;">
          <!-- Header con logo -->
          <div style="background: linear-gradient(135deg, #8B4513 0%, #CD5C5C 100%); padding: 40px 30px; text-align: center;">
            <img src="https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/oven-gallery/vesuviano-logo-bianco.png" alt="Vesuviano Forni" style="max-width: 200px; height: auto; margin-bottom: 15px;" />
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Vesuviano Forni</h1>
            <p style="color: #fef2f2; margin: 10px 0 0 0; font-size: 14px;">L'arte della tradizione napoletana</p>
          </div>

          <!-- Corpo del messaggio -->
          <div style="padding: 40px 30px;">
            ${ovenImageUrl ? `
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${ovenImageUrl}" alt="Il tuo forno Vesuviano" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
            </div>
            ` : ''}
            
            <div style="color: #333; font-size: 16px; line-height: 1.8;">
              ${message.replace(/\n/g, '<br/>')}
            </div>
          </div>

          <!-- Footer con contatti -->
          <div style="background: #f8f8f8; padding: 30px; border-top: 3px solid #8B4513;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h3 style="color: #8B4513; margin: 0 0 15px 0; font-size: 18px;">Parliamone insieme</h3>
            </div>
            
            <table style="width: 100%; max-width: 500px; margin: 0 auto;">
              <tr>
                <td style="padding: 8px 0; text-align: center;">
                  <strong style="color: #8B4513;">Bruno Nardello</strong>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; text-align: center;">
                  <a href="https://www.vesuvianoforni.com" style="color: #2563eb; text-decoration: none;">www.vesuvianoforni.com</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; text-align: center;">
                  <a href="mailto:info@vesuvianoforni.com" style="color: #2563eb; text-decoration: none;">info@vesuvianoforni.com</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; text-align: center;">
                  <a href="https://api.whatsapp.com/send?phone=393509286941&text=Ciao%20Vesuviano%20Forni%2C%20" 
                     style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 15px;">
                    💬 Scrivimi su WhatsApp
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; text-align: center; color: #666;">
                  <a href="tel:+393509286941" style="color: #2563eb; text-decoration: none;">📱 +39 350 928 6941</a> (mobile)
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; text-align: center; color: #666;">
                  <a href="tel:08119231684" style="color: #2563eb; text-decoration: none;">☎️ 081 192 31684</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; text-align: center; color: #888; font-size: 14px;">
                  📍 Naples - Italy
                </td>
              </tr>
            </table>
          </div>

          <!-- Footer finale -->
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #fff; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} Vesuviano Forni - Forni a legna artigianali dal cuore del Vesuvio
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Reset state when sessionId changes
  React.useEffect(() => {
    if (sessionId) {
      setMessage("");
      setSubject("");
      setCustomerEmail("");
      setCustomerName("");
      setOvenImageUrl("");
    }
  }, [sessionId]);

  // Remove auto-generate - user must select language first and click generate

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
      const errorMessage = error.message || error.error || 'Unknown error';
      toast.error(
        selectedLanguage === 'it' ? `Errore: ${errorMessage}` :
        selectedLanguage === 'en' ? `Error: ${errorMessage}` :
        `Erreur: ${errorMessage}`
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
          emailType: 'ai_sales',
          to: customerEmail,
          subject: subject,
          message: message,
          ovenImageUrl: ovenImageUrl,
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
            
            {/* Generate button - only show when no message yet */}
            {!message && !isGenerating && (
              <Button 
                onClick={generateMessage} 
                className="w-full mt-4"
                disabled={isGenerating}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Genera Messaggio AI
              </Button>
            )}
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

              <div className="mb-4">
                <Label htmlFor="email">Email Cliente</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="cliente@example.com"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="subject">Oggetto</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Oggetto dell'email"
                />
              </div>

              <div className="space-y-4">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="edit" className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Modifica
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Anteprima HTML
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="edit" className="mt-0 space-y-2">
                    <Label htmlFor="message">Messaggio</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={12}
                      className="font-sans"
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 Il messaggio verrà inviato in formato HTML professionale con logo Vesuviano e link WhatsApp cliccabile
                    </p>
                  </TabsContent>

                  <TabsContent value="preview" className="mt-0 space-y-2">
                    <Label>Anteprima Email</Label>
                    <div className="border rounded-lg overflow-hidden bg-muted/20" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                      <iframe
                        srcDoc={generateEmailPreview()}
                        style={{ width: '100%', height: '500px', border: 'none' }}
                        title="Anteprima Email"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      📧 Questa è l'anteprima esatta di come apparirà l'email al cliente
                    </p>
                  </TabsContent>
                </Tabs>
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