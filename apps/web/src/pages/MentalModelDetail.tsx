import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft } from 'lucide-react';
import { useMentalModelStore } from '../store/mentalModelStore';
import { usePersonaStore } from '../store/personaStore';
import { useStore } from '../store/useStore';
import { EditableText } from '../components/EditableText';
import { CanvasTab } from '../components/mental-models/CanvasTab';
import { BeliefsTab } from '../components/mental-models/BeliefsTab';
import { VocabularyTab } from '../components/mental-models/VocabularyTab';
import { Breadcrumbs } from '../components/Breadcrumbs';

type Tab = 'canvas' | 'beliefs' | 'vocabulary';

export const MentalModelDetail: React.FC = () => {
  const { projectId, modelId } = useParams();
  const navigate = useNavigate();
  const { projects, setCurrentProject } = useStore();
  const { currentMentalModel, fetchMentalModel, updateMentalModel } = useMentalModelStore();
  const { personas, fetchPersonas } = usePersonaStore();

  const [activeTab, setActiveTab] = useState<Tab>('canvas');

  const currentProject = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
      fetchPersonas(projectId);
    } else {
      navigate('/');
    }
  }, [projectId, setCurrentProject, navigate, fetchPersonas]);

  useEffect(() => {
    if (modelId) {
      fetchMentalModel(modelId);
    }
  }, [modelId, fetchMentalModel]);

  const handleUpdateName = async (name: string) => {
    if (currentMentalModel && name.trim()) {
      await updateMentalModel(currentMentalModel.id, { name });
    }
  };

  const handleUpdateDescription = async (description: string) => {
    if (currentMentalModel) {
      await updateMentalModel(currentMentalModel.id, { description });
    }
  };

  if (!currentMentalModel) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-zinc-500">loading mental model...</p>
      </div>
    );
  }

  const persona = personas.find((p) => p.id === currentMentalModel.personaId);

  // Build breadcrumbs dynamically based on whether mental model is linked to a persona
  const breadcrumbItems = currentMentalModel.personaId && persona
    ? [
        { label: 'Projects', href: '/' },
        { label: currentProject?.name || 'Project', href: `/projects/${projectId}` },
        { label: 'Personas', href: `/projects/${projectId}/personas` },
        { label: persona.name },
        { label: 'Mental Model' },
      ]
    : [
        { label: 'Projects', href: '/' },
        { label: currentProject?.name || 'Project', href: `/projects/${projectId}` },
        { label: 'Mental Models', href: `/projects/${projectId}/mental-models` },
        { label: currentMentalModel.name },
      ];

  // Determine back link destination
  const backLink = currentMentalModel.personaId && persona
    ? { href: `/projects/${projectId}/personas`, label: 'back to personas' }
    : { href: `/projects/${projectId}/mental-models`, label: 'back to mental models' };

  return (
    <div className="space-y-5">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header */}
      <div className="space-y-1.5 border-b border-zinc-700 pb-3">
        <button
          onClick={() => navigate(backLink.href)}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-400 transition-colors mb-2"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>{backLink.label}</span>
        </button>

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-5 h-5 text-purple-400" />
              <EditableText
                value={currentMentalModel.name}
                onSave={handleUpdateName}
                className="text-base font-medium text-zinc-200 hover:bg-zinc-900 px-2 py-1 -ml-2"
              />
            </div>
            {persona && (
              <p className="text-xs text-zinc-500 ml-7">
                <span className="text-zinc-600">persona:</span> {persona.name}
              </p>
            )}
            {!persona && (
              <p className="text-xs text-zinc-600 ml-7">project-level mental model</p>
            )}
            <EditableText
              value={currentMentalModel.description || ''}
              onSave={handleUpdateDescription}
              className="text-zinc-500 text-sm hover:bg-zinc-900 px-2 py-1 -ml-2 ml-7 block"
              placeholder="description"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-700">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-4 py-2 text-sm transition-colors ${
              activeTab === 'canvas'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-zinc-500 hover:text-zinc-400'
            }`}
          >
            canvas
          </button>
          <button
            onClick={() => setActiveTab('beliefs')}
            className={`px-4 py-2 text-sm transition-colors ${
              activeTab === 'beliefs'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-zinc-500 hover:text-zinc-400'
            }`}
          >
            beliefs
          </button>
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`px-4 py-2 text-sm transition-colors ${
              activeTab === 'vocabulary'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-zinc-500 hover:text-zinc-400'
            }`}
          >
            vocabulary
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'canvas' && <CanvasTab mentalModel={currentMentalModel} />}
        {activeTab === 'beliefs' && <BeliefsTab mentalModel={currentMentalModel} />}
        {activeTab === 'vocabulary' && <VocabularyTab mentalModel={currentMentalModel} />}
      </div>
    </div>
  );
};
