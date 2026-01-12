import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, User } from 'lucide-react';
import { PersonaOverview } from '../components/persona-detail/PersonaOverview';
import { PersonaWorkflows } from '../components/persona-detail/PersonaWorkflows';
import { PersonaResearch } from '../components/persona-detail/PersonaResearch';
import { PersonaInsights } from '../components/persona-detail/PersonaInsights';

type TabKey = 'overview' | 'workflows' | 'research' | 'insights' | 'mental-model';

export const PersonaDetail: React.FC = () => {
  const { projectId, personaId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [personaData, setPersonaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId || !personaId) {
      navigate('/');
      return;
    }

    // Fetch full persona data
    const fetchPersona = async () => {
      try {
        const response = await fetch(`/api/personas/${personaId}/full`);
        if (!response.ok) throw new Error('Failed to fetch persona');
        const data = await response.json();
        setPersonaData(data);
      } catch (error) {
        console.error('Error fetching persona:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersona();
  }, [projectId, personaId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-zinc-500">loading persona...</p>
      </div>
    );
  }

  if (!personaData) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-zinc-500">persona not found</p>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'overview' },
    { key: 'workflows', label: 'workflows' },
    { key: 'research', label: 'research' },
    { key: 'insights', label: 'insights' },
    { key: 'mental-model', label: 'mental model' },
  ];

  return (
    <div className="space-y-5">
      {/* Back navigation */}
      <Link
        to={`/projects/${projectId}/personas`}
        className="inline-flex items-center space-x-1 text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>back to personas</span>
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 border-b border-zinc-700 pb-4">
        {/* Avatar */}
        <div className="w-16 h-16 bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
          {personaData.avatarUrl ? (
            <img src={personaData.avatarUrl} alt={personaData.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-zinc-600" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-lg font-medium text-zinc-200 mb-1">{personaData.name}</h1>
          {personaData.role && <p className="text-sm text-zinc-400 mb-2">{personaData.role}</p>}
          {personaData.quote && (
            <p className="text-xs text-zinc-500 italic border-l-2 border-zinc-700 pl-3">"{personaData.quote}"</p>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-zinc-700">
        <div className="flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 text-sm transition-colors relative ${
                activeTab === tab.key
                  ? 'text-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-400'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {activeTab === 'overview' && <PersonaOverview persona={personaData} />}
        {activeTab === 'workflows' && <PersonaWorkflows persona={personaData} />}
        {activeTab === 'research' && <PersonaResearch persona={personaData} />}
        {activeTab === 'insights' && <PersonaInsights persona={personaData} />}
        {activeTab === 'mental-model' && (
          <div className="text-center py-12">
            <p className="text-sm text-zinc-500">mental model visualization coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};
