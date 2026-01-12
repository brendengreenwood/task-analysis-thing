import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, User, Upload, FileText, MessageSquare, Quote, Lightbulb, Save } from 'lucide-react';

type ContentMode = 'notes' | 'transcript';
type InsightType = 'observation' | 'pattern' | 'quote' | 'pain_point';

interface SessionData {
  id: string;
  projectId: string;
  type: string;
  date: Date;
  participantName?: string;
  personaId?: string;
  duration?: number;
  notes?: string;
  transcript?: string;
  recordingUrl?: string;
  insights: any[];
}

export const SessionDetail: React.FC = () => {
  const { projectId, sessionId } = useParams();
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<ContentMode>('notes');
  const [notes, setNotes] = useState('');
  const [transcript, setTranscript] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [saving, setSaving] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!projectId || !sessionId) {
      navigate('/');
      return;
    }

    fetchSession();
  }, [projectId, sessionId, navigate]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch session');
      const data = await response.json();
      setSessionData(data);
      setNotes(data.notes || '');
      setTranscript(data.transcript || '');
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!sessionData) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          transcript,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      // Refresh session data
      await fetchSession();
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text) {
      setSelectedText(text);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setTranscript(text);
      setMode('transcript');
    };
    reader.readAsText(file);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      interview: 'emerald',
      observation: 'blue',
      usability_test: 'purple',
      survey: 'amber',
      analytics: 'cyan',
      diary: 'pink',
    };
    return colors[type] || 'zinc';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-zinc-500">loading session...</p>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-zinc-500">session not found</p>
      </div>
    );
  }

  const color = getTypeColor(sessionData.type);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Back navigation */}
      <Link
        to={`/projects/${projectId}/sessions`}
        className="inline-flex items-center space-x-1 text-sm text-zinc-500 hover:text-zinc-400 transition-colors mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>back to sessions</span>
      </Link>

      {/* Header */}
      <div className="bg-[#0a0a0a] border border-zinc-700 p-4 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-0.5 text-xs font-medium bg-${color}-500/20 text-${color}-300 border border-${color}-500/30`}>
                {sessionData.type.replace('_', ' ')}
              </span>
              {sessionData.duration && (
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <Clock className="w-3 h-3" />
                  {formatDuration(sessionData.duration)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(sessionData.date)}
              </div>
              {sessionData.participantName && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {sessionData.participantName}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-xs text-white transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'saving...' : 'save'}
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 grid grid-cols-[1fr_300px] gap-4 min-h-0">
        {/* Left: Notes/Transcript */}
        <div className="bg-[#0a0a0a] border border-zinc-700 flex flex-col">
          {/* Toggle header */}
          <div className="border-b border-zinc-700 flex items-center justify-between p-3">
            <div className="flex gap-2">
              <button
                onClick={() => setMode('notes')}
                className={`px-3 py-1 text-xs transition-colors ${
                  mode === 'notes'
                    ? 'bg-zinc-800 text-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-400'
                }`}
              >
                <FileText className="w-3 h-3 inline mr-1" />
                notes
              </button>
              <button
                onClick={() => setMode('transcript')}
                className={`px-3 py-1 text-xs transition-colors ${
                  mode === 'transcript'
                    ? 'bg-zinc-800 text-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-400'
                }`}
              >
                <MessageSquare className="w-3 h-3 inline mr-1" />
                transcript
              </button>
            </div>

            {mode === 'transcript' && (
              <label className="flex items-center gap-2 px-3 py-1 text-xs text-zinc-400 hover:text-zinc-300 cursor-pointer transition-colors">
                <Upload className="w-3 h-3" />
                upload
                <input
                  type="file"
                  accept=".txt,.vtt,.srt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Content area */}
          <div className="flex-1 p-4 overflow-hidden">
            <textarea
              ref={contentRef}
              value={mode === 'notes' ? notes : transcript}
              onChange={(e) => {
                if (mode === 'notes') setNotes(e.target.value);
                else setTranscript(e.target.value);
              }}
              onMouseUp={handleTextSelection}
              placeholder={
                mode === 'notes'
                  ? 'Take notes during or after the research session...'
                  : 'Paste or upload a transcript with timestamps...'
              }
              className="w-full h-full bg-transparent text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none resize-none font-mono leading-relaxed"
            />
          </div>

          {/* Action bar for selected text */}
          {selectedText && (
            <div className="border-t border-zinc-700 p-3 flex items-center gap-2">
              <span className="text-xs text-zinc-500">selected text:</span>
              <span className="text-xs text-zinc-400 truncate max-w-xs">
                "{selectedText.substring(0, 50)}..."
              </span>
              <div className="flex gap-2 ml-auto">
                <button className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition-colors">
                  <Quote className="w-3 h-3" />
                  quote
                </button>
                <button className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition-colors">
                  <Lightbulb className="w-3 h-3" />
                  insight
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Insights sidebar - PLACEHOLDER */}
        <div className="bg-[#0a0a0a] border border-zinc-700 p-4 overflow-y-auto">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">insights ({sessionData.insights.length})</h3>
          <p className="text-xs text-zinc-600">insights sidebar - TODO</p>
        </div>
      </div>
    </div>
  );
};
