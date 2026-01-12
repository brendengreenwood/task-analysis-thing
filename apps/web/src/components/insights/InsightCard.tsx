import React from 'react';
import { Edit, Trash, AlertCircle, Calendar, Link as LinkIcon } from 'lucide-react';
import { Insight } from '../../store/insightStore';

interface InsightCardProps {
  insight: Insight;
  sessionName?: string;
  entityName?: string;
  onEdit: (insight: Insight) => void;
  onDelete: (id: string) => void;
}

const INSIGHT_TYPE_LABELS: Record<string, string> = {
  observation: 'Observation',
  pattern: 'Pattern',
  quote: 'Quote',
  pain_point: 'Pain Point',
};

const INSIGHT_TYPE_COLORS: Record<string, string> = {
  observation: 'blue',
  pattern: 'purple',
  quote: 'emerald',
  pain_point: 'red',
};

const SEVERITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const SEVERITY_COLORS: Record<string, string> = {
  low: 'zinc',
  medium: 'amber',
  high: 'orange',
  critical: 'red',
};

export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  sessionName,
  entityName,
  onEdit,
  onDelete,
}) => {
  const color = INSIGHT_TYPE_COLORS[insight.type] || 'zinc';

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="bg-[#0a0a0a] border border-zinc-700 overflow-hidden hover:border-zinc-600 transition-colors">
      <div className="flex">
        <div className={`w-1 bg-gradient-to-b from-${color}-500 to-${color}-700 flex-shrink-0`} />
        <div className="flex-grow">
          {/* Header */}
          <div className="p-3 border-b border-zinc-800">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium bg-${color}-500/20 text-${color}-300 border border-${color}-500/30`}>
                    {INSIGHT_TYPE_LABELS[insight.type]}
                  </span>
                  {insight.type === 'pain_point' && insight.severity && (
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-${SEVERITY_COLORS[insight.severity]}-500/20 text-${SEVERITY_COLORS[insight.severity]}-300 border border-${SEVERITY_COLORS[insight.severity]}-500/30`}>
                      <AlertCircle className="w-3 h-3" />
                      {SEVERITY_LABELS[insight.severity]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Calendar className="w-3 h-3" />
                  {formatDate(insight.createdAt)}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(insight)}
                  className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(insight.id)}
                  className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
              {insight.content}
            </div>

            {/* Links */}
            <div className="flex items-center gap-3 text-xs text-zinc-500 pt-1">
              {sessionName && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>from: {sessionName}</span>
                </div>
              )}
              {entityName && insight.linkedEntityType && (
                <div className="flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  <span>
                    linked to {insight.linkedEntityType}: {entityName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
