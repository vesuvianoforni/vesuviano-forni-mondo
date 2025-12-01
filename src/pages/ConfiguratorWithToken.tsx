import { useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { supabase } from "@/integrations/supabase/client";
import Configurator from "./Configurator";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ConfiguratorWithToken() {
  const { token } = useParams();
  const { t, i18n } = useTranslation();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [showExpiredDialog, setShowExpiredDialog] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [requestingNewLink, setRequestingNewLink] = useState(false);

  // Auto-detect browser language
  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    const supportedLangs = ['it', 'en', 'fr'];
    if (supportedLangs.includes(browserLang) && i18n.language !== browserLang) {
      i18n.changeLanguage(browserLang);
    }
  }, []);

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
          setCustomerName(data.customer_name || "");
          setCustomerEmail(data.customer_email || "");
          setCustomerPhone(data.customer_phone || "");
          setShowExpiredDialog(true);
          setValid(false);
        } else {
          // Mark as used and track opening
          await supabase
            .from('configurator_sessions')
            .update({ 
              is_used: true,
              last_opened_at: new Date().toISOString(),
              customer_actions: [{ 
                type: 'link_opened', 
                timestamp: new Date().toISOString() 
              }]
            })
            .eq('id', data.id);

          setSession(data);
          setValid(true);
        }
      } catch (error) {
        console.error('Error validating token:', error);
        setCustomerName("");
        setShowExpiredDialog(true);
        setValid(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleRequestNewLink = async () => {
    if (!customerName || !customerEmail || !customerPhone) {
      toast.error(t('configurator.expired.missingData'));
      return;
    }

    setRequestingNewLink(true);
    try {
      const { error } = await supabase.functions.invoke("request-new-link", {
        body: {
          customerName,
          customerEmail,
          customerPhone,
          oldToken: token,
        },
      });

      if (error) throw error;

      toast.success(t('configurator.expired.requestSent'));
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error("Error requesting new link:", error);
      toast.error(t('configurator.expired.requestError'));
    } finally {
      setRequestingNewLink(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('configurator.loading')}</p>
        </div>
      </div>
    );
  }

  if (!valid) {
    return (
      <>
        <Dialog open={showExpiredDialog} onOpenChange={(open) => {
          if (!open) window.location.href = "/";
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {customerName ? t('configurator.expired.greeting', { name: customerName }) : t('configurator.expired.greetingGeneric')}
              </DialogTitle>
              <DialogDescription className="text-base pt-4">
                {t('configurator.expired.message')}
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/"}
              >
                {t('configurator.expired.returnHome')}
              </Button>
              <Button 
                onClick={handleRequestNewLink}
                disabled={requestingNewLink || !customerEmail}
              >
                {requestingNewLink ? t('configurator.expired.requesting') : t('configurator.expired.requestNew')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p>{t('configurator.expired.invalidLink')}</p>
          </div>
        </div>
      </>
    );
  }

  return <Configurator sessionId={session?.id} />;
}