import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDashboard } from './pages/ProjectDashboard';
import { TaskAnalysisPage } from './pages/TaskAnalysisPage';
import { Personas } from './pages/Personas';
import { PersonaDetail } from './pages/PersonaDetail';
import { Sessions } from './pages/Sessions';
import { SessionDetail } from './pages/SessionDetail';
import { Insights } from './pages/Insights';
import { MentalModels } from './pages/MentalModels';
import { MentalModelDetail } from './pages/MentalModelDetail';
import { useStore } from './store/useStore';

function App() {
  const init = useStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDashboard />} />
        <Route path="/projects/:projectId/task-analysis" element={<TaskAnalysisPage />} />
        <Route path="/projects/:projectId/personas" element={<Personas />} />
        <Route path="/projects/:projectId/personas/:personaId" element={<PersonaDetail />} />
        <Route path="/projects/:projectId/sessions" element={<Sessions />} />
        <Route path="/projects/:projectId/sessions/:sessionId" element={<SessionDetail />} />
        <Route path="/projects/:projectId/insights" element={<Insights />} />
        <Route path="/projects/:projectId/mental-models" element={<MentalModels />} />
        <Route path="/projects/:projectId/mental-models/:modelId" element={<MentalModelDetail />} />
      </Routes>
    </Layout>
  );
}

export default App;