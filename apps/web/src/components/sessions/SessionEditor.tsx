import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ResearchSession, SessionType } from '../../store/sessionStore';
import { usePersonaStore } from '../../store/personaStore';

interface SessionEditorProps {
  session?: ResearchSession | null;
  projectId: string;
  onSave: (data: Partial<Omit<ResearchSession, 'id' | 'projectId'>>) => void;
  onClose: () => void;
}

const SESSION_TYPES: { value: SessionType; label: string }[] = [
  { value: 'interview', label: 'Interview' },
  { value: 'observation', label: 'Observation' },
  { value: 'usability_test', label: 'Usability Test' },
  { value: 'survey', label: 'Survey' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'diary', label: 'Diary Study' },
];

export const SessionEditor: React.FC<SessionEditorProps> = ({ session, projectId, onSave, onClose }) => {
  const { personas, fetchPersonas } = usePersonaStore();

  const [type, setType] = useState<SessionType>(session?.type || 'interview');
  const [date, setDate] = useState(
    session?.date ? new Date(session.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [participantName, setParticipantName] = useState(session?.participantName || '');
  const [personaId, setPersonaId] = useState(session?.personaId || '');
  const [duration, setDuration] = useState(session?.duration?.toString() || '');
  const [notes, setNotes] = useState(session?.notes || '');
  const [recordingUrl, setRecordingUrl] = useState(session?.recordingUrl || '');

  useEffect(() => {
    if (projectId) {
      fetchPersonas(projectId);
    }
  }, [projectId, fetchPersonas]);

  useEffect(() => {
    if (session) {
      setType(session.type);
      setDate(new Date(session.date).toISOString().split('T')[0]);
      setParticipantName(session.participantName || '');
      setPersonaId(session.personaId || '');
      setDuration(session.duration?.toString() || '');
      setNotes(session.notes || '');
      setRecordingUrl(session.recordingUrl || '');
    }
  }, [session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      type,
      date: new Date(date),
      participantName: participantName.trim() || null,
      personaId: personaId || null,
      duration: duration ? parseInt(duration, 10) : null,
      notes: notes.trim() || null,
      recordingUrl: recordingUrl.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0a] border border-zinc-700 max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-zinc-700 px-5 py-2.5 flex items-center justify-between flex-shrink-0">
          <h2 className="text-sm font-medium text-zinc-300">
            {session ? 'edit session' : 'new session'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">
            {/* Type */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SessionType)}
                className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {SESSION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* Participant Name */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">participant name</label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., John Doe"
              />
            </div>

            {/* Persona Link */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">linked persona</label>
              <select
                value={personaId}
                onChange={(e) => setPersonaId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">None</option>
                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name} {persona.role && `(${persona.role})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">duration (minutes)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., 60"
                min="1"
              />
            </div>

            {/* Recording URL */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">recording URL</label>
              <input
                type="url"
                value={recordingUrl}
                onChange={(e) => setRecordingUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                placeholder="Research notes, observations, key findings..."
                rows={8}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-700 px-5 py-3 flex items-center justify-end gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              {session ? 'save changes' : 'create session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
