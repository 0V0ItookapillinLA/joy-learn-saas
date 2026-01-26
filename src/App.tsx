import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TrainingPlans from "./pages/training/TrainingPlans";
import PracticeManagement from "./pages/training/PracticeManagement";
import TraineeList from "./pages/trainees/TraineeList";
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/training/plans" element={<TrainingPlans />} />
            <Route path="/training/practices" element={<PracticeManagement />} />
            <Route path="/training/assessments" element={<TrainingPlans />} />
            <Route path="/trainees/list" element={<TraineeList />} />
            <Route path="/trainees/invitations" element={<TraineeList />} />
            <Route path="/trainees/growth-map" element={<GrowthMap />} />
            <Route path="/characters" element={<PracticeManagement />} />
            <Route path="/content/knowledge" element={<TrainingPlans />} />
            <Route path="/content/questions" element={<TrainingPlans />} />
            <Route path="/analytics/training" element={<TrainingAnalytics />} />
            <Route path="/analytics/practice" element={<TrainingAnalytics />} />
            <Route path="/settings/organization" element={<OrganizationSettings />} />
            <Route path="/settings/permissions" element={<OrganizationSettings />} />
            <Route path="/settings/plans" element={<OrganizationSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
