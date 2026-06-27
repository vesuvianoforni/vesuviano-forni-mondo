import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Phone, MessageCircle, Video, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SEOHead from '@/components/SEOHead';

interface Appointment {
  id: string;
  created_at: string;
  appointment_date: string;
  appointment_time: string;
  phone_number: string;
  contact_method: string;
  status: string;
  notes: string | null;
}

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Errore nel caricamento degli appuntamenti");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case "whatsapp":
        return <MessageCircle className="h-4 w-4 text-green-600" />;
      case "phone":
        return <Phone className="h-4 w-4 text-blue-600" />;
      case "googlemeet":
        return <Video className="h-4 w-4 text-purple-600" />;
      default:
        return <Phone className="h-4 w-4" />;
    }
  };

  const getContactMethodLabel = (method: string) => {
    switch (method) {
      case "whatsapp":
        return "WhatsApp";
      case "phone":
        return "Telefonata";
      case "googlemeet":
        return "Google Meet";
      default:
        return method;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In attesa</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completato</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancellato</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast.success("Status aggiornato con successo");
      fetchAppointments();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Errore nell'aggiornamento dello status");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (

    <>
      <SEOHead title="Appuntamenti | Vesuviano" description="Gestione appuntamenti Vesuviano." lang="it" noIndex />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            📅 Appuntamenti Prenotati
          </h1>
          <p className="text-muted-foreground">
            Totale appuntamenti: {appointments.length}
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Ora</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead>Metodo Contatto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nessun appuntamento trovato
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{appointment.appointment_date}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {appointment.appointment_time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <a 
                        href={`tel:${appointment.phone_number}`}
                        className="text-primary hover:underline flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        {appointment.phone_number}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getContactMethodIcon(appointment.contact_method)}
                        {getContactMethodLabel(appointment.contact_method)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(appointment.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {appointment.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(appointment.id, "completed")}
                            >
                              Completato
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(appointment.id, "cancelled")}
                            >
                              Cancella
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
    </>
  );
};

export default Appointments;
