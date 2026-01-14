import React from 'react';
import { MentalModel } from '../../store/mentalModelStore';
import { ArrowRight } from 'lucide-react';

interface VocabularyTabProps {
  mentalModel: MentalModel;
}

export const VocabularyTab: React.FC<VocabularyTabProps> = ({ mentalModel }) => {
  const concepts = mentalModel.concepts || [];
  const vocabularyMappings = concepts.filter(c => c.userLanguage && c.systemEquivalent);

  if (vocabularyMappings.length === 0) {
    return (
      <div className="bg-[#0a0a0a] border border-zinc-700 p-8 text-center">
        <p className="text-sm text-zinc-500 mb-2">no vocabulary mappings yet</p>
        <p className="text-xs text-zinc-600">
          add concepts with both "user language" and "system equivalent" in the canvas tab
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="bg-blue-950/30 border border-blue-900/50 p-3">
        <p className="text-xs text-blue-400">
          <span className="font-medium">for AI agents:</span> when users say "{vocabularyMappings[0]?.userLanguage}",
          they mean "{vocabularyMappings[0]?.systemEquivalent}" in your system.
        </p>
      </div>

      {/* Vocabulary Table */}
      <div className="bg-[#0a0a0a] border border-zinc-700">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="text-left text-xs font-medium text-zinc-400 px-4 py-3">
                user says
              </th>
              <th className="w-12"></th>
              <th className="text-left text-xs font-medium text-zinc-400 px-4 py-3">
                system has
              </th>
              <th className="text-left text-xs font-medium text-zinc-400 px-4 py-3">
                concept
              </th>
            </tr>
          </thead>
          <tbody>
            {vocabularyMappings.map((concept) => (
              <tr key={concept.id} className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="text-sm text-purple-400 font-mono">
                    "{concept.userLanguage}"
                  </div>
                </td>
                <td className="text-center">
                  <ArrowRight className="w-4 h-4 text-zinc-600 mx-auto" />
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-emerald-400 font-mono">
                    "{concept.systemEquivalent}"
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-zinc-400">{concept.name}</div>
                  {concept.description && (
                    <div className="text-xs text-zinc-600 mt-1">{concept.description}</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Agent Context Hint */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-4">
        <h3 className="text-xs font-medium text-zinc-400 mb-2">agent context hint</h3>
        <div className="text-xs text-zinc-500 font-mono bg-[#0a0a0a] p-3 border border-zinc-800">
          <p className="mb-2">Vocabulary mappings for this mental model:</p>
          <ul className="space-y-1 pl-4">
            {vocabularyMappings.map((concept) => (
              <li key={concept.id}>
                • User: "{concept.userLanguage}" → System: "{concept.systemEquivalent}" ({concept.name})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
