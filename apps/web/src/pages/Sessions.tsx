import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Calendar } from 'lucide-react';
import { useSessionStore, ResearchSession } from '../store/sessionStore';
import { usePersonaStore } from '../store/personaStore';
import { useStore } from '../store/useStore';
import { SessionList } from '../components/sessions/SessionList';
import { SessionEditor } from '../components/sessions/SessionEditor';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const Sessions: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, setCurrentProject } = useStore();
  const { sessions, loading, fetchSessions, createSession, updateSession, deleteSession } = useSessionStore();
  const { personas, fetchPersonas } = usePersonaStore();

  const currentProject = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    } else {
      navigate('/');
    }
  }, [projectId, setCurrentProject, navigate]);

  const [showEditor, setShowEditor] = useState(false);
  const [editingSession, setEditingSession] = useState<ResearchSession | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchSessions(projectId);
      fetchPersonas(projectId);
    }
  }, [projectId, fetchSessions, fetchPersonas]);

  const handleCreate = () => {
    setEditingSession(null);
    setShowEditor(true);
  };

  const handleEdit = (session: ResearchSession) => {
    setEditingSession(session);
    setShowEditor(true);
  };

  const handleSave = async (data: Partial<Omit<ResearchSession, 'id' | 'projectId'>>) => {
    if (!projectId) return;

    try {
      if (editingSession) {
        await updateSession(editingSession.id, data);
      } else {
        await createSession(projectId, data as any);
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

  if (!projectId) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">select a project to view sessions</p>
      </div>
    );
  }

  return (
    <div>
      {currentProject && (
        <Breadcrumbs
          items={[
            { label: 'projects', href: '/' },
            { label: currentProject.name, href: `/projects/${currentProject.id}` },
            { label: 'sessions' },
          ]}
        />
      )}

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
      {showEditor && projectId && (
        <SessionEditor
          session={editingSession}
          projectId={projectId}
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
