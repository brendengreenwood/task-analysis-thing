import { create } from 'zustand';
import { api } from '../lib/api';

export interface Persona {
  id: string;
  projectId: string;
  name: string;
  role: string | null;
  description: string | null;
  goals: string[];
  frustrations: string[];
  tools: string[];
  quote: string | null;
}

interface PersonaStore {
  personas: Persona[];
  loading: boolean;

  fetchPersonas: (projectId: string) => Promise<void>;
  createPersona: (projectId: string, data: Omit<Persona, 'id' | 'projectId'>) => Promise<Persona>;
  updatePersona: (id: string, data: Partial<Omit<Persona, 'id' | 'projectId'>>) => Promise<void>;
  deletePersona: (id: string) => Promise<void>;
  linkToActivity: (personaId: string, activityId: string) => Promise<void>;
  unlinkFromActivity: (personaId: string, activityId: string) => Promise<void>;
}

export const usePersonaStore = create<PersonaStore>((set, get) => ({
  personas: [],
  loading: false,

  fetchPersonas: async (projectId: string) => {
    set({ loading: true });
    try {
      const personas = await api.getPersonas(projectId);
      set({ personas, loading: false });
    } catch (error) {
      console.error('Failed to fetch personas:', error);
      set({ loading: false });
    }
  },

  createPersona: async (projectId: string, data) => {
    try {
      const newPersona = await api.createPersona(projectId, data);
      set((state) => ({
        personas: [...state.personas, newPersona],
      }));
      return newPersona;
    } catch (error) {
      console.error('Failed to create persona:', error);
      throw error;
    }
  },

  updatePersona: async (id: string, data) => {
    try {
      await api.updatePersona(id, data);
      set((state) => ({
        personas: state.personas.map(p =>
          p.id === id ? { ...p, ...data } : p
        ),
      }));
    } catch (error) {
      console.error('Failed to update persona:', error);
      throw error;
    }
  },

  deletePersona: async (id: string) => {
    try {
      await api.deletePersona(id);
      set((state) => ({
        personas: state.personas.filter(p => p.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete persona:', error);
      throw error;
    }
  },

  linkToActivity: async (personaId: string, activityId: string) => {
    try {
      await api.linkPersonaToActivity(personaId, activityId);
      // No local state change needed - this is tracked in the activities
    } catch (error) {
      console.error('Failed to link persona to activity:', error);
      throw error;
    }
  },

  unlinkFromActivity: async (personaId: string, activityId: string) => {
    try {
      await api.unlinkPersonaFromActivity(personaId, activityId);
      // No local state change needed - this is tracked in the activities
    } catch (error) {
      console.error('Failed to unlink persona from activity:', error);
      throw error;
    }
  },
}));
