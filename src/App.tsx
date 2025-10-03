import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LocalizedIndex from "./pages/LocalizedIndex";
import LocalizedArchitettoAI from "./pages/LocalizedArchitettoAI";
import LanguageRedirect from "./pages/LanguageRedirect";
import ArchitettoAIRedirect from "./pages/ArchitettoAIRedirect";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";

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
            <Route path="/it/thank-you-it" element={<ThankYou lang="it" />} />
            
            {/* English Routes */}
            <Route path="/en" element={<LocalizedIndex lang="en" />} />
            <Route path="/en/architettoai" element={<LocalizedArchitettoAI lang="en" />} />
            <Route path="/en/thank-you-en" element={<ThankYou lang="en" />} />
            
            {/* French Routes */}
            <Route path="/fr" element={<LocalizedIndex lang="fr" />} />
            <Route path="/fr/architettoai" element={<LocalizedArchitettoAI lang="fr" />} />
            <Route path="/fr/thank-you-fr" element={<ThankYou lang="fr" />} />
            
            {/* Spanish Routes */}
            <Route path="/es" element={<LocalizedIndex lang="es" />} />
            <Route path="/es/architettoai" element={<LocalizedArchitettoAI lang="es" />} />
            <Route path="/es/thank-you-es" element={<ThankYou lang="es" />} />
            
            {/* German Routes */}
            <Route path="/de" element={<LocalizedIndex lang="de" />} />
            <Route path="/de/architettoai" element={<LocalizedArchitettoAI lang="de" />} />
            <Route path="/de/thank-you-de" element={<ThankYou lang="de" />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
