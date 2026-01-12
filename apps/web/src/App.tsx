import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectPage } from './pages/ProjectPage';
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
        <Route path="/projects/:projectId" element={<ProjectPage />} />
        <Route path="/personas" element={<Personas />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/insights" element={<Insights />} />
      </Routes>
    </Layout>
  );
}

export default App;