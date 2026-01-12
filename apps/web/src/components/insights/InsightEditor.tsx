import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Insight, InsightType, InsightSeverity, LinkedEntityType } from '../../store/insightStore';
import { useSessionStore } from '../../store/sessionStore';
import { usePersonaStore } from '../../store/personaStore';
import { useStore } from '../../store/useStore';

interface InsightEditorProps {
  insight?: Insight | null;
  projectId: string;
  prefilledEntity?: {
    type: LinkedEntityType;
    id: string;
  } | null;
  onSave: (data: Partial<Omit<Insight, 'id' | 'projectId' | 'createdAt'>>) => void;
  onClose: () => void;
}

const INSIGHT_TYPES: { value: InsightType; label: string }[] = [
  { value: 'observation', label: 'Observation' },
  { value: 'pattern', label: 'Pattern' },
  { value: 'quote', label: 'Quote' },
  { value: 'pain_point', label: 'Pain Point' },
];

const SEVERITIES: { value: InsightSeverity; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const ENTITY_TYPES: { value: LinkedEntityType; label: string }[] = [
  { value: 'activity', label: 'Activity' },
  { value: 'task', label: 'Task' },
  { value: 'operation', label: 'Operation' },
  { value: 'persona', label: 'Persona' },
];

export const InsightEditor: React.FC<InsightEditorProps> = ({
  insight,
  projectId,
  prefilledEntity,
  onSave,
  onClose,
}) => {
  const { sessions, fetchSessions } = useSessionStore();
  const { personas, fetchPersonas } = usePersonaStore();
  const { projects } = useStore();

  const [content, setContent] = useState(insight?.content || '');
  const [type, setType] = useState<InsightType>(insight?.type || 'observation');
  const [severity, setSeverity] = useState<InsightSeverity | ''>(insight?.severity || '');
  const [sessionId, setSessionId] = useState(insight?.sessionId || '');
  const [linkedEntityType, setLinkedEntityType] = useState<LinkedEntityType | ''>(
    prefilledEntity?.type || insight?.linkedEntityType || ''
  );
  const [linkedEntityId, setLinkedEntityId] = useState(
    prefilledEntity?.id || insight?.linkedEntityId || ''
  );

  useEffect(() => {
    if (projectId) {
      fetchSessions(projectId);
      fetchPersonas(projectId);
    }
  }, [projectId, fetchSessions, fetchPersonas]);

  useEffect(() => {
    if (insight) {
      setContent(insight.content);
      setType(insight.type);
      setSeverity(insight.severity || '');
      setSessionId(insight.sessionId || '');
      setLinkedEntityType(insight.linkedEntityType || '');
      setLinkedEntityId(insight.linkedEntityId || '');
    }
  }, [insight]);

  // Get current project
  const currentProject = projects.find((p) => p.id === projectId);

  // Get all activities, tasks, operations
  const activities = currentProject?.activities || [];
  const tasks = activities.flatMap((a) => a.tasks.map((t) => ({ ...t, activityId: a.id })));
  const operations = tasks.flatMap((t) =>
    t.operations.map((o) => ({ ...o, taskId: t.id, activityId: t.activityId }))
  );

  // Get entities based on selected type
  const getEntitiesForType = () => {
    switch (linkedEntityType) {
      case 'activity':
        return activities.map((a) => ({ id: a.id, name: a.name }));
      case 'task':
        return tasks.map((t) => ({ id: t.id, name: t.name }));
      case 'operation':
        return operations.map((o) => ({ id: o.id, name: o.name }));
      case 'persona':
        return personas.map((p) => ({ id: p.id, name: p.name }));
      default:
        return [];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSave({
      content: content.trim(),
      type,
      severity: type === 'pain_point' && severity ? (severity as InsightSeverity) : null,
      sessionId: sessionId || null,
      linkedEntityType: linkedEntityType || null,
      linkedEntityId: linkedEntityId || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0a] border border-zinc-700 max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-zinc-700 px-5 py-2.5 flex items-center justify-between flex-shrink-0">
          <h2 className="text-sm font-medium text-zinc-300">
            {insight ? 'edit insight' : 'new insight'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">
            {/* Content */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">content *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-yellow-500 resize-none"
                placeholder="Describe the insight, observation, pattern, or pain point..."
                rows={6}
                required
                autoFocus
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as InsightType)}
                className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              >
                {INSIGHT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity (only for pain_point) */}
            {type === 'pain_point' && (
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as InsightSeverity)}
                  className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                >
                  <option value="">None</option>
                  {SEVERITIES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Session Link */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">linked session</label>
              <select
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              >
                <option value="">None</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.type} - {new Date(session.date).toLocaleDateString()}
                    {session.participantName && ` (${session.participantName})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Entity Type */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">linked to</label>
              <select
                value={linkedEntityType}
                onChange={(e) => {
                  setLinkedEntityType(e.target.value as LinkedEntityType);
                  setLinkedEntityId(''); // Reset entity ID when type changes
                }}
                className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              >
                <option value="">None</option>
                {ENTITY_TYPES.map((et) => (
                  <option key={et.value} value={et.value}>
                    {et.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Entity ID */}
            {linkedEntityType && (
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  select {linkedEntityType}
                </label>
                <select
                  value={linkedEntityId}
                  onChange={(e) => setLinkedEntityId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                >
                  <option value="">None</option>
                  {getEntitiesForType().map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-700 px-5 py-3 flex items-center justify-end gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs bg-yellow-600 hover:bg-yellow-700 text-white transition-colors"
            >
              {insight ? 'save changes' : 'create insight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
