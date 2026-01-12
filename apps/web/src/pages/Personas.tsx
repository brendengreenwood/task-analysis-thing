import React, { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import { usePersonaStore, Persona } from '../store/personaStore';
import { useStore } from '../store/useStore';
import { PersonaGrid } from '../components/personas/PersonaGrid';
import { PersonaEditor } from '../components/personas/PersonaEditor';

export const Personas: React.FC = () => {
  const currentProjectId = useStore((state) => state.currentProjectId);
  const { personas, loading, fetchPersonas, createPersona, updatePersona, deletePersona } = usePersonaStore();

  const [showEditor, setShowEditor] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);

  useEffect(() => {
    if (currentProjectId) {
      fetchPersonas(currentProjectId);
    }
  }, [currentProjectId, fetchPersonas]);

  const handleCreate = () => {
    setEditingPersona(null);
    setShowEditor(true);
  };

  const handleEdit = (persona: Persona) => {
    setEditingPersona(persona);
    setShowEditor(true);
  };

  const handleSave = async (data: Partial<Persona>) => {
    if (!currentProjectId) return;

    try {
      if (editingPersona) {
        await updatePersona(editingPersona.id, data);
      } else {
        await createPersona(currentProjectId, data as Omit<Persona, 'id' | 'projectId'>);
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

  if (!currentProjectId) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">select a project to view personas</p>
      </div>
    );
  }

  return (
    <div>
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
