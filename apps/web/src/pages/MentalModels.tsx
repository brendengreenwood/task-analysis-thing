import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Brain } from 'lucide-react';
import { useMentalModelStore } from '../store/mentalModelStore';
import { usePersonaStore } from '../store/personaStore';
import { useStore } from '../store/useStore';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const MentalModels: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, setCurrentProject } = useStore();
  const { mentalModels, loading, fetchMentalModels, deleteMentalModel, createMentalModel } = useMentalModelStore();
  const { personas, fetchPersonas } = usePersonaStore();

  const currentProject = projects.find((p) => p.id === projectId);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | undefined>();

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
      fetchMentalModels(projectId);
      fetchPersonas(projectId);
    } else {
      navigate('/');
    }
  }, [projectId, setCurrentProject, navigate, fetchMentalModels, fetchPersonas]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !newName.trim()) return;

    try {
      const newMentalModel = await createMentalModel(projectId, {
        name: newName,
        personaId: selectedPersonaId,
      });
      setNewName('');
      setSelectedPersonaId(undefined);
      setIsCreating(false);
      navigate(`/projects/${projectId}/mental-models/${newMentalModel.id}`);
    } catch (error) {
      console.error('Failed to create mental model:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this mental model?')) {
      try {
        await deleteMentalModel(id);
      } catch (error) {
        console.error('Failed to delete mental model:', error);
      }
    }
  };

  if (!projectId) {
    return (
      <div className="text-center py-12">
        <Brain className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">select a project to view mental models</p>
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
          { label: 'Mental Models' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-zinc-200 mb-1">mental models</h1>
          <p className="text-xs text-zinc-500">how users understand concepts, relationships, and beliefs</p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-xs text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>new mental model</span>
          </button>
        )}
      </div>

      {/* Create Form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="bg-[#0a0a0a] border border-zinc-700 p-4 mb-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., How Sales Reps Think About Customers"
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm px-3 py-2 focus:outline-none focus:border-purple-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">persona (optional)</label>
              <select
                value={selectedPersonaId || ''}
                onChange={(e) => setSelectedPersonaId(e.target.value || undefined)}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm px-3 py-2 focus:outline-none focus:border-purple-500"
              >
                <option value="">-- project-level mental model --</option>
                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-xs text-white transition-colors"
              >
                create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewName('');
                  setSelectedPersonaId(undefined);
                }}
                className="px-3 py-1.5 border border-zinc-700 text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-sm text-zinc-500">loading mental models...</p>
        </div>
      ) : mentalModels.length === 0 ? (
        <div className="text-center py-12 bg-[#0a0a0a] border border-zinc-700">
          <Brain className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500 mb-4">no mental models yet</p>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              create your first mental model
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mentalModels.map((model) => {
            const persona = personas.find((p) => p.id === model.personaId);
            return (
              <Link
                key={model.id}
                to={`/projects/${projectId}/mental-models/${model.id}`}
                className="bg-[#0a0a0a] border border-zinc-700 p-4 hover:border-purple-500 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-zinc-200 group-hover:text-purple-400 transition-colors mb-1">
                      {model.name}
                    </h3>
                    {persona && (
                      <p className="text-xs text-zinc-500">
                        <span className="text-zinc-600">persona:</span> {persona.name}
                      </p>
                    )}
                    {!persona && (
                      <p className="text-xs text-zinc-600">project-level</p>
                    )}
                  </div>
                  <Brain className="w-5 h-5 text-purple-400 flex-shrink-0 ml-2" />
                </div>
                {model.description && (
                  <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{model.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-zinc-600">
                  <span>{model.concepts?.length || 0} concepts</span>
                  <span>{model.beliefs?.length || 0} beliefs</span>
                  <span>{model.relationships?.length || 0} relationships</span>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(model.id);
                  }}
                  className="mt-3 text-xs text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  delete
                </button>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
