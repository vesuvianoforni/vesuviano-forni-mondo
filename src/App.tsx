import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LocalizedIndex from "./pages/LocalizedIndex";
import LocalizedArchitettoAI from "./pages/LocalizedArchitettoAI";
import LocalizedTraditionalOven from "./pages/LocalizedTraditionalOven";
import LocalizedGasOven from "./pages/LocalizedGasOven";
import LocalizedElectricOven from "./pages/LocalizedElectricOven";
import LocalizedRotatingOven from "./pages/LocalizedRotatingOven";
import LocalizedVesuvioBuono from "./pages/LocalizedVesuvioBuono";
import LocalizedReadyToShip from "./pages/LocalizedReadyToShip";
import LanguageRedirect from "./pages/LanguageRedirect";
import ArchitettoAIRedirect from "./pages/ArchitettoAIRedirect";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";
import BookAppointment from "./pages/BookAppointment";
import Appointments from "./pages/Appointments";
import Configurator from "./pages/Configurator";
import ConfiguratorWithToken from "./pages/ConfiguratorWithToken";
import AdminConfigurator from "./pages/AdminConfigurator";
import AdminLogin from "./pages/AdminLogin";
import CreateAdmin from "./pages/CreateAdmin";
import PaymentSuccess from "./pages/PaymentSuccess";
import SessionsCRM from "./pages/SessionsCRM";
import ContattiRedirect from "./pages/ContattiRedirect";

const queryClient = new QueryClient();

const App = () => {
  console.log('[App] Rendering root application');
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LanguageRedirect />} />
            <Route path="/architettoai" element={<ArchitettoAIRedirect />} />
            
            {/* Italian Routes */}
            <Route path="/it" element={<LocalizedIndex lang="it" />} />
            <Route path="/it/architettoai" element={<LocalizedArchitettoAI lang="it" />} />
            <Route path="/it/forni-tradizionali" element={<LocalizedTraditionalOven lang="it" />} />
            <Route path="/it/forni-gas" element={<LocalizedGasOven lang="it" />} />
            <Route path="/it/forni-elettrici" element={<LocalizedElectricOven lang="it" />} />
            <Route path="/it/forni-rotanti" element={<LocalizedRotatingOven lang="it" />} />
            <Route path="/it/sistema-vesuviobuono" element={<LocalizedVesuvioBuono lang="it" />} />
            <Route path="/it/pronta-consegna" element={<LocalizedReadyToShip lang="it" />} />
            <Route path="/it/thank-you-it" element={<ThankYou lang="it" />} />
            
            {/* English Routes */}
            <Route path="/en" element={<LocalizedIndex lang="en" />} />
            <Route path="/en/architettoai" element={<LocalizedArchitettoAI lang="en" />} />
            <Route path="/en/traditional-ovens" element={<LocalizedTraditionalOven lang="en" />} />
            <Route path="/en/gas-ovens" element={<LocalizedGasOven lang="en" />} />
            <Route path="/en/electric-ovens" element={<LocalizedElectricOven lang="en" />} />
            <Route path="/en/rotating-ovens" element={<LocalizedRotatingOven lang="en" />} />
            <Route path="/en/vesuviobuono-system" element={<LocalizedVesuvioBuono lang="en" />} />
            <Route path="/en/ready-to-ship" element={<LocalizedReadyToShip lang="en" />} />
            <Route path="/en/thank-you-en" element={<ThankYou lang="en" />} />
            
            {/* French Routes */}
            <Route path="/fr" element={<LocalizedIndex lang="fr" />} />
            <Route path="/fr/architettoai" element={<LocalizedArchitettoAI lang="fr" />} />
            <Route path="/fr/fours-traditionnels" element={<LocalizedTraditionalOven lang="fr" />} />
            <Route path="/fr/fours-gaz" element={<LocalizedGasOven lang="fr" />} />
            <Route path="/fr/fours-electriques" element={<LocalizedElectricOven lang="fr" />} />
            <Route path="/fr/fours-rotatifs" element={<LocalizedRotatingOven lang="fr" />} />
            <Route path="/fr/systeme-vesuviobuono" element={<LocalizedVesuvioBuono lang="fr" />} />
            <Route path="/fr/pret-a-expedier" element={<LocalizedReadyToShip lang="fr" />} />
            <Route path="/fr/thank-you-fr" element={<ThankYou lang="fr" />} />
            
            {/* Spanish Routes */}
            <Route path="/es" element={<LocalizedIndex lang="es" />} />
            <Route path="/es/architettoai" element={<LocalizedArchitettoAI lang="es" />} />
            <Route path="/es/hornos-tradicionales" element={<LocalizedTraditionalOven lang="es" />} />
            <Route path="/es/hornos-gas" element={<LocalizedGasOven lang="es" />} />
            <Route path="/es/hornos-electricos" element={<LocalizedElectricOven lang="es" />} />
            <Route path="/es/hornos-rotativos" element={<LocalizedRotatingOven lang="es" />} />
            <Route path="/es/sistema-vesuviobuono" element={<LocalizedVesuvioBuono lang="es" />} />
            <Route path="/es/listo-para-enviar" element={<LocalizedReadyToShip lang="es" />} />
            <Route path="/es/thank-you-es" element={<ThankYou lang="es" />} />
            
            {/* German Routes */}
            <Route path="/de" element={<LocalizedIndex lang="de" />} />
            <Route path="/de/architettoai" element={<LocalizedArchitettoAI lang="de" />} />
            <Route path="/de/traditionelle-oefen" element={<LocalizedTraditionalOven lang="de" />} />
            <Route path="/de/gasoefen" element={<LocalizedGasOven lang="de" />} />
            <Route path="/de/elektrooefen" element={<LocalizedElectricOven lang="de" />} />
            <Route path="/de/drehoefen" element={<LocalizedRotatingOven lang="de" />} />
            <Route path="/de/vesuviobuono-system" element={<LocalizedVesuvioBuono lang="de" />} />
            <Route path="/de/versandfertig" element={<LocalizedReadyToShip lang="de" />} />
            <Route path="/de/thank-you-de" element={<ThankYou lang="de" />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="/book-a-slot-call" element={<BookAppointment />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/configuratore" element={<Configurator />} />
            <Route path="/configuratore/:token" element={<ConfiguratorWithToken />} />
            <Route path="/success" element={<PaymentSuccess />} />
            <Route path="/contatti" element={<ContattiRedirect />} />
            <Route path="/admin/create" element={<CreateAdmin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/configuratore" element={<AdminConfigurator />} />
            <Route path="/admin/sessions-crm" element={<SessionsCRM />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
