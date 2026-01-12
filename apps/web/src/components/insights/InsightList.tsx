import React, { useState } from 'react';
import { InsightCard } from './InsightCard';
import { Insight, InsightType } from '../../store/insightStore';
import { ResearchSession } from '../../store/sessionStore';
import { Persona } from '../../store/personaStore';
import { Project } from '../../types';

interface InsightListProps {
  insights: Insight[];
  sessions: ResearchSession[];
  personas: Persona[];
  project: Project | null;
  onEdit: (insight: Insight) => void;
  onDelete: (id: string) => void;
}

export const InsightList: React.FC<InsightListProps> = ({
  insights,
  sessions,
  personas,
  project,
  onEdit,
  onDelete,
}) => {
  const [typeFilter, setTypeFilter] = useState<InsightType | ''>('');
  const [sessionFilter, setSessionFilter] = useState<string>('');

  // Filter insights
  const filteredInsights = insights.filter((insight) => {
    if (typeFilter && insight.type !== typeFilter) return false;
    if (sessionFilter && insight.sessionId !== sessionFilter) return false;
    return true;
  });

  // Sort insights by date (newest first)
  const sortedInsights = [...filteredInsights].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Helper to get entity name
  const getEntityName = (insight: Insight) => {
    if (!insight.linkedEntityType || !insight.linkedEntityId || !project) return undefined;

    switch (insight.linkedEntityType) {
      case 'activity':
        return project.activities.find((a) => a.id === insight.linkedEntityId)?.name;
      case 'task':
        for (const activity of project.activities) {
          const task = activity.tasks.find((t) => t.id === insight.linkedEntityId);
          if (task) return task.name;
        }
        return undefined;
      case 'operation':
        for (const activity of project.activities) {
          for (const task of activity.tasks) {
            const operation = task.operations.find((o) => o.id === insight.linkedEntityId);
            if (operation) return operation.name;
          }
        }
        return undefined;
      case 'persona':
        return personas.find((p) => p.id === insight.linkedEntityId)?.name;
      default:
        return undefined;
    }
  };

  if (insights.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-zinc-500">no insights yet</p>
        <p className="text-xs text-zinc-600 mt-1">create your first insight to get started</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as InsightType | '')}
            className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          >
            <option value="">All types</option>
            <option value="observation">Observations</option>
            <option value="pattern">Patterns</option>
            <option value="quote">Quotes</option>
            <option value="pain_point">Pain Points</option>
          </select>
        </div>
        <div className="flex-1">
          <select
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          >
            <option value="">All sessions</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.type} - {new Date(session.date).toLocaleDateString()}
                {session.participantName && ` (${session.participantName})`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs text-zinc-500 mb-3">
        {sortedInsights.length} {sortedInsights.length === 1 ? 'insight' : 'insights'}
        {(typeFilter || sessionFilter) && ' (filtered)'}
      </div>

      {/* Insights grid */}
      {sortedInsights.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-zinc-500">no insights match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedInsights.map((insight) => {
            const session = insight.sessionId
              ? sessions.find((s) => s.id === insight.sessionId)
              : undefined;
            const sessionName = session
              ? `${session.type} (${new Date(session.date).toLocaleDateString()})`
              : undefined;
            const entityName = getEntityName(insight);

            return (
              <InsightCard
                key={insight.id}
                insight={insight}
                sessionName={sessionName}
                entityName={entityName}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
