import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Plus, ExternalLink } from 'lucide-react';
import { useMentalModelStore } from '../../store/mentalModelStore';

interface PersonaMentalModelProps {
  persona: any;
}

export const PersonaMentalModel: React.FC<PersonaMentalModelProps> = ({ persona }) => {
  const { mentalModels, fetchMentalModels, createMentalModel } = useMentalModelStore();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (persona.projectId) {
      fetchMentalModels(persona.projectId);
    }
  }, [persona.projectId, fetchMentalModels]);

  // Find mental model linked to this persona
  const personaMentalModel = mentalModels.find(m => m.personaId === persona.id);

  const handleCreateMentalModel = async () => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      await createMentalModel(persona.projectId, {
        name: `${persona.name}'s Mental Model`,
        description: `Mental model for ${persona.name}`,
        personaId: persona.id,
      });
    } catch (error) {
      console.error('Failed to create mental model:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!personaMentalModel) {
    return (
      <div className="bg-[#0a0a0a] border border-zinc-700 p-12 text-center">
        <Brain className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
        <h3 className="text-base font-medium text-zinc-300 mb-2">no mental model yet</h3>
        <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
          Mental models capture how {persona.name} thinks about your product — their vocabulary,
          beliefs, and conceptual understanding.
        </p>
        <button
          onClick={handleCreateMentalModel}
          disabled={isCreating}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'creating...' : 'create mental model'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mental Model Card */}
      <div className="bg-[#0a0a0a] border border-zinc-700 p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-medium text-zinc-200">{personaMentalModel.name}</h3>
              {personaMentalModel.description && (
                <p className="text-sm text-zinc-500 mt-1">{personaMentalModel.description}</p>
              )}
            </div>
          </div>
          <Link
            to={`/projects/${persona.projectId}/mental-models/${personaMentalModel.id}`}
            className="flex items-center gap-2 px-3 py-1.5 text-xs border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-200 transition-colors"
          >
            <span>open full view</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
          <div>
            <div className="text-xl font-medium text-zinc-200">
              {personaMentalModel.concepts?.length || 0}
            </div>
            <div className="text-xs text-zinc-500">concepts</div>
          </div>
          <div>
            <div className="text-xl font-medium text-zinc-200">
              {personaMentalModel.beliefs?.length || 0}
            </div>
            <div className="text-xs text-zinc-500">beliefs</div>
          </div>
          <div>
            <div className="text-xl font-medium text-zinc-200">
              {personaMentalModel.relationships?.length || 0}
            </div>
            <div className="text-xs text-zinc-500">relationships</div>
          </div>
        </div>
      </div>

      {/* Quick Preview: Vocabulary */}
      {personaMentalModel.concepts && personaMentalModel.concepts.some((c: any) => c.userLanguage && c.systemEquivalent) && (
        <div className="bg-[#0a0a0a] border border-zinc-700 p-5">
          <h4 className="text-sm font-medium text-zinc-300 mb-3">vocabulary highlights</h4>
          <div className="space-y-2">
            {personaMentalModel.concepts
              .filter((c: any) => c.userLanguage && c.systemEquivalent)
              .slice(0, 5)
              .map((concept: any) => (
                <div key={concept.id} className="flex items-center gap-3 text-sm">
                  <span className="text-purple-400">{concept.userLanguage}</span>
                  <span className="text-zinc-600">→</span>
                  <span className="text-emerald-400">{concept.systemEquivalent}</span>
                </div>
              ))}
          </div>
          {personaMentalModel.concepts.filter((c: any) => c.userLanguage && c.systemEquivalent).length > 5 && (
            <p className="text-xs text-zinc-600 mt-3">
              +{personaMentalModel.concepts.filter((c: any) => c.userLanguage && c.systemEquivalent).length - 5} more mappings
            </p>
          )}
        </div>
      )}

      {/* Quick Preview: Belief Mismatches */}
      {personaMentalModel.beliefs && personaMentalModel.beliefs.some((b: any) => b.isMismatch) && (
        <div className="bg-[#0a0a0a] border border-zinc-700 p-5">
          <h4 className="text-sm font-medium text-zinc-300 mb-3">belief mismatches</h4>
          <div className="space-y-3">
            {personaMentalModel.beliefs
              .filter((b: any) => b.isMismatch)
              .slice(0, 3)
              .map((belief: any) => (
                <div key={belief.id} className="border-l-2 border-red-500 pl-3">
                  <p className="text-sm text-zinc-300 mb-1">{belief.content}</p>
                  {belief.reality && (
                    <p className="text-xs text-zinc-500">reality: {belief.reality}</p>
                  )}
                  {belief.severity && (
                    <span className={`inline-block text-xs px-2 py-0.5 mt-1 ${
                      belief.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      belief.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      belief.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {belief.severity}
                    </span>
                  )}
                </div>
              ))}
          </div>
          {personaMentalModel.beliefs.filter((b: any) => b.isMismatch).length > 3 && (
            <p className="text-xs text-zinc-600 mt-3">
              +{personaMentalModel.beliefs.filter((b: any) => b.isMismatch).length - 3} more mismatches
            </p>
          )}
        </div>
      )}
    </div>
  );
};
