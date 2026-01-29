import { ConfigProvider, App as AntApp } from "antd";
import zhCN from "antd/locale/zh_CN";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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
  <ConfigProvider locale={zhCN}>
    <AntApp>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/training/plans" element={<TrainingPlans />} />
            <Route path="/practices" element={<PracticePlanList />} />
            <Route path="/characters" element={<CharacterConfig />} />
            <Route path="/learning-map" element={<LearningMapLibrary />} />
            <Route path="/growth-map" element={<GrowthMap />} />
            <Route path="/analytics" element={<TrainingAnalytics />} />
            <Route path="/settings" element={<OrganizationSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </AntApp>
  </ConfigProvider>
);

export default App;
