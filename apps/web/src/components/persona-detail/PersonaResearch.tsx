import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, FileText, Link as LinkIcon, Plus } from 'lucide-react';

interface PersonaResearchProps {
  persona: any;
}

export const PersonaResearch: React.FC<PersonaResearchProps> = ({ persona }) => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const sessions = persona.sessions || [];

  const handleCreateSession = async () => {
    setCreating(true);
    try {
      const response = await fetch(`/api/projects/${persona.projectId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'interview',
          date: new Date(),
          personaId: persona.id,
          participantName: persona.name,
        }),
      });

      if (!response.ok) throw new Error('Failed to create session');

      const newSession = await response.json();
      navigate(`/projects/${persona.projectId}/sessions/${newSession.id}`);
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setCreating(false);
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'interview':
        return 'text-blue-400';
      case 'observation':
        return 'text-green-400';
      case 'usability_test':
        return 'text-purple-400';
      case 'survey':
        return 'text-yellow-400';
      case 'analytics':
        return 'text-orange-400';
      case 'diary':
        return 'text-pink-400';
      default:
        return 'text-zinc-400';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'date unknown';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (sessions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={handleCreateSession}
            disabled={creating}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-xs text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            {creating ? 'creating...' : 'new session'}
          </button>
        </div>
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">no research sessions with this persona</p>
        </div>
      </div>
    );
  }

  // Count insights per session
  const sessionInsights = sessions.map((session: any) => {
    const insights = persona.insights?.filter((i: any) => i.sessionId === session.id) || [];
    return {
      ...session,
      insightCount: insights.length,
    };
  });

  // Sort sessions by date (most recent first)
  const sortedSessions = [...sessionInsights].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  return (
    <div className="space-y-4">
      {/* New Session Button */}
      <div className="flex justify-end">
        <button
          onClick={handleCreateSession}
          disabled={creating}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-xs text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          {creating ? 'creating...' : 'new session'}
        </button>
      </div>

      {sortedSessions.map((session: any) => (
        <div key={session.id} className="bg-[#0a0a0a] border border-zinc-700 p-4">
          {/* Session Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-medium ${getSessionTypeColor(session.type)}`}>
                  {session.type.replace('_', ' ')}
                </span>
                {session.insightCount > 0 && (
                  <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-0.5 border border-zinc-700">
                    {session.insightCount} {session.insightCount === 1 ? 'insight' : 'insights'}
                  </span>
                )}
              </div>
              {session.participantName && (
                <p className="text-xs text-zinc-500 mb-2">participant: {session.participantName}</p>
              )}
            </div>
          </div>

          {/* Session Meta */}
          <div className="flex items-center gap-4 text-xs text-zinc-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(session.date)}</span>
            </div>
            {session.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(session.duration)}</span>
              </div>
            )}
            {session.recordingUrl && (
              <div className="flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                <a
                  href={session.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  recording
                </a>
              </div>
            )}
          </div>

          {/* Notes */}
          {session.notes && (
            <div className="border-t border-zinc-700 pt-3">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-zinc-400 leading-relaxed">{session.notes}</p>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Summary */}
      <div className="bg-zinc-900 border border-zinc-700 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">total sessions</span>
            <span className="text-lg font-medium text-zinc-200">{sessions.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">total insights</span>
            <span className="text-lg font-medium text-zinc-200">
              {sessionInsights.reduce((sum: number, s: any) => sum + s.insightCount, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
