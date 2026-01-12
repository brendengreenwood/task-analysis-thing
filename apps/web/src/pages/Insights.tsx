import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Lightbulb } from 'lucide-react';
import { useInsightStore, Insight } from '../store/insightStore';
import { useSessionStore } from '../store/sessionStore';
import { usePersonaStore } from '../store/personaStore';
import { useStore } from '../store/useStore';
import { InsightList } from '../components/insights/InsightList';
import { InsightEditor } from '../components/insights/InsightEditor';

export const Insights: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, setCurrentProject } = useStore();
  const { insights, loading, fetchInsights, createInsight, updateInsight, deleteInsight } = useInsightStore();
  const { sessions, fetchSessions } = useSessionStore();
  const { personas, fetchPersonas } = usePersonaStore();

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    } else {
      navigate('/');
    }
  }, [projectId, setCurrentProject, navigate]);

  const [showEditor, setShowEditor] = useState(false);
  const [editingInsight, setEditingInsight] = useState<Insight | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchInsights(projectId);
      fetchSessions(projectId);
      fetchPersonas(projectId);
    }
  }, [projectId, fetchInsights, fetchSessions, fetchPersonas]);

  const handleCreate = () => {
    setEditingInsight(null);
    setShowEditor(true);
  };

  const handleEdit = (insight: Insight) => {
    setEditingInsight(insight);
    setShowEditor(true);
  };

  const handleSave = async (data: Partial<Omit<Insight, 'id' | 'projectId' | 'createdAt'>>) => {
    if (!projectId) return;

    try {
      if (editingInsight) {
        await updateInsight(editingInsight.id, data);
      } else {
        await createInsight(projectId, data as any);
      }
      setShowEditor(false);
      setEditingInsight(null);
    } catch (error) {
      console.error('Failed to save insight:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this insight?')) {
      try {
        await deleteInsight(id);
      } catch (error) {
        console.error('Failed to delete insight:', error);
      }
    }
  };

  if (!projectId) {
    return (
      <div className="text-center py-12">
        <Lightbulb className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">select a project to view insights</p>
      </div>
    );
  }

  const currentProject = projects.find((p) => p.id === projectId);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-zinc-200 mb-1">insights</h1>
          <p className="text-xs text-zinc-500">observations, patterns, quotes, and pain points from research</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-xs text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>new insight</span>
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-sm text-zinc-500">loading insights...</p>
        </div>
      ) : (
        <InsightList
          insights={insights}
          sessions={sessions}
          personas={personas}
          project={currentProject || null}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Editor modal */}
      {showEditor && projectId && (
        <InsightEditor
          insight={editingInsight}
          projectId={projectId}
          onSave={handleSave}
          onClose={() => {
            setShowEditor(false);
            setEditingInsight(null);
          }}
        />
      )}
    </div>
  );
};
