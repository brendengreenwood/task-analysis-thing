import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, Calendar, Lightbulb, Workflow, Brain } from 'lucide-react';
import { useStore } from '../store/useStore';
import { usePersonaStore } from '../store/personaStore';
import { useSessionStore } from '../store/sessionStore';
import { useInsightStore } from '../store/insightStore';
import { useMentalModelStore } from '../store/mentalModelStore';

export const ProjectDashboard: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, setCurrentProject } = useStore();
  const { personas, fetchPersonas } = usePersonaStore();
  const { sessions, fetchSessions } = useSessionStore();
  const { insights, fetchInsights } = useInsightStore();
  const { mentalModels, fetchMentalModels } = useMentalModelStore();

  const currentProject = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (!currentProject) {
      navigate('/');
      return;
    }
    setCurrentProject(projectId!);
  }, [projectId, currentProject, navigate, setCurrentProject]);

  useEffect(() => {
    if (projectId) {
      fetchPersonas(projectId);
      fetchSessions(projectId);
      fetchInsights(projectId);
      fetchMentalModels(projectId);
    }
  }, [projectId, fetchPersonas, fetchSessions, fetchInsights, fetchMentalModels]);

  if (!currentProject) {
    return null;
  }

  const activityCount = currentProject.activities.length;
  const taskCount = currentProject.activities.reduce((acc, a) => acc + a.tasks.length, 0);
  const operationCount = currentProject.activities.reduce(
    (acc, a) => acc + a.tasks.reduce((tAcc, t) => tAcc + t.operations.length, 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="border-b border-zinc-700 pb-4">
        <h1 className="text-xl font-medium text-zinc-200 mb-1">{currentProject.name}</h1>
        {currentProject.description && (
          <p className="text-sm text-zinc-500">{currentProject.description}</p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Personas */}
        <Link
          to={`/projects/${projectId}/personas`}
          className="bg-[#0a0a0a] border border-zinc-700 p-4 hover:border-zinc-600 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-1 h-12 bg-gradient-to-b from-blue-500 to-blue-700" />
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-medium text-zinc-200 mb-1">{personas.length}</div>
          <div className="text-xs text-zinc-500">personas</div>
        </Link>

        {/* Sessions */}
        <Link
          to={`/projects/${projectId}/sessions`}
          className="bg-[#0a0a0a] border border-zinc-700 p-4 hover:border-zinc-600 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-1 h-12 bg-gradient-to-b from-emerald-500 to-emerald-700" />
            <Calendar className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-medium text-zinc-200 mb-1">{sessions.length}</div>
          <div className="text-xs text-zinc-500">research sessions</div>
        </Link>

        {/* Insights */}
        <Link
          to={`/projects/${projectId}/insights`}
          className="bg-[#0a0a0a] border border-zinc-700 p-4 hover:border-zinc-600 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-1 h-12 bg-gradient-to-b from-yellow-500 to-yellow-700" />
            <Lightbulb className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-medium text-zinc-200 mb-1">{insights.length}</div>
          <div className="text-xs text-zinc-500">insights</div>
        </Link>

        {/* Mental Models */}
        <Link
          to={`/projects/${projectId}/mental-models`}
          className="bg-[#0a0a0a] border border-zinc-700 p-4 hover:border-zinc-600 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-1 h-12 bg-gradient-to-b from-purple-500 to-purple-700" />
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-medium text-zinc-200 mb-1">{mentalModels.length}</div>
          <div className="text-xs text-zinc-500">mental models</div>
        </Link>

        {/* Task Analysis */}
        <Link
          to={`/projects/${projectId}/task-analysis`}
          className="bg-[#0a0a0a] border border-zinc-700 p-4 hover:border-zinc-600 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-1 h-12 bg-gradient-to-b from-indigo-500 to-indigo-700" />
            <Workflow className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-medium text-zinc-200 mb-1">
            {activityCount}
          </div>
          <div className="text-xs text-zinc-500">
            activities · {taskCount} tasks · {operationCount} operations
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#0a0a0a] border border-zinc-700 p-5">
        <h2 className="text-sm font-medium text-zinc-300 mb-3">quick actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            to={`/projects/${projectId}/task-analysis`}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-200 transition-colors"
          >
            <Workflow className="w-4 h-4" />
            <span>open task analysis</span>
          </Link>
          <Link
            to={`/projects/${projectId}/personas`}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-200 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>manage personas</span>
          </Link>
          <Link
            to={`/projects/${projectId}/sessions`}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-200 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>view sessions</span>
          </Link>
          <Link
            to={`/projects/${projectId}/insights`}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-200 transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            <span>browse insights</span>
          </Link>
          <Link
            to={`/projects/${projectId}/mental-models`}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-200 transition-colors"
          >
            <Brain className="w-4 h-4" />
            <span>view mental models</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
