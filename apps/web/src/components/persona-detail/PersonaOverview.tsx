import React from 'react';
import { User, Calendar, TrendingUp, Zap } from 'lucide-react';

interface PersonaOverviewProps {
  persona: any;
}

export const PersonaOverview: React.FC<PersonaOverviewProps> = ({ persona }) => {
  const getExperienceLevelColor = (level: string | null) => {
    switch (level) {
      case 'expert':
        return 'text-blue-400';
      case 'advanced':
        return 'text-green-400';
      case 'intermediate':
        return 'text-yellow-400';
      case 'beginner':
        return 'text-orange-400';
      default:
        return 'text-zinc-500';
    }
  };

  const getFrequencyColor = (frequency: string | null) => {
    switch (frequency) {
      case 'daily':
        return 'text-blue-400';
      case 'weekly':
        return 'text-green-400';
      case 'monthly':
        return 'text-yellow-400';
      case 'occasionally':
        return 'text-orange-400';
      default:
        return 'text-zinc-500';
    }
  };

  const getInfluenceColor = (influence: string | null) => {
    switch (influence) {
      case 'high':
        return 'text-purple-400';
      case 'medium':
        return 'text-blue-400';
      case 'low':
        return 'text-zinc-400';
      default:
        return 'text-zinc-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* About */}
      {persona.description && (
        <div className="bg-[#0a0a0a] border border-zinc-700 p-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-2">about</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{persona.description}</p>
        </div>
      )}

      {/* Goals & Frustrations Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Goals */}
        <div className="bg-[#0a0a0a] border border-zinc-700 p-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            goals
          </h3>
          {persona.goals && persona.goals.length > 0 ? (
            <ul className="space-y-2">
              {persona.goals.map((goal: string, idx: number) => (
                <li key={idx} className="text-sm text-zinc-400 flex items-start gap-2">
                  <span className="text-green-400 mt-1">→</span>
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-600">no goals specified</p>
          )}
        </div>

        {/* Frustrations */}
        <div className="bg-[#0a0a0a] border border-zinc-700 p-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-400" />
            frustrations
          </h3>
          {persona.frustrations && persona.frustrations.length > 0 ? (
            <ul className="space-y-2">
              {persona.frustrations.map((frustration: string, idx: number) => (
                <li key={idx} className="text-sm text-zinc-400 flex items-start gap-2">
                  <span className="text-red-400 mt-1">×</span>
                  <span>{frustration}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-600">no frustrations specified</p>
          )}
        </div>
      </div>

      {/* Tools & Skills */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tools */}
        <div className="bg-[#0a0a0a] border border-zinc-700 p-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">tools used</h3>
          {persona.tools && persona.tools.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {persona.tools.map((tool: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-xs text-zinc-400"
                >
                  {tool}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-600">no tools specified</p>
          )}
        </div>

        {/* Skills */}
        <div className="bg-[#0a0a0a] border border-zinc-700 p-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">skills</h3>
          {persona.skills && persona.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {persona.skills.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-xs text-zinc-400"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-600">no skills specified</p>
          )}
        </div>
      </div>

      {/* Context */}
      <div className="bg-[#0a0a0a] border border-zinc-700 p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">context</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-zinc-500 mb-1">experience level</p>
            <p className={`text-sm font-medium ${getExperienceLevelColor(persona.experienceLevel)}`}>
              {persona.experienceLevel || 'not specified'}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">usage frequency</p>
            <p className={`text-sm font-medium ${getFrequencyColor(persona.usageFrequency)}`}>
              {persona.usageFrequency || 'not specified'}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">influence</p>
            <p className={`text-sm font-medium ${getInfluenceColor(persona.influence)}`}>
              {persona.influence || 'not specified'}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">environment</p>
            <p className="text-sm font-medium text-zinc-400">{persona.environment || 'not specified'}</p>
          </div>
        </div>
      </div>

      {/* Research Stats */}
      <div className="bg-[#0a0a0a] border border-zinc-700 p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">research data</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">sessions</p>
              <p className="text-lg font-medium text-zinc-200">{persona.sessions?.length || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">insights</p>
              <p className="text-lg font-medium text-zinc-200">{persona.insights?.length || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center">
              <User className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">workflows</p>
              <p className="text-lg font-medium text-zinc-200">{persona.activities?.length || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">pain points</p>
              <p className="text-lg font-medium text-zinc-200">{persona.painSummary?.total || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pain Summary */}
      {persona.painSummary && persona.painSummary.total > 0 && (
        <div className="bg-[#0a0a0a] border border-zinc-700 p-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">pain breakdown</h3>
          <div className="space-y-2">
            {persona.painSummary.critical > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">critical</span>
                <span className="text-red-400 font-medium">{persona.painSummary.critical}</span>
              </div>
            )}
            {persona.painSummary.high > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">high</span>
                <span className="text-orange-400 font-medium">{persona.painSummary.high}</span>
              </div>
            )}
            {persona.painSummary.medium > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">medium</span>
                <span className="text-yellow-400 font-medium">{persona.painSummary.medium}</span>
              </div>
            )}
            {persona.painSummary.low > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">low</span>
                <span className="text-blue-400 font-medium">{persona.painSummary.low}</span>
              </div>
            )}
            <div className="pt-2 mt-2 border-t border-zinc-700 flex items-center justify-between">
              <span className="text-sm text-zinc-300">friction score</span>
              <span className="text-lg font-medium text-zinc-200">{persona.painSummary.frictionScore}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
