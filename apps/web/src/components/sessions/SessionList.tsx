import React from 'react';
import { SessionCard } from './SessionCard';
import { ResearchSession } from '../../store/sessionStore';
import { Persona } from '../../store/personaStore';

interface SessionListProps {
  sessions: ResearchSession[];
  personas: Persona[];
  onEdit: (session: ResearchSession) => void;
  onDelete: (id: string) => void;
}

export const SessionList: React.FC<SessionListProps> = ({ sessions, personas, onEdit, onDelete }) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-zinc-500">no sessions yet</p>
        <p className="text-xs text-zinc-600 mt-1">create your first research session to get started</p>
      </div>
    );
  }

  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedSessions.map((session) => {
        const persona = session.personaId
          ? personas.find((p) => p.id === session.personaId)
          : undefined;

        return (
          <SessionCard
            key={session.id}
            session={session}
            personaName={persona?.name}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
};
