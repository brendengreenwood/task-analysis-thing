import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { usePersonaStore, Persona } from '../store/personaStore';
import { useStore } from '../store/useStore';
import { PersonaGrid } from '../components/personas/PersonaGrid';
import { PersonaEditor } from '../components/personas/PersonaEditor';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const Personas: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, setCurrentProject } = useStore();
  const { personas, loading, fetchPersonas, createPersona, updatePersona, deletePersona } = usePersonaStore();

  const currentProject = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    } else {
      navigate('/');
    }
  }, [projectId, setCurrentProject, navigate]);

  const [showEditor, setShowEditor] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchPersonas(projectId);
    }
  }, [projectId, fetchPersonas]);

  const handleCreate = () => {
    setEditingPersona(null);
    setShowEditor(true);
  };

  const handleEdit = (persona: Persona) => {
    setEditingPersona(persona);
    setShowEditor(true);
  };

  const handleSave = async (data: Partial<Persona>) => {
    if (!projectId) return;

    try {
      if (editingPersona) {
        await updatePersona(editingPersona.id, data);
      } else {
        await createPersona(projectId, data as Omit<Persona, 'id' | 'projectId'>);
      }
      setShowEditor(false);
      setEditingPersona(null);
    } catch (error) {
      console.error('Failed to save persona:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this persona?')) {
      try {
        await deletePersona(id);
      } catch (error) {
        console.error('Failed to delete persona:', error);
      }
    }
  };

  if (!projectId) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">select a project to view personas</p>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Projects', href: '/' },
          { label: currentProject?.name || 'Project', href: `/projects/${projectId}` },
          { label: 'Personas' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-zinc-200 mb-1">personas</h1>
          <p className="text-xs text-zinc-500">user archetypes representing your research participants</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-xs text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>new persona</span>
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-sm text-zinc-500">loading personas...</p>
        </div>
      ) : (
        <PersonaGrid
          personas={personas}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Editor modal */}
      {showEditor && (
        <PersonaEditor
          persona={editingPersona}
          onSave={handleSave}
          onClose={() => {
            setShowEditor(false);
            setEditingPersona(null);
          }}
        />
      )}
    </div>
  );
};
