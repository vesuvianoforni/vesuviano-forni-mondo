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
const LocalizedRivestimenti = lazy(() => import("./pages/LocalizedRivestimenti"));
const LocalizedServices = lazy(() => import("./pages/LocalizedServices"));
const LocalizedNeapolitanPizzaOvens = lazy(() => import("./pages/LocalizedNeapolitanPizzaOvens"));
const ForniLegnaEsterno = lazy(() => import("./pages/ForniLegnaEsterno"));
const FourAPizzaBois = lazy(() => import("./pages/FourAPizzaBois"));
const CommercialWoodFiredPizzaOven = lazy(() => import("./pages/CommercialWoodFiredPizzaOven"));
const CommercialGasPizzaOven = lazy(() => import("./pages/CommercialGasPizzaOven"));
const RotatingPizzaOven = lazy(() => import("./pages/RotatingPizzaOven"));
const ElectricPizzaOven = lazy(() => import("./pages/ElectricPizzaOven"));
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
const ERPContratti = lazy(() => import("./pages/ERPContratti"));
const PublicContractSign = lazy(() => import("./pages/PublicContractSign"));
const PublicContractTerms = lazy(() => import("./pages/PublicContractTerms"));

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
              <Route path="/contratto/:token/termini" element={<PublicContractTerms />} />
              <Route path="/contratto/:token" element={<PublicContractSign />} />


              {/* Cross-language slug aliases: redirect wrong-language slug to correct one */}
              {/* Collections */}
              <Route path="/it/collections" element={<Navigate to="/it/collezioni" replace />} />
              <Route path="/it/colecciones" element={<Navigate to="/it/collezioni" replace />} />
              <Route path="/it/kollektionen" element={<Navigate to="/it/collezioni" replace />} />
              <Route path="/en/collezioni" element={<Navigate to="/en/collections" replace />} />
              <Route path="/en/colecciones" element={<Navigate to="/en/collections" replace />} />
              <Route path="/en/kollektionen" element={<Navigate to="/en/collections" replace />} />
              <Route path="/fr/collezioni" element={<Navigate to="/fr/collections" replace />} />
              <Route path="/fr/colecciones" element={<Navigate to="/fr/collections" replace />} />
              <Route path="/fr/kollektionen" element={<Navigate to="/fr/collections" replace />} />
              <Route path="/es/collezioni" element={<Navigate to="/es/colecciones" replace />} />
              <Route path="/es/collections" element={<Navigate to="/es/colecciones" replace />} />
              <Route path="/es/kollektionen" element={<Navigate to="/es/colecciones" replace />} />
              <Route path="/de/collezioni" element={<Navigate to="/de/kollektionen" replace />} />
              <Route path="/de/collections" element={<Navigate to="/de/kollektionen" replace />} />
              <Route path="/de/colecciones" element={<Navigate to="/de/kollektionen" replace />} />

              {/* Finishes / Rivestimenti */}
              <Route path="/it/finishes" element={<Navigate to="/it/rivestimenti" replace />} />
              <Route path="/it/revetements" element={<Navigate to="/it/rivestimenti" replace />} />
              <Route path="/it/revestimientos" element={<Navigate to="/it/rivestimenti" replace />} />
              <Route path="/it/verkleidungen" element={<Navigate to="/it/rivestimenti" replace />} />
              <Route path="/en/rivestimenti" element={<Navigate to="/en/finishes" replace />} />
              <Route path="/fr/rivestimenti" element={<Navigate to="/fr/revetements" replace />} />
              <Route path="/fr/finishes" element={<Navigate to="/fr/revetements" replace />} />
              <Route path="/es/rivestimenti" element={<Navigate to="/es/revestimientos" replace />} />
              <Route path="/es/finishes" element={<Navigate to="/es/revestimientos" replace />} />
              <Route path="/de/rivestimenti" element={<Navigate to="/de/verkleidungen" replace />} />
              <Route path="/de/finishes" element={<Navigate to="/de/verkleidungen" replace />} />

              {/* About Us */}
              <Route path="/it/about-us" element={<Navigate to="/it/chi-siamo" replace />} />
              <Route path="/it/qui-sommes-nous" element={<Navigate to="/it/chi-siamo" replace />} />
              <Route path="/it/quienes-somos" element={<Navigate to="/it/chi-siamo" replace />} />
              <Route path="/it/ueber-uns" element={<Navigate to="/it/chi-siamo" replace />} />
              <Route path="/en/chi-siamo" element={<Navigate to="/en/about-us" replace />} />
              <Route path="/fr/chi-siamo" element={<Navigate to="/fr/qui-sommes-nous" replace />} />
              <Route path="/fr/about-us" element={<Navigate to="/fr/qui-sommes-nous" replace />} />
              <Route path="/es/chi-siamo" element={<Navigate to="/es/quienes-somos" replace />} />
              <Route path="/es/about-us" element={<Navigate to="/es/quienes-somos" replace />} />
              <Route path="/de/chi-siamo" element={<Navigate to="/de/ueber-uns" replace />} />
              <Route path="/de/about-us" element={<Navigate to="/de/ueber-uns" replace />} />

              {/* Services */}
              <Route path="/it/services" element={<Navigate to="/it/servizi" replace />} />
              <Route path="/it/servicios" element={<Navigate to="/it/servizi" replace />} />
              <Route path="/it/dienstleistungen" element={<Navigate to="/it/servizi" replace />} />
              <Route path="/en/servizi" element={<Navigate to="/en/services" replace />} />
              <Route path="/fr/servizi" element={<Navigate to="/fr/services" replace />} />
              <Route path="/es/servizi" element={<Navigate to="/es/servicios" replace />} />
              <Route path="/es/services" element={<Navigate to="/es/servicios" replace />} />
              <Route path="/de/servizi" element={<Navigate to="/de/dienstleistungen" replace />} />
              <Route path="/de/services" element={<Navigate to="/de/dienstleistungen" replace />} />

              {/* Burners */}
              <Route path="/it/burners" element={<Navigate to="/it/bruciatori" replace />} />
              <Route path="/it/bruleurs" element={<Navigate to="/it/bruciatori" replace />} />
              <Route path="/it/quemadores" element={<Navigate to="/it/bruciatori" replace />} />
              <Route path="/it/brenner" element={<Navigate to="/it/bruciatori" replace />} />
              <Route path="/en/bruciatori" element={<Navigate to="/en/burners" replace />} />
              <Route path="/fr/bruciatori" element={<Navigate to="/fr/bruleurs" replace />} />
              <Route path="/fr/burners" element={<Navigate to="/fr/bruleurs" replace />} />
              <Route path="/es/bruciatori" element={<Navigate to="/es/quemadores" replace />} />
              <Route path="/es/burners" element={<Navigate to="/es/quemadores" replace />} />
              <Route path="/de/bruciatori" element={<Navigate to="/de/brenner" replace />} />
              <Route path="/de/burners" element={<Navigate to="/de/brenner" replace />} />

              {/* Smoke purifier */}
              <Route path="/it/wood-smoke-purifier" element={<Navigate to="/it/depuratore-fumi" replace />} />
              <Route path="/it/purificateur-fumee" element={<Navigate to="/it/depuratore-fumi" replace />} />
              <Route path="/it/purificador-humo" element={<Navigate to="/it/depuratore-fumi" replace />} />
              <Route path="/it/rauchfilter" element={<Navigate to="/it/depuratore-fumi" replace />} />
              <Route path="/en/depuratore-fumi" element={<Navigate to="/en/wood-smoke-purifier" replace />} />
              <Route path="/fr/depuratore-fumi" element={<Navigate to="/fr/purificateur-fumee" replace />} />
              <Route path="/es/depuratore-fumi" element={<Navigate to="/es/purificador-humo" replace />} />
              <Route path="/de/depuratore-fumi" element={<Navigate to="/de/rauchfilter" replace />} />

              {/* Useful info */}
              <Route path="/it/useful-information" element={<Navigate to="/it/informazioni-utili" replace />} />
              <Route path="/it/informations-utiles" element={<Navigate to="/it/informazioni-utili" replace />} />
              <Route path="/it/informacion-util" element={<Navigate to="/it/informazioni-utili" replace />} />
              <Route path="/it/nuetzliche-informationen" element={<Navigate to="/it/informazioni-utili" replace />} />
              <Route path="/en/informazioni-utili" element={<Navigate to="/en/useful-information" replace />} />
              <Route path="/fr/informazioni-utili" element={<Navigate to="/fr/informations-utiles" replace />} />
              <Route path="/es/informazioni-utili" element={<Navigate to="/es/informacion-util" replace />} />
              <Route path="/de/informazioni-utili" element={<Navigate to="/de/nuetzliche-informationen" replace />} />

              {/* Ready to ship */}
              <Route path="/it/ready-to-ship" element={<Navigate to="/it/pronta-consegna" replace />} />
              <Route path="/en/pronta-consegna" element={<Navigate to="/en/ready-to-ship" replace />} />
              <Route path="/fr/pronta-consegna" element={<Navigate to="/fr/pret-a-expedier" replace />} />
              <Route path="/es/pronta-consegna" element={<Navigate to="/es/listo-para-enviar" replace />} />
              <Route path="/de/pronta-consegna" element={<Navigate to="/de/versandfertig" replace />} />

              {/* Ovens - traditional */}
              <Route path="/it/traditional-ovens" element={<Navigate to="/it/forni-tradizionali" replace />} />
              <Route path="/en/forni-tradizionali" element={<Navigate to="/en/traditional-ovens" replace />} />
              <Route path="/fr/forni-tradizionali" element={<Navigate to="/fr/fours-traditionnels" replace />} />
              <Route path="/es/forni-tradizionali" element={<Navigate to="/es/hornos-tradicionales" replace />} />
              <Route path="/de/forni-tradizionali" element={<Navigate to="/de/traditionelle-oefen" replace />} />

              {/* Ovens - gas */}
              <Route path="/it/gas-ovens" element={<Navigate to="/it/forni-gas" replace />} />
              <Route path="/en/forni-gas" element={<Navigate to="/en/gas-ovens" replace />} />
              <Route path="/fr/forni-gas" element={<Navigate to="/fr/fours-gaz" replace />} />
              <Route path="/es/forni-gas" element={<Navigate to="/es/hornos-gas" replace />} />
              <Route path="/de/forni-gas" element={<Navigate to="/de/gasoefen" replace />} />

              {/* Ovens - electric */}
              <Route path="/it/electric-ovens" element={<Navigate to="/it/forni-elettrici" replace />} />
              <Route path="/en/forni-elettrici" element={<Navigate to="/en/electric-ovens" replace />} />
              <Route path="/fr/forni-elettrici" element={<Navigate to="/fr/fours-electriques" replace />} />
              <Route path="/es/forni-elettrici" element={<Navigate to="/es/hornos-electricos" replace />} />
              <Route path="/de/forni-elettrici" element={<Navigate to="/de/elektrooefen" replace />} />

              {/* Ovens - rotating */}
              <Route path="/it/rotating-ovens" element={<Navigate to="/it/forni-rotanti" replace />} />
              <Route path="/en/forni-rotanti" element={<Navigate to="/en/rotating-ovens" replace />} />
              <Route path="/fr/forni-rotanti" element={<Navigate to="/fr/fours-rotatifs" replace />} />
              <Route path="/es/forni-rotanti" element={<Navigate to="/es/hornos-rotativos" replace />} />
              <Route path="/de/forni-rotanti" element={<Navigate to="/de/drehoefen" replace />} />

              {/* VesuvioBuono */}
              <Route path="/it/vesuviobuono-system" element={<Navigate to="/it/sistema-vesuviobuono" replace />} />
              <Route path="/en/sistema-vesuviobuono" element={<Navigate to="/en/vesuviobuono-system" replace />} />
              <Route path="/fr/sistema-vesuviobuono" element={<Navigate to="/fr/systeme-vesuviobuono" replace />} />
              <Route path="/de/sistema-vesuviobuono" element={<Navigate to="/de/vesuviobuono-system" replace />} />

              
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
              <Route path="/it/rivestimenti" element={<LocalizedRivestimenti lang="it" />} />
              <Route path="/it/chi-siamo" element={<LocalizedAboutUs lang="it" />} />
              <Route path="/it/servizi" element={<LocalizedServices lang="it" />} />
              <Route path="/it/forno-a-legna-da-esterno" element={<ForniLegnaEsterno />} />
              
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
              <Route path="/en/finishes" element={<LocalizedRivestimenti lang="en" />} />
              <Route path="/en/about-us" element={<LocalizedAboutUs lang="en" />} />
              <Route path="/en/services" element={<LocalizedServices lang="en" />} />
              <Route path="/en/neapolitan-pizza-ovens" element={<LocalizedNeapolitanPizzaOvens lang="en" />} />
              <Route path="/en/commercial-wood-fired-pizza-oven" element={<CommercialWoodFiredPizzaOven />} />
              <Route path="/en/commercial-gas-pizza-oven" element={<CommercialGasPizzaOven />} />
              <Route path="/en/rotating-pizza-oven" element={<RotatingPizzaOven />} />
              <Route path="/en/electric-pizza-oven" element={<ElectricPizzaOven />} />
              
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
              <Route path="/fr/revetements" element={<LocalizedRivestimenti lang="fr" />} />
              <Route path="/fr/qui-sommes-nous" element={<LocalizedAboutUs lang="fr" />} />
              <Route path="/fr/services" element={<LocalizedServices lang="fr" />} />
              <Route path="/fr/fours-a-pizza-napolitains" element={<LocalizedNeapolitanPizzaOvens lang="fr" />} />
              <Route path="/fr/four-a-pizza-bois" element={<FourAPizzaBois />} />
              <Route path="/fr/commercial-wood-fired-pizza-oven" element={<CommercialWoodFiredPizzaOven />} />
              <Route path="/fr/commercial-gas-pizza-oven" element={<CommercialGasPizzaOven />} />
              <Route path="/fr/rotating-pizza-oven" element={<RotatingPizzaOven />} />
              <Route path="/fr/electric-pizza-oven" element={<ElectricPizzaOven />} />
              
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
              <Route path="/es/revestimientos" element={<LocalizedRivestimenti lang="es" />} />
              <Route path="/es/quienes-somos" element={<LocalizedAboutUs lang="es" />} />
              <Route path="/es/servicios" element={<LocalizedServices lang="es" />} />
              <Route path="/es/hornos-pizza-napolitana" element={<LocalizedNeapolitanPizzaOvens lang="es" />} />
              <Route path="/es/commercial-wood-fired-pizza-oven" element={<CommercialWoodFiredPizzaOven />} />
              <Route path="/es/commercial-gas-pizza-oven" element={<CommercialGasPizzaOven />} />
              <Route path="/es/rotating-pizza-oven" element={<RotatingPizzaOven />} />
              <Route path="/es/electric-pizza-oven" element={<ElectricPizzaOven />} />
              
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
              <Route path="/de/verkleidungen" element={<LocalizedRivestimenti lang="de" />} />
              <Route path="/de/ueber-uns" element={<LocalizedAboutUs lang="de" />} />
              <Route path="/de/dienstleistungen" element={<LocalizedServices lang="de" />} />
              <Route path="/de/neapolitanische-pizzaoefen" element={<LocalizedNeapolitanPizzaOvens lang="de" />} />
              <Route path="/de/commercial-wood-fired-pizza-oven" element={<CommercialWoodFiredPizzaOven />} />
              <Route path="/de/commercial-gas-pizza-oven" element={<CommercialGasPizzaOven />} />
              <Route path="/de/rotating-pizza-oven" element={<RotatingPizzaOven />} />
              <Route path="/de/electric-pizza-oven" element={<ElectricPizzaOven />} />
              
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
                <Route path="contratti" element={<ERPContratti />} />
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
