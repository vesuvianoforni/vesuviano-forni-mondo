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
    context: 'Hai compilato il nostro form per ricevere informazioni sui nostri forni a legna, a gas ed elettrici, realizzati artigianalmente nel Vesuviano, a Napoli!',
    intro: 'Grazie per il tuo interesse nei nostri forni artigianali!',
    features: [
      '🔥 Scegliere il modello perfetto per le tue esigenze',
      '🎨 Personalizzare colori e rivestimenti',
      '📊 Visualizzare il tuo forno con render AI',
      '💰 Ricevere un preventivo immediato'
    ],
    cta: 'CONFIGURA IL TUO FORNO',
    validity: 'Il link è valido per una singola sessione. Dopo averlo visualizzato, dovrai richiedere un nuovo link.',
    closing: 'Cordiali saluti,',
    team: 'Il Team Vesuviano Forni'
  },
  en: {
    subject: 'Your personalized Vesuviano Ovens configurator',
    greeting: 'Hello',
    context: 'You filled out our form to receive information about our wood-fired, gas, and electric ovens, handcrafted in the Vesuvius area, Naples!',
    intro: 'Thank you for your interest in our artisanal ovens!',
    features: [
      '🔥 Choose the perfect model for your needs',
      '🎨 Customize colors and finishes',
      '📊 Visualize your oven with AI renders',
      '💰 Get an instant quote'
    ],
    cta: 'CONFIGURE YOUR OVEN',
    validity: 'This link is valid for a single session only. After viewing it, you\'ll need to request a new link.',
    closing: 'Best regards,',
    team: 'The Vesuviano Ovens Team'
  },
  fr: {
    subject: 'Votre configurateur personnalisé Vesuviano Fours',
    greeting: 'Bonjour',
    context: 'Vous avez rempli notre formulaire pour recevoir des informations sur nos fours à bois, à gaz et électriques, fabriqués artisanalement dans la région du Vésuve, à Naples !',
    intro: 'Merci pour votre intérêt dans nos fours artisanaux !',
    features: [
      '🔥 Choisir le modèle parfait pour vos besoins',
      '🎨 Personnaliser les couleurs et les revêtements',
      '📊 Visualiser votre four avec des rendus IA',
      '💰 Recevoir un devis immédiat'
    ],
    cta: 'CONFIGUREZ VOTRE FOUR',
    validity: 'Le lien est valable pour une seule session. Après consultation, vous devrez demander un nouveau lien.',
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
                <CardContent className="p-0 space-y-0">
                  <div style={{
                    background: 'linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #CD5C5C 100%)',
                    color: 'white',
                    padding: '30px',
                    textAlign: 'center',
                    borderRadius: '8px 8px 0 0'
                  }}>
                    <img 
                      src="/lovable-uploads/vesuviano-logo-bianco.png" 
                      alt="Vesuviano Forni" 
                      style={{ maxWidth: '160px', height: 'auto', margin: '0 auto 10px' }}
                    />
                    <h2 className="text-xl font-bold mb-1">Vesuviano Forni</h2>
                    <p className="text-xs opacity-95">
                      {language === 'it' && 'Forni Artigianali d\'Eccellenza dal Vesuvio'}
                      {language === 'en' && 'Artisanal Ovens of Excellence from Vesuvius'}
                      {language === 'fr' && 'Fours Artisanaux d\'Excellence du Vésuve'}
                    </p>
                  </div>

                  <div className="bg-muted p-6 space-y-4">
                    <div className="bg-white border-l-4 border-[#8B4513] p-3 rounded text-xs text-muted-foreground mb-4">
                      <strong className="text-foreground">📢 {language === 'it' ? 'Perché ricevi questa email?' : language === 'en' ? 'Why are you receiving this?' : 'Pourquoi recevez-vous ceci?'}</strong><br/>
                      {preview.context}
                    </div>

                    <h3 className="text-lg font-semibold" style={{ color: '#8B4513' }}>
                      {preview.greeting} {session.customer_name},
                    </h3>
                    <p className="text-sm">{preview.intro}</p>
                    <div className="space-y-2">
                      {preview.features.map((feature, idx) => (
                        <div key={idx} className="text-sm">• {feature}</div>
                      ))}
                    </div>
                    <div className="text-center py-4">
                      <div 
                        className="inline-block text-white px-8 py-3 rounded-md font-bold text-sm"
                        style={{ 
                          background: 'linear-gradient(135deg, #8B4513 0%, #CD5C5C 100%)',
                          boxShadow: '0 4px 12px rgba(139, 69, 19, 0.3)'
                        }}
                      >
                        {preview.cta}
                      </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs">
                      <strong className="text-yellow-700">⚠️ {language === 'it' ? 'Importante' : language === 'en' ? 'Important' : 'Important'}:</strong> {preview.validity}
                    </div>
                    <div className="text-sm mt-4">
                      <p>{preview.closing}</p>
                      <p className="font-semibold">{preview.team}</p>
                    </div>
                  </div>

                  <div className="bg-[#2c2c2c] text-gray-400 p-6 rounded-b-lg text-center text-xs space-y-2">
                    <p className="font-semibold text-white text-sm">Vesuviano Forni S.r.l.</p>
                    <p className="text-xs">{language === 'it' ? 'Forni Artigianali dal Vesuvio' : language === 'en' ? 'Artisanal Ovens from Vesuvius' : 'Fours Artisanaux du Vésuve'}</p>
                    <p>Via Sant'Anastasia 123, Napoli, Italia</p>
                    <p>
                      📧 info@vesuvianoforni.com | 📞 +39 081 123 4567
                    </p>
                    <p className="mt-2">
                      🌐 <a href="https://www.vesuvianoforni.com" className="text-[#CD5C5C] no-underline">www.vesuvianoforni.com</a>
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
