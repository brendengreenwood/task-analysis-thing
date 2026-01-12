import { create } from 'zustand';
import { api } from '../lib/api';

export type SessionType = 'interview' | 'observation' | 'usability_test' | 'survey' | 'analytics' | 'diary';

export interface ResearchSession {
  id: string;
  projectId: string;
  type: SessionType;
  date: Date;
  participantName: string | null;
  personaId: string | null;
  duration: number | null;
  notes: string | null;
  recordingUrl: string | null;
}

interface SessionStore {
  sessions: ResearchSession[];
  loading: boolean;

  fetchSessions: (projectId: string) => Promise<void>;
  createSession: (projectId: string, data: Omit<ResearchSession, 'id' | 'projectId'>) => Promise<ResearchSession>;
  updateSession: (id: string, data: Partial<Omit<ResearchSession, 'id' | 'projectId'>>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],
  loading: false,

  fetchSessions: async (projectId: string) => {
    set({ loading: true });
    try {
      const sessions = await api.getSessions(projectId);
      // Transform dates
      const transformedSessions = sessions.map((s: any) => ({
        ...s,
        date: new Date(s.date),
      }));
      set({ sessions: transformedSessions, loading: false });
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      set({ loading: false });
    }
  },

  createSession: async (projectId: string, data) => {
    try {
      const newSession = await api.createSession(projectId, data);
      const transformedSession = {
        ...newSession,
        date: new Date(newSession.date),
      };
      set((state) => ({
        sessions: [...state.sessions, transformedSession],
      }));
      return transformedSession;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  },

  updateSession: async (id: string, data) => {
    try {
      await api.updateSession(id, data);
      set((state) => ({
        sessions: state.sessions.map(s =>
          s.id === id ? { ...s, ...data } : s
        ),
      }));
    } catch (error) {
      console.error('Failed to update session:', error);
      throw error;
    }
  },

  deleteSession: async (id: string) => {
    try {
      await api.deleteSession(id);
      set((state) => ({
        sessions: state.sessions.filter(s => s.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  },
}));
