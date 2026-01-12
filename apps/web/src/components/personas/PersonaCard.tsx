import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { User, Trash, Edit, Target, Frown, Wrench, Quote } from 'lucide-react';
import { Persona } from '../../store/personaStore';

interface PersonaCardProps {
  persona: Persona;
  onEdit: (persona: Persona) => void;
  onDelete: (id: string) => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({ persona, onEdit, onDelete }) => {
  const { projectId } = useParams();

  return (
    <div className="bg-[#0a0a0a] border border-zinc-700 overflow-hidden hover:border-zinc-600 transition-colors group">
      {/* Header with colored stripe */}
      <div className="flex">
        <div className="w-1 bg-gradient-to-b from-blue-500 to-blue-700 flex-shrink-0" />
        <div className="flex-grow">
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-start justify-between">
              <Link
                to={`/projects/${projectId}/personas/${persona.id}`}
                className="flex items-start space-x-3 flex-1 group-hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-200">{persona.name}</h3>
                  {persona.role && (
                    <p className="text-xs text-zinc-500 mt-0.5">{persona.role}</p>
                  )}
                </div>
              </Link>
              <div className="flex space-x-1 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(persona);
                  }}
                  className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Edit persona"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(persona.id);
                  }}
                  className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Delete persona"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <Link
            to={`/projects/${projectId}/personas/${persona.id}`}
            className="block p-4 space-y-3 hover:bg-zinc-900/30 transition-colors"
          >
            {/* Description */}
            {persona.description && (
              <p className="text-xs text-zinc-400 leading-relaxed">{persona.description}</p>
            )}

            {/* Quote */}
            {persona.quote && (
              <div className="flex items-start space-x-2 bg-zinc-900/50 p-2 border-l-2 border-blue-500/30">
                <Quote className="w-3 h-3 text-blue-500/50 flex-shrink-0 mt-0.5" />
                <p className="text-xs italic text-zinc-400 leading-relaxed">"{persona.quote}"</p>
              </div>
            )}

            {/* Goals */}
            {persona.goals && persona.goals.length > 0 && (
              <div>
                <div className="flex items-center space-x-1.5 mb-1.5">
                  <Target className="w-3 h-3 text-green-500" />
                  <span className="text-xs font-medium text-zinc-400">goals</span>
                </div>
                <ul className="space-y-1 ml-4">
                  {persona.goals.map((goal, idx) => (
                    <li key={idx} className="text-xs text-zinc-500 flex items-start">
                      <span className="text-green-500 mr-1.5">•</span>
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Frustrations */}
            {persona.frustrations && persona.frustrations.length > 0 && (
              <div>
                <div className="flex items-center space-x-1.5 mb-1.5">
                  <Frown className="w-3 h-3 text-orange-500" />
                  <span className="text-xs font-medium text-zinc-400">frustrations</span>
                </div>
                <ul className="space-y-1 ml-4">
                  {persona.frustrations.map((frustration, idx) => (
                    <li key={idx} className="text-xs text-zinc-500 flex items-start">
                      <span className="text-orange-500 mr-1.5">•</span>
                      {frustration}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tools */}
            {persona.tools && persona.tools.length > 0 && (
              <div>
                <div className="flex items-center space-x-1.5 mb-1.5">
                  <Wrench className="w-3 h-3 text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-400">tools</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {persona.tools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-zinc-800 text-xs text-zinc-400 border border-zinc-700"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};
