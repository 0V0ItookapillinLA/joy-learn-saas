import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import TrainingPlans from "./pages/training/TrainingPlans";
import PracticePlanList from "./pages/practices/PracticePlanList";
import CharacterConfig from "./pages/characters/CharacterConfig";
import GrowthMap from "./pages/trainees/GrowthMap";
import TrainingAnalytics from "./pages/analytics/TrainingAnalytics";
import OrganizationSettings from "./pages/settings/OrganizationSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/training/plans" element={<TrainingPlans />} />
            <Route path="/practices" element={<PracticePlanList />} />
            <Route path="/characters" element={<CharacterConfig />} />
            <Route path="/growth-map" element={<GrowthMap />} />
            <Route path="/analytics" element={<TrainingAnalytics />} />
            <Route path="/settings" element={<OrganizationSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
