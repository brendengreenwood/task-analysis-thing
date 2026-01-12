import React from 'react';
import { PersonaCard } from './PersonaCard';
import { Persona } from '../../store/personaStore';

interface PersonaGridProps {
  personas: Persona[];
  onEdit: (persona: Persona) => void;
  onDelete: (id: string) => void;
}

export const PersonaGrid: React.FC<PersonaGridProps> = ({ personas, onEdit, onDelete }) => {
  if (personas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-zinc-500">no personas yet</p>
        <p className="text-xs text-zinc-600 mt-1">create your first persona to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {personas.map((persona) => (
        <PersonaCard
          key={persona.id}
          persona={persona}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
