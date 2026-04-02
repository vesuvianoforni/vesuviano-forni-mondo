import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LocalizedIndex from "./pages/LocalizedIndex";
import LocalizedArchitettoAI from "./pages/LocalizedArchitettoAI";
import LocalizedTraditionalOven from "./pages/LocalizedTraditionalOven";
import LocalizedGasOven from "./pages/LocalizedGasOven";
import LocalizedElectricOven from "./pages/LocalizedElectricOven";
import LocalizedRotatingOven from "./pages/LocalizedRotatingOven";
import LocalizedVesuvioBuono from "./pages/LocalizedVesuvioBuono";
import LocalizedReadyToShip from "./pages/LocalizedReadyToShip";
import LocalizedBurners from "./pages/LocalizedBurners";
import LocalizedUsefulInfo from "./pages/LocalizedUsefulInfo";
import LanguageRedirect from "./pages/LanguageRedirect";
import ArchitettoAIRedirect from "./pages/ArchitettoAIRedirect";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";
import BookAppointment from "./pages/BookAppointment";
import Appointments from "./pages/Appointments";
import Configurator from "./pages/Configurator";
import ConfiguratorWithToken from "./pages/ConfiguratorWithToken";
import AdminLogin from "./pages/AdminLogin";
import CreateAdmin from "./pages/CreateAdmin";
import PaymentSuccess from "./pages/PaymentSuccess";
import ContattiRedirect from "./pages/ContattiRedirect";
import LocalizedBlogList from "./pages/LocalizedBlogList";
import LocalizedBlogPost from "./pages/LocalizedBlogPost";
import ProformaPage from "./pages/ProformaPage";

// ERP
import ERPLayout from "./pages/ERPLayout";
import ERPDashboard from "./pages/ERPDashboard";
import AdminConfigurator from "./pages/AdminConfigurator";
import SessionsCRM from "./pages/SessionsCRM";
import AdminProforma from "./pages/AdminProforma";
import AdminBlog from "./pages/AdminBlog";
import ERPPlaceholder from "./components/erp/ERPPlaceholder";
import ERPForni from "./pages/ERPForni";
import ERPBruciatori from "./pages/ERPBruciatori";
import ERPListini from "./pages/ERPListini";
import ERPOrdini from "./pages/ERPOrdini";
import ERPUtenti from "./pages/ERPUtenti";
import ERPProntaConsegna from "./pages/ERPProntaConsegna";

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
            <Route path="/it/bruciatori" element={<LocalizedBurners lang="it" />} />
            <Route path="/it/blog" element={<LocalizedBlogList lang="it" />} />
            <Route path="/it/blog/:slug" element={<LocalizedBlogPost lang="it" />} />
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
            <Route path="/en/burners" element={<LocalizedBurners lang="en" />} />
            <Route path="/en/blog" element={<LocalizedBlogList lang="en" />} />
            <Route path="/en/blog/:slug" element={<LocalizedBlogPost lang="en" />} />
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
            <Route path="/fr/bruleurs" element={<LocalizedBurners lang="fr" />} />
            <Route path="/fr/blog" element={<LocalizedBlogList lang="fr" />} />
            <Route path="/fr/blog/:slug" element={<LocalizedBlogPost lang="fr" />} />
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
            <Route path="/es/quemadores" element={<LocalizedBurners lang="es" />} />
            <Route path="/es/blog" element={<LocalizedBlogList lang="es" />} />
            <Route path="/es/blog/:slug" element={<LocalizedBlogPost lang="es" />} />
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
            <Route path="/de/brenner" element={<LocalizedBurners lang="de" />} />
            <Route path="/de/blog" element={<LocalizedBlogList lang="de" />} />
            <Route path="/de/blog/:slug" element={<LocalizedBlogPost lang="de" />} />
            <Route path="/de/thank-you-de" element={<ThankYou lang="de" />} />
            
            {/* Public pages */}
            <Route path="/book-a-slot-call" element={<BookAppointment />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/configuratore" element={<Configurator />} />
            <Route path="/configuratore/:token" element={<ConfiguratorWithToken />} />
            <Route path="/success" element={<PaymentSuccess />} />
            <Route path="/contatti" element={<ContattiRedirect />} />
            <Route path="/proforma/:token" element={<ProformaPage />} />

            {/* ERP */}
            <Route path="/erp/login" element={<AdminLogin />} />
            <Route path="/erp/create" element={<CreateAdmin />} />
            <Route path="/erp" element={<ERPLayout />}>
              <Route index element={<ERPDashboard />} />
              <Route path="crm" element={<SessionsCRM />} />
              <Route path="proforma" element={<AdminProforma />} />
              <Route path="configuratore" element={<AdminConfigurator />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="forni" element={<ERPForni />} />
              <Route path="bruciatori" element={<ERPBruciatori />} />
              <Route path="listini" element={<ERPListini />} />
              <Route path="leads" element={<ERPPlaceholder title="Lead Sito Web" description="Gestione dei lead provenienti dal sito web e dai form di contatto." />} />
              <Route path="ordini" element={<ERPOrdini />} />
              <Route path="utenti" element={<ERPUtenti />} />
              <Route path="pronta-consegna" element={<ERPProntaConsegna />} />
            </Route>

            {/* Legacy admin redirects */}
            <Route path="/admin/login" element={<Navigate to="/erp/login" replace />} />
            <Route path="/admin/configuratore" element={<Navigate to="/erp/configuratore" replace />} />
            <Route path="/admin/sessions-crm" element={<Navigate to="/erp/crm" replace />} />
            <Route path="/admin/blog" element={<Navigate to="/erp/blog" replace />} />
            <Route path="/admin/proforma" element={<Navigate to="/erp/proforma" replace />} />
            <Route path="/admin/create" element={<Navigate to="/erp/create" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
