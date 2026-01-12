import React, { useState } from 'react';
import { Plus, Lightbulb, Eye, Quote, AlertCircle, X, Trash } from 'lucide-react';

interface Insight {
  id: string;
  content: string;
  type: 'observation' | 'pattern' | 'quote' | 'pain_point';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  linkedEntityType?: string;
  linkedEntityId?: string;
  createdAt: Date;
}

interface InsightsSidebarProps {
  sessionId: string;
  projectId: string;
  insights: Insight[];
  onInsightCreated: () => void;
  prefillContent?: string;
  prefillType?: 'observation' | 'pattern' | 'quote' | 'pain_point';
}

export const InsightsSidebar: React.FC<InsightsSidebarProps> = ({
  sessionId,
  projectId,
  insights,
  onInsightCreated,
  prefillContent,
  prefillType,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [type, setType] = useState<'observation' | 'pattern' | 'quote' | 'pain_point'>('observation');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [creating, setCreating] = useState(false);

  // Auto-prefill if provided
  React.useEffect(() => {
    if (prefillContent) {
      setContent(prefillContent);
      setShowForm(true);
    }
    if (prefillType) {
      setType(prefillType);
    }
  }, [prefillContent, prefillType]);

  const handleCreate = async () => {
    if (!content.trim()) return;

    setCreating(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          content: content.trim(),
          type,
          severity: type === 'pain_point' ? severity : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to create insight');

      setContent('');
      setType('observation');
      setSeverity('medium');
      setShowForm(false);
      onInsightCreated();
    } catch (error) {
      console.error('Error creating insight:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (insightId: string) => {
    if (!confirm('Delete this insight?')) return;

    try {
      const response = await fetch(`/api/insights/${insightId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete insight');

      onInsightCreated(); // Refresh list
    } catch (error) {
      console.error('Error deleting insight:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'observation':
        return <Eye className="w-3 h-3" />;
      case 'pattern':
        return <Lightbulb className="w-3 h-3" />;
      case 'quote':
        return <Quote className="w-3 h-3" />;
      case 'pain_point':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Lightbulb className="w-3 h-3" />;
    }
  };

  const getTypeColor = (type: string) => {
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

  const getSeverityColor = (severity: string) => {
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-300">insights ({insights.length})</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          title="New insight"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 p-3 mb-3 space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe the insight..."
            className="w-full bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            rows={3}
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full bg-zinc-800 border border-zinc-700 px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="observation">Observation</option>
            <option value="pattern">Pattern</option>
            <option value="quote">Quote</option>
            <option value="pain_point">Pain Point</option>
          </select>

          {type === 'pain_point' && (
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="w-full bg-zinc-800 border border-zinc-700 px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={creating || !content.trim()}
              className="flex-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white transition-colors"
            >
              {creating ? 'creating...' : 'create'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setContent('');
              }}
              className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              cancel
            </button>
          </div>
        </div>
      )}

      {/* Insights list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-xs text-zinc-600">no insights yet</p>
          </div>
        ) : (
          insights.map((insight) => (
            <div key={insight.id} className="bg-zinc-900 border border-zinc-700 p-2 group">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className={`flex items-center gap-1 px-1.5 py-0.5 text-xs border ${getTypeColor(insight.type)}`}>
                  {getTypeIcon(insight.type)}
                  <span>{insight.type.replace('_', ' ')}</span>
                </div>
                <button
                  onClick={() => handleDelete(insight.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-zinc-800 text-zinc-600 hover:text-red-400 transition-all"
                  title="Delete"
                >
                  <Trash className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-1">{insight.content}</p>
              {insight.severity && (
                <span className={`text-xs font-medium ${getSeverityColor(insight.severity)}`}>
                  {insight.severity}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
