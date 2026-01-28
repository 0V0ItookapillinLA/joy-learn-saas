import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import TrainingPlans from "./pages/training/TrainingPlans";
import PracticePlanList from "./pages/practices/PracticePlanList";
import CharacterConfig from "./pages/characters/CharacterConfig";
import LearningMapLibrary from "./pages/learning-map/LearningMapLibrary";
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
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/training/plans" element={
              <ProtectedRoute>
                <TrainingPlans />
              </ProtectedRoute>
            } />
            <Route path="/practices" element={
              <ProtectedRoute>
                <PracticePlanList />
              </ProtectedRoute>
            } />
            <Route path="/characters" element={
              <ProtectedRoute>
                <CharacterConfig />
              </ProtectedRoute>
            } />
            <Route path="/learning-map" element={
              <ProtectedRoute>
                <LearningMapLibrary />
              </ProtectedRoute>
            } />
            <Route path="/growth-map" element={
              <ProtectedRoute>
                <GrowthMap />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <TrainingAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <OrganizationSettings />
              </ProtectedRoute>
            } />
            
            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
