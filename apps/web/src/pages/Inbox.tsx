import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Inbox as InboxIcon, Calendar, Lightbulb, Workflow, Brain, User } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useSessionStore } from '../store/sessionStore';
import { useInsightStore } from '../store/insightStore';
import { useMentalModelStore } from '../store/mentalModelStore';
import { usePersonaStore } from '../store/personaStore';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const Inbox: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, setCurrentProject } = useStore();
  const { sessions, fetchSessions } = useSessionStore();
  const { insights, fetchInsights } = useInsightStore();
  const { mentalModels, fetchMentalModels } = useMentalModelStore();
  const { personas, fetchPersonas } = usePersonaStore();

  const currentProject = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
      fetchSessions(projectId);
      fetchInsights(projectId);
      fetchMentalModels(projectId);
      fetchPersonas(projectId);
    } else {
      navigate('/');
    }
  }, [projectId, setCurrentProject, navigate, fetchSessions, fetchInsights, fetchMentalModels, fetchPersonas]);

  // Filter unassigned items
  const unassignedSessions = sessions.filter(s => !s.personaId);
  const unlinkedInsights = insights.filter(i => !i.linkedEntityId && !i.linkedEntityType);
  const projectLevelMentalModels = mentalModels.filter(m => !m.personaId);

  // Get activities not linked to any persona
  const unassignedActivities = currentProject?.activities?.filter(activity => {
    // Check if activity has no persona links
    return !activity.personaIds || activity.personaIds.length === 0;
  }) || [];

  const totalUnassigned =
    unassignedSessions.length +
    unlinkedInsights.length +
    projectLevelMentalModels.length +
    unassignedActivities.length;

  if (!projectId) {
    return (
      <div className="text-center py-12">
        <InboxIcon className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">select a project to view inbox</p>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'projects', href: '/' },
          { label: currentProject?.name || 'Project', href: `/projects/${projectId}` },
          { label: 'inbox' },
        ]}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-medium text-zinc-200 mb-1">inbox</h1>
        <p className="text-xs text-zinc-500">
          unassigned research and activities — assign these to personas to organize your research
        </p>
      </div>

      {totalUnassigned === 0 ? (
        <div className="bg-[#0a0a0a] border border-zinc-700 p-12 text-center">
          <InboxIcon className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-400 mb-2">inbox is empty</p>
          <p className="text-xs text-zinc-600">all research has been assigned to personas</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Unassigned Sessions */}
          {unassignedSessions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-medium text-zinc-300">
                  unassigned sessions ({unassignedSessions.length})
                </h2>
              </div>
              <div className="space-y-2">
                {unassignedSessions.map((session) => (
                  <Link
                    key={session.id}
                    to={`/projects/${projectId}/sessions/${session.id}`}
                    className="block bg-[#0a0a0a] border border-zinc-700 p-4 hover:border-emerald-500 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-zinc-300 mb-1">
                          {session.type.replace('_', ' ')}
                          {session.participantName && ` • ${session.participantName}`}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {new Date(session.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs text-zinc-600">click to assign</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Unlinked Insights */}
          {unlinkedInsights.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <h2 className="text-sm font-medium text-zinc-300">
                  unlinked insights ({unlinkedInsights.length})
                </h2>
              </div>
              <div className="space-y-2">
                {unlinkedInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className="bg-[#0a0a0a] border border-zinc-700 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-zinc-300 mb-1">{insight.content}</p>
                        <p className="text-xs text-zinc-500">{insight.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project-Level Mental Models */}
          {projectLevelMentalModels.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-medium text-zinc-300">
                  project-level mental models ({projectLevelMentalModels.length})
                </h2>
              </div>
              <div className="space-y-2">
                {projectLevelMentalModels.map((model) => (
                  <Link
                    key={model.id}
                    to={`/projects/${projectId}/mental-models/${model.id}`}
                    className="block bg-[#0a0a0a] border border-zinc-700 p-4 hover:border-purple-500 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-zinc-300 mb-1">{model.name}</p>
                        {model.description && (
                          <p className="text-xs text-zinc-500">{model.description}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Unassigned Activities */}
          {unassignedActivities.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Workflow className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-medium text-zinc-300">
                  unassigned activities ({unassignedActivities.length})
                </h2>
              </div>
              <div className="space-y-2">
                {unassignedActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-[#0a0a0a] border border-zinc-700 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-zinc-300 mb-1">{activity.name}</p>
                        {activity.overview && (
                          <p className="text-xs text-zinc-500">{activity.overview}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
