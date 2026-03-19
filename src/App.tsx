import { ConfigProvider, App as AntApp } from "antd";
import zhCN from "antd/locale/zh_CN";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import TrainingPlans from "./pages/training/TrainingPlans";
import PracticePlanList from "./pages/practices/PracticePlanList";
import CharacterConfig from "./pages/characters/CharacterConfig";
import LearningMapLibrary from "./pages/learning-map/LearningMapLibrary";
import KnowledgeBase from "./pages/knowledge-base/KnowledgeBase";
import AICourseware from "./pages/ai-courseware/AICourseware";
import GrowthMap from "./pages/trainees/GrowthMap";
import LearningCenter from "./pages/learning-center/LearningCenter";
import OrganizationSettings from "./pages/settings/OrganizationSettings";
import BadgeManagement from "./pages/badges/BadgeManagement";
import SmartExamBuilder from "./pages/exams/SmartExamBuilder";
import PracticeReports from "./pages/practice-reports/PracticeReports";
import CommunityManagement from "./pages/community/CommunityManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ConfigProvider locale={zhCN}>
    <AntApp>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/training/plans" element={<ProtectedRoute><TrainingPlans /></ProtectedRoute>} />
              <Route path="/practices" element={<ProtectedRoute><PracticePlanList /></ProtectedRoute>} />
              <Route path="/characters" element={<ProtectedRoute><CharacterConfig /></ProtectedRoute>} />
              <Route path="/knowledge-base" element={<ProtectedRoute><KnowledgeBase /></ProtectedRoute>} />
              <Route path="/ai-courseware" element={<ProtectedRoute><AICourseware /></ProtectedRoute>} />
              <Route path="/learning-map" element={<ProtectedRoute><LearningMapLibrary /></ProtectedRoute>} />
              <Route path="/growth-map" element={<ProtectedRoute><GrowthMap /></ProtectedRoute>} />
              <Route path="/learning-center" element={<ProtectedRoute><LearningCenter /></ProtectedRoute>} />
              <Route path="/badges" element={<ProtectedRoute><BadgeManagement /></ProtectedRoute>} />
              <Route path="/exams" element={<ProtectedRoute><SmartExamBuilder /></ProtectedRoute>} />
              <Route path="/practice-reports" element={<ProtectedRoute><PracticeReports /></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><CommunityManagement /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><OrganizationSettings /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </AntApp>
  </ConfigProvider>
);

export default App;
