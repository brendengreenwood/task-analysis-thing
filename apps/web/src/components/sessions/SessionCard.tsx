import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Edit, Trash, Calendar, User, Clock, Link as LinkIcon } from 'lucide-react';
import { ResearchSession } from '../../store/sessionStore';

interface SessionCardProps {
  session: ResearchSession;
  personaName?: string;
  onEdit: (session: ResearchSession) => void;
  onDelete: (id: string) => void;
}

const SESSION_TYPE_LABELS: Record<string, string> = {
  interview: 'Interview',
  observation: 'Observation',
  usability_test: 'Usability Test',
  survey: 'Survey',
  analytics: 'Analytics',
  diary: 'Diary Study',
};

const SESSION_TYPE_COLORS: Record<string, string> = {
  interview: 'emerald',
  observation: 'blue',
  usability_test: 'purple',
  survey: 'amber',
  analytics: 'cyan',
  diary: 'pink',
};

export const SessionCard: React.FC<SessionCardProps> = ({ session, personaName, onEdit, onDelete }) => {
  const { projectId } = useParams();
  const color = SESSION_TYPE_COLORS[session.type] || 'zinc';

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="bg-[#0a0a0a] border border-zinc-700 overflow-hidden hover:border-zinc-600 transition-colors group">
      <div className="flex">
        <div className={`w-1 bg-gradient-to-b from-${color}-500 to-${color}-700 flex-shrink-0`} />
        <div className="flex-grow">
          {/* Header */}
          <div className="p-3 border-b border-zinc-800">
            <div className="flex items-start justify-between gap-2">
              <Link
                to={`/projects/${projectId}/sessions/${session.id}`}
                className="flex-1 group-hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium bg-${color}-500/20 text-${color}-300 border border-${color}-500/30`}>
                    {SESSION_TYPE_LABELS[session.type]}
                  </span>
                  {session.duration && (
                    <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                      <Clock className="w-3 h-3" />
                      {formatDuration(session.duration)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Calendar className="w-3 h-3" />
                  {formatDate(session.date)}
                </div>
              </Link>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(session);
                  }}
                  className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(session.id);
                  }}
                  className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <Link
            to={`/projects/${projectId}/sessions/${session.id}`}
            className="block p-3 space-y-2 hover:bg-zinc-900/30 transition-colors"
          >
            {session.participantName && (
              <div className="flex items-start gap-2">
                <User className="w-3.5 h-3.5 text-zinc-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-zinc-400">{session.participantName}</div>
                  {personaName && (
                    <div className="text-xs text-zinc-600 mt-0.5">maps to: {personaName}</div>
                  )}
                </div>
              </div>
            )}

            {session.notes && (
              <div className="text-xs text-zinc-500 line-clamp-3 leading-relaxed">
                {session.notes}
              </div>
            )}

            {session.recordingUrl && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                <LinkIcon className="w-3 h-3" />
                recording
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};
