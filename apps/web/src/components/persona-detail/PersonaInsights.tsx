import React, { useState } from 'react';
import { Lightbulb, AlertCircle, MessageSquare, Eye, Quote } from 'lucide-react';

interface PersonaInsightsProps {
  persona: any;
}

type InsightType = 'all' | 'observation' | 'pattern' | 'quote' | 'pain_point';
type SeverityType = 'all' | 'critical' | 'high' | 'medium' | 'low';

export const PersonaInsights: React.FC<PersonaInsightsProps> = ({ persona }) => {
  const insights = persona.insights || [];
  const [typeFilter, setTypeFilter] = useState<InsightType>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityType>('all');

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'observation':
        return <Eye className="w-4 h-4" />;
      case 'pattern':
        return <Lightbulb className="w-4 h-4" />;
      case 'quote':
        return <Quote className="w-4 h-4" />;
      case 'pain_point':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'observation':
        return 'text-blue-400 bg-blue-950 border-blue-800';
      case 'pattern':
        return 'text-green-400 bg-green-950 border-green-800';
      case 'quote':
        return 'text-purple-400 bg-purple-950 border-purple-800';
      case 'pain_point':
        return 'text-red-400 bg-red-950 border-red-800';
      default:
        return 'text-zinc-400 bg-zinc-900 border-zinc-700';
    }
  };

  const getSeverityColor = (severity: string | null) => {
    if (!severity) return 'text-zinc-500';
    switch (severity) {
      case 'critical':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-blue-400';
      default:
        return 'text-zinc-500';
    }
  };

  const getLinkedEntityLabel = (insight: any) => {
    if (!insight.linkedEntityType || !insight.linkedEntityId) return null;

    switch (insight.linkedEntityType) {
      case 'activity':
        const activity = persona.activities?.find((a: any) => a.id === insight.linkedEntityId);
        return activity ? `workflow: ${activity.name}` : 'workflow';
      case 'task':
        // Find task in activities
        for (const activity of persona.activities || []) {
          const task = activity.tasks?.find((t: any) => t.id === insight.linkedEntityId);
          if (task) return `task: ${task.name}`;
        }
        return 'task';
      case 'operation':
        // Find operation in tasks
        for (const activity of persona.activities || []) {
          for (const task of activity.tasks || []) {
            const operation = task.operations?.find((o: any) => o.id === insight.linkedEntityId);
            if (operation) return `operation: ${operation.name}`;
          }
        }
        return 'operation';
      case 'persona':
        return 'direct persona insight';
      default:
        return null;
    }
  };

  // Filter insights
  let filteredInsights = insights;

  if (typeFilter !== 'all') {
    filteredInsights = filteredInsights.filter((i: any) => i.type === typeFilter);
  }

  if (severityFilter !== 'all') {
    filteredInsights = filteredInsights.filter((i: any) => i.severity === severityFilter);
  }

  // Group insights by type
  const groupedInsights = {
    pain_point: filteredInsights.filter((i: any) => i.type === 'pain_point'),
    observation: filteredInsights.filter((i: any) => i.type === 'observation'),
    pattern: filteredInsights.filter((i: any) => i.type === 'pattern'),
    quote: filteredInsights.filter((i: any) => i.type === 'quote'),
  };

  if (insights.length === 0) {
    return (
      <div className="text-center py-12">
        <Lightbulb className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">no insights for this persona</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-[#0a0a0a] border border-zinc-700 p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Type Filter */}
          <div>
            <label className="text-xs text-zinc-500 mb-2 block">filter by type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as InsightType)}
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm px-2 py-1.5 focus:outline-none focus:border-zinc-600"
            >
              <option value="all">all types ({insights.length})</option>
              <option value="pain_point">pain points ({groupedInsights.pain_point.length})</option>
              <option value="observation">observations ({groupedInsights.observation.length})</option>
              <option value="pattern">patterns ({groupedInsights.pattern.length})</option>
              <option value="quote">quotes ({groupedInsights.quote.length})</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="text-xs text-zinc-500 mb-2 block">filter by severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as SeverityType)}
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm px-2 py-1.5 focus:outline-none focus:border-zinc-600"
            >
              <option value="all">all severities</option>
              <option value="critical">critical</option>
              <option value="high">high</option>
              <option value="medium">medium</option>
              <option value="low">low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Insights List */}
      {filteredInsights.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-zinc-500">no insights match the current filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInsights.map((insight: any) => {
            const linkedLabel = getLinkedEntityLabel(insight);

            return (
              <div key={insight.id} className="bg-[#0a0a0a] border border-zinc-700 p-4">
                {/* Insight Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className={`flex items-center gap-2 px-2 py-1 text-xs border ${getInsightTypeColor(insight.type)}`}>
                    {getInsightTypeIcon(insight.type)}
                    <span>{insight.type.replace('_', ' ')}</span>
                  </div>
                  {insight.severity && insight.type === 'pain_point' && (
                    <span className={`text-xs font-medium ${getSeverityColor(insight.severity)}`}>
                      {insight.severity}
                    </span>
                  )}
                </div>

                {/* Content */}
                <p className="text-sm text-zinc-300 leading-relaxed mb-2">{insight.content}</p>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-zinc-600">
                  {linkedLabel && <span>{linkedLabel}</span>}
                  {insight.createdAt && (
                    <span>
                      {new Date(insight.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      <div className="bg-zinc-900 border border-zinc-700 p-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-zinc-500 mb-1">pain points</p>
            <p className="text-lg font-medium text-red-400">{groupedInsights.pain_point.length}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">observations</p>
            <p className="text-lg font-medium text-blue-400">{groupedInsights.observation.length}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">patterns</p>
            <p className="text-lg font-medium text-green-400">{groupedInsights.pattern.length}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">quotes</p>
            <p className="text-lg font-medium text-purple-400">{groupedInsights.quote.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
