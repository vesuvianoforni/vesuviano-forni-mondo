import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Eye, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SendLinkEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    token: string;
    customer_name: string;
    customer_email: string;
  };
}

const emailPreviews = {
  it: {
    subject: 'Il tuo configuratore personalizzato Vesuviano Forni',
    greeting: 'Ciao',
    intro: 'Grazie per il tuo interesse nei nostri forni artigianali!',
    features: [
      '✨ Scegliere il modello perfetto per le tue esigenze',
      '🎨 Personalizzare colori e rivestimenti',
      '📊 Visualizzare il tuo forno con render AI',
      '💰 Ricevere un preventivo immediato'
    ],
    cta: 'CONFIGURA IL TUO FORNO',
    validity: 'Il link è valido per 30 giorni',
    closing: 'Cordiali saluti,',
    team: 'Il Team Vesuviano Forni'
  },
  en: {
    subject: 'Your personalized Vesuviano Ovens configurator',
    greeting: 'Hello',
    intro: 'Thank you for your interest in our artisanal ovens!',
    features: [
      '✨ Choose the perfect model for your needs',
      '🎨 Customize colors and finishes',
      '📊 Visualize your oven with AI renders',
      '💰 Get an instant quote'
    ],
    cta: 'CONFIGURE YOUR OVEN',
    validity: 'The link is valid for 30 days',
    closing: 'Best regards,',
    team: 'The Vesuviano Ovens Team'
  },
  fr: {
    subject: 'Votre configurateur personnalisé Vesuviano Fours',
    greeting: 'Bonjour',
    intro: 'Merci pour votre intérêt dans nos fours artisanaux !',
    features: [
      '✨ Choisir le modèle parfait pour vos besoins',
      '🎨 Personnaliser les couleurs et les revêtements',
      '📊 Visualiser votre four avec des rendus IA',
      '💰 Recevoir un devis immédiat'
    ],
    cta: 'CONFIGUREZ VOTRE FOUR',
    validity: 'Le lien est valable 30 jours',
    closing: 'Cordialement,',
    team: "L'Équipe Vesuviano Fours"
  }
};

export const SendLinkEmailModal = ({ isOpen, onClose, session }: SendLinkEmailModalProps) => {
  const [language, setLanguage] = useState<'it' | 'en' | 'fr'>('it');
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);

  const configuratorLink = `https://www.vesuvianoforni.com/configuratore/${session.token}`;
  const preview = emailPreviews[language];

  const handleSendEmail = async () => {
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-configurator-link', {
        body: {
          customerName: session.customer_name,
          customerEmail: session.customer_email,
          configuratorLink,
          language
        }
      });

      if (error) throw error;

      // Update link_sent status
      await supabase
        .from('configurator_sessions')
        .update({ link_sent: true })
        .eq('token', session.token);

      toast.success('Email inviata con successo!');
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Errore durante l\'invio dell\'email');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Invia Link Configuratore via Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Lingua Email</Label>
            <Select value={language} onValueChange={(value: any) => setLanguage(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
                <SelectItem value="fr">🇫🇷 Français</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Anteprima Email</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Nascondi' : 'Mostra'} Anteprima
              </Button>
            </div>

            {showPreview && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--destructive))] text-white p-6 rounded-t-lg text-center">
                    <h2 className="text-2xl font-bold">Vesuviano Forni</h2>
                    <p className="text-sm opacity-90 mt-1">
                      {language === 'it' && 'Forni Artigianali d\'Eccellenza'}
                      {language === 'en' && 'Artisanal Ovens of Excellence'}
                      {language === 'fr' && 'Fours Artisanaux d\'Excellence'}
                    </p>
                  </div>

                  <div className="bg-muted p-6 space-y-4">
                    <h3 className="text-xl font-semibold">
                      {preview.greeting} {session.customer_name},
                    </h3>
                    <p className="text-sm">{preview.intro}</p>
                    <div className="space-y-2">
                      {preview.features.map((feature, idx) => (
                        <div key={idx} className="text-sm">• {feature}</div>
                      ))}
                    </div>
                    <div className="text-center py-4">
                      <div className="inline-block bg-[hsl(var(--primary))] text-primary-foreground px-6 py-3 rounded font-bold">
                        {preview.cta}
                      </div>
                    </div>
                    <p className="text-sm font-semibold">{preview.validity}</p>
                    <div className="text-sm">
                      <p>{preview.closing}</p>
                      <p className="font-semibold">{preview.team}</p>
                    </div>
                  </div>

                  <div className="bg-gray-800 text-gray-400 p-4 rounded-b-lg text-center text-xs space-y-1">
                    <p className="font-semibold text-white">Vesuviano Forni S.r.l.</p>
                    <p>Via Sant'Anastasia 123, Napoli, Italia</p>
                    <p>
                      📧 info@vesuvianoforni.com | 📞 +39 081 123 4567
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="text-sm">
              <strong>Destinatario:</strong> {session.customer_email}
            </div>
            <div className="text-sm">
              <strong>Nome:</strong> {session.customer_name}
            </div>
            <div className="text-sm">
              <strong>Link:</strong> <span className="text-xs break-all">{configuratorLink}</span>
            </div>
            <div className="text-sm">
              <strong>Oggetto:</strong> {preview.subject}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Annulla
          </Button>
          <Button onClick={handleSendEmail} disabled={sending}>
            <Send className="w-4 h-4 mr-2" />
            {sending ? 'Invio in corso...' : 'Invia Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
