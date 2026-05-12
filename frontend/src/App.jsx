import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import DatasetPage from './pages/DatasetPage';
import TrainingPage from './pages/TrainingPage';
import ComparisonPage from './pages/ComparisonPage';
import VisualizationPage from './pages/VisualizationPage';
import DeployPage from './pages/DeployPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RecipeHubPage from './pages/RecipeHubPage';
import FusionLabPage from './pages/FusionLabPage';
import DatasetBuilderPage from './pages/DatasetBuilderPage';
import PlaygroundPage from './pages/PlaygroundPage';
import ExperimentsPage from './pages/ExperimentsPage';
import DistillationPage from './pages/DistillationPage';
import AgentTrainingPage from './pages/AgentTrainingPage';
import MarketplacePage from './pages/MarketplacePage';
import LocalModePage from './pages/LocalModePage';
import MultiModalPage from './pages/MultiModalPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/datasets" element={<DatasetPage />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/comparison" element={<ComparisonPage />} />
            <Route path="/visualize" element={<VisualizationPage />} />
            <Route path="/deploy" element={<DeployPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/recipes" element={<RecipeHubPage />} />
            <Route path="/fusion" element={<FusionLabPage />} />
            <Route path="/builder" element={<DatasetBuilderPage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/experiments" element={<ExperimentsPage />} />
            <Route path="/distillation" element={<DistillationPage />} />
            <Route path="/agents" element={<AgentTrainingPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/local" element={<LocalModePage />} />
            <Route path="/multimodal" element={<MultiModalPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
