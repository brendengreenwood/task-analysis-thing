import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDashboard } from './pages/ProjectDashboard';
import { TaskAnalysisPage } from './pages/TaskAnalysisPage';
import { Personas } from './pages/Personas';
import { Sessions } from './pages/Sessions';
import { Insights } from './pages/Insights';
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
        <Route path="/projects/:projectId/sessions" element={<Sessions />} />
        <Route path="/projects/:projectId/insights" element={<Insights />} />
      </Routes>
    </Layout>
  );
}

export default App;