import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConsultationModalProvider } from "@/contexts/ConsultationModalContext";

// Critical route - loaded eagerly
import LocalizedIndex from "./pages/LocalizedIndex";
import LanguageRedirect from "./pages/LanguageRedirect";

// Lazy loaded routes
const LocalizedArchitettoAI = lazy(() => import("./pages/LocalizedArchitettoAI"));
const LocalizedTraditionalOven = lazy(() => import("./pages/LocalizedTraditionalOven"));
const LocalizedGasOven = lazy(() => import("./pages/LocalizedGasOven"));
const LocalizedElectricOven = lazy(() => import("./pages/LocalizedElectricOven"));
const LocalizedRotatingOven = lazy(() => import("./pages/LocalizedRotatingOven"));
const LocalizedVesuvioBuono = lazy(() => import("./pages/LocalizedVesuvioBuono"));
const LocalizedAboutUs = lazy(() => import("./pages/LocalizedAboutUs"));
const LocalizedReadyToShip = lazy(() => import("./pages/LocalizedReadyToShip"));
const LocalizedBurners = lazy(() => import("./pages/LocalizedBurners"));
const LocalizedSmokePurifier = lazy(() => import("./pages/LocalizedSmokePurifier"));
const LocalizedUsefulInfo = lazy(() => import("./pages/LocalizedUsefulInfo"));
const ArchitettoAIRedirect = lazy(() => import("./pages/ArchitettoAIRedirect"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BookAppointment = lazy(() => import("./pages/BookAppointment"));
const Appointments = lazy(() => import("./pages/Appointments"));
const Configurator = lazy(() => import("./pages/Configurator"));
const ConfiguratorWithToken = lazy(() => import("./pages/ConfiguratorWithToken"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const CreateAdmin = lazy(() => import("./pages/CreateAdmin"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const ContattiRedirect = lazy(() => import("./pages/ContattiRedirect"));
const LocalizedBlogList = lazy(() => import("./pages/LocalizedBlogList"));
const LocalizedBlogPost = lazy(() => import("./pages/LocalizedBlogPost"));
const ProformaPage = lazy(() => import("./pages/ProformaPage"));
const BuiltOnPlace = lazy(() => import("./pages/BuiltOnPlace"));
const LocalizedCollections = lazy(() => import("./pages/LocalizedCollections"));
const LocalizedServices = lazy(() => import("./pages/LocalizedServices"));
import ClarityPageView from "./components/ClarityPageView";


// ERP - lazy loaded
const ERPLayout = lazy(() => import("./pages/ERPLayout"));
const ERPDashboard = lazy(() => import("./pages/ERPDashboard"));
const AdminConfigurator = lazy(() => import("./pages/AdminConfigurator"));
const SessionsCRM = lazy(() => import("./pages/SessionsCRM"));
const AdminProforma = lazy(() => import("./pages/AdminProforma"));
const AdminBlog = lazy(() => import("./pages/AdminBlog"));
const ERPPlaceholder = lazy(() => import("./components/erp/ERPPlaceholder"));
const ERPForni = lazy(() => import("./pages/ERPForni"));
const ERPBruciatori = lazy(() => import("./pages/ERPBruciatori"));
const ERPListini = lazy(() => import("./pages/ERPListini"));
const ERPOrdini = lazy(() => import("./pages/ERPOrdini"));
const ERPUtenti = lazy(() => import("./pages/ERPUtenti"));
const ERPProntaConsegna = lazy(() => import("./pages/ERPProntaConsegna"));
const ERPKnowledgeBase = lazy(() => import("./pages/ERPKnowledgeBase"));
const ERPChatLogs = lazy(() => import("./pages/ERPChatLogs"));
const ERPListinoRivenditori = lazy(() => import("./pages/ERPListinoRivenditori"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-stone-50">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vesuviano-600"></div>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ConsultationModalProvider>
          <ClarityPageView />
          <Suspense fallback={<PageLoader />}>
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
              <Route path="/it/depuratore-fumi" element={<LocalizedSmokePurifier lang="it" />} />
              <Route path="/it/blog" element={<LocalizedBlogList lang="it" />} />
              <Route path="/it/blog/:slug" element={<LocalizedBlogPost lang="it" />} />
              <Route path="/it/thank-you-it" element={<ThankYou lang="it" />} />
              <Route path="/it/informazioni-utili" element={<LocalizedUsefulInfo lang="it" />} />
              <Route path="/it/collezioni" element={<LocalizedCollections lang="it" />} />
              <Route path="/it/chi-siamo" element={<LocalizedAboutUs lang="it" />} />
              
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
              <Route path="/en/wood-smoke-purifier" element={<LocalizedSmokePurifier lang="en" />} />
              <Route path="/en/blog" element={<LocalizedBlogList lang="en" />} />
              <Route path="/en/blog/:slug" element={<LocalizedBlogPost lang="en" />} />
              <Route path="/en/thank-you-en" element={<ThankYou lang="en" />} />
              <Route path="/en/useful-information" element={<LocalizedUsefulInfo lang="en" />} />
              <Route path="/en/collections" element={<LocalizedCollections lang="en" />} />
              <Route path="/en/about-us" element={<LocalizedAboutUs lang="en" />} />
              
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
              <Route path="/fr/purificateur-fumee" element={<LocalizedSmokePurifier lang="fr" />} />
              <Route path="/fr/blog" element={<LocalizedBlogList lang="fr" />} />
              <Route path="/fr/blog/:slug" element={<LocalizedBlogPost lang="fr" />} />
              <Route path="/fr/thank-you-fr" element={<ThankYou lang="fr" />} />
              <Route path="/fr/informations-utiles" element={<LocalizedUsefulInfo lang="fr" />} />
              <Route path="/fr/collections" element={<LocalizedCollections lang="fr" />} />
              <Route path="/fr/qui-sommes-nous" element={<LocalizedAboutUs lang="fr" />} />
              
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
              <Route path="/es/purificador-humo" element={<LocalizedSmokePurifier lang="es" />} />
              <Route path="/es/blog" element={<LocalizedBlogList lang="es" />} />
              <Route path="/es/blog/:slug" element={<LocalizedBlogPost lang="es" />} />
              <Route path="/es/thank-you-es" element={<ThankYou lang="es" />} />
              <Route path="/es/informacion-util" element={<LocalizedUsefulInfo lang="es" />} />
              <Route path="/es/colecciones" element={<LocalizedCollections lang="es" />} />
              <Route path="/es/quienes-somos" element={<LocalizedAboutUs lang="es" />} />
              
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
              <Route path="/de/rauchfilter" element={<LocalizedSmokePurifier lang="de" />} />
              <Route path="/de/blog" element={<LocalizedBlogList lang="de" />} />
              <Route path="/de/blog/:slug" element={<LocalizedBlogPost lang="de" />} />
              <Route path="/de/thank-you-de" element={<ThankYou lang="de" />} />
              <Route path="/de/nuetzliche-informationen" element={<LocalizedUsefulInfo lang="de" />} />
              <Route path="/de/kollektionen" element={<LocalizedCollections lang="de" />} />
              <Route path="/de/ueber-uns" element={<LocalizedAboutUs lang="de" />} />
              
              {/* Public pages */}
              <Route path="/book-a-slot-call" element={<BookAppointment />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/configuratore" element={<Configurator />} />
              <Route path="/configuratore/:token" element={<ConfiguratorWithToken />} />
              <Route path="/success" element={<PaymentSuccess />} />
              <Route path="/contatti" element={<ContattiRedirect />} />
              <Route path="/proforma/:token" element={<ProformaPage />} />
              <Route path="/built-on-place" element={<BuiltOnPlace />} />

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
                <Route path="listino-rivenditori" element={<ERPListinoRivenditori />} />
                <Route path="leads" element={<ERPPlaceholder title="Lead Sito Web" description="Gestione dei lead provenienti dal sito web e dai form di contatto." />} />
                <Route path="ordini" element={<ERPOrdini />} />
                <Route path="utenti" element={<ERPUtenti />} />
                <Route path="pronta-consegna" element={<ERPProntaConsegna />} />
                <Route path="knowledge-base" element={<ERPKnowledgeBase />} />
                <Route path="chat-logs" element={<ERPChatLogs />} />
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
          </Suspense>
          </ConsultationModalProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
