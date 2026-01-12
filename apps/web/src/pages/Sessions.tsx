import React, { useState, useEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { useSessionStore, ResearchSession } from '../store/sessionStore';
import { usePersonaStore } from '../store/personaStore';
import { useStore } from '../store/useStore';
import { SessionList } from '../components/sessions/SessionList';
import { SessionEditor } from '../components/sessions/SessionEditor';

export const Sessions: React.FC = () => {
  const currentProjectId = useStore((state) => state.currentProjectId);
  const { sessions, loading, fetchSessions, createSession, updateSession, deleteSession } = useSessionStore();
  const { personas, fetchPersonas } = usePersonaStore();

  const [showEditor, setShowEditor] = useState(false);
  const [editingSession, setEditingSession] = useState<ResearchSession | null>(null);

  useEffect(() => {
    if (currentProjectId) {
      fetchSessions(currentProjectId);
      fetchPersonas(currentProjectId);
    }
  }, [currentProjectId, fetchSessions, fetchPersonas]);

  const handleCreate = () => {
    setEditingSession(null);
    setShowEditor(true);
  };

  const handleEdit = (session: ResearchSession) => {
    setEditingSession(session);
    setShowEditor(true);
  };

  const handleSave = async (data: Partial<Omit<ResearchSession, 'id' | 'projectId'>>) => {
    if (!currentProjectId) return;

    try {
      if (editingSession) {
        await updateSession(editingSession.id, data);
      } else {
        await createSession(currentProjectId, data as any);
      }
      setShowEditor(false);
      setEditingSession(null);
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        await deleteSession(id);
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  if (!currentProjectId) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">select a project to view sessions</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-zinc-200 mb-1">research sessions</h1>
          <p className="text-xs text-zinc-500">interviews, observations, tests, and other research activities</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-xs text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>new session</span>
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-sm text-zinc-500">loading sessions...</p>
        </div>
      ) : (
        <SessionList
          sessions={sessions}
          personas={personas}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Editor modal */}
      {showEditor && currentProjectId && (
        <SessionEditor
          session={editingSession}
          projectId={currentProjectId}
          onSave={handleSave}
          onClose={() => {
            setShowEditor(false);
            setEditingSession(null);
          }}
        />
      )}
    </div>
  );
};
