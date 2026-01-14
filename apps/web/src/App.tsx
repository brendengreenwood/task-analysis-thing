import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDashboard } from './pages/ProjectDashboard';
import { TaskAnalysisPage } from './pages/TaskAnalysisPage';
import { Personas } from './pages/Personas';
import { PersonaDetail } from './pages/PersonaDetail';
import { SessionDetail } from './pages/SessionDetail';
import { MentalModelDetail } from './pages/MentalModelDetail';
import { Inbox } from './pages/Inbox';
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
        <Route path="/projects/:projectId/inbox" element={<Inbox />} />
        {/* Keep detail routes accessible for backward compatibility and deep linking */}
        <Route path="/projects/:projectId/sessions/:sessionId" element={<SessionDetail />} />
        <Route path="/projects/:projectId/mental-models/:modelId" element={<MentalModelDetail />} />
      </Routes>
    </Layout>
  );
}

export default App;
