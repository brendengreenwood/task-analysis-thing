import { create } from 'zustand';
import { api } from '../lib/api';

export interface Concept {
  id: string;
  mentalModelId: string;
  name: string;
  description: string | null;
  userLanguage: string | null;
  systemEquivalent: string | null;
  x: number;
  y: number;
}

export interface Belief {
  id: string;
  mentalModelId: string;
  content: string;
  reality: string | null;
  isMismatch: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical' | null;
  insightIds: string[];
}

export interface ConceptRelationship {
  id: string;
  mentalModelId: string;
  fromConceptId: string;
  toConceptId: string;
  relationshipType: string | null;
  label: string | null;
}

export interface MentalModel {
  id: string;
  projectId: string;
  personaId: string | null;
  name: string;
  description: string | null;
  createdAt: Date;
  concepts?: Concept[];
  beliefs?: Belief[];
  relationships?: ConceptRelationship[];
}

interface MentalModelStore {
  mentalModels: MentalModel[];
  currentMentalModel: MentalModel | null;
  loading: boolean;

  fetchMentalModels: (projectId: string) => Promise<void>;
  fetchMentalModel: (id: string) => Promise<void>;
  createMentalModel: (projectId: string, data: { name: string; description?: string; personaId?: string }) => Promise<MentalModel>;
  updateMentalModel: (id: string, data: { name?: string; description?: string; personaId?: string }) => Promise<void>;
  deleteMentalModel: (id: string) => Promise<void>;

  // Concepts
  createConcept: (mentalModelId: string, data: Omit<Concept, 'id' | 'mentalModelId'>) => Promise<Concept>;
  updateConcept: (id: string, data: Partial<Omit<Concept, 'id' | 'mentalModelId'>>) => Promise<void>;
  deleteConcept: (id: string) => Promise<void>;

  // Beliefs
  createBelief: (mentalModelId: string, data: Omit<Belief, 'id' | 'mentalModelId'>) => Promise<Belief>;
  updateBelief: (id: string, data: Partial<Omit<Belief, 'id' | 'mentalModelId'>>) => Promise<void>;
  deleteBelief: (id: string) => Promise<void>;

  // Relationships
  createRelationship: (mentalModelId: string, data: Omit<ConceptRelationship, 'id' | 'mentalModelId'>) => Promise<ConceptRelationship>;
  updateRelationship: (id: string, data: Partial<Omit<ConceptRelationship, 'id' | 'mentalModelId'>>) => Promise<void>;
  deleteRelationship: (id: string) => Promise<void>;
}

export const useMentalModelStore = create<MentalModelStore>((set, get) => ({
  mentalModels: [],
  currentMentalModel: null,
  loading: false,

  fetchMentalModels: async (projectId: string) => {
    set({ loading: true });
    try {
      const mentalModels = await api.getMentalModels(projectId);
      set({ mentalModels, loading: false });
    } catch (error) {
      console.error('Failed to fetch mental models:', error);
      set({ loading: false });
    }
  },

  fetchMentalModel: async (id: string) => {
    set({ loading: true });
    try {
      const mentalModel = await api.getMentalModel(id);
      set({ currentMentalModel: mentalModel, loading: false });
    } catch (error) {
      console.error('Failed to fetch mental model:', error);
      set({ loading: false });
    }
  },

  createMentalModel: async (projectId: string, data) => {
    try {
      const newMentalModel = await api.createMentalModel(projectId, data);
      set((state) => ({
        mentalModels: [...state.mentalModels, newMentalModel],
      }));
      return newMentalModel;
    } catch (error) {
      console.error('Failed to create mental model:', error);
      throw error;
    }
  },

  updateMentalModel: async (id: string, data) => {
    try {
      await api.updateMentalModel(id, data);
      set((state) => ({
        mentalModels: state.mentalModels.map(mm =>
          mm.id === id ? { ...mm, ...data } : mm
        ),
        currentMentalModel: state.currentMentalModel?.id === id
          ? { ...state.currentMentalModel, ...data }
          : state.currentMentalModel,
      }));
    } catch (error) {
      console.error('Failed to update mental model:', error);
      throw error;
    }
  },

  deleteMentalModel: async (id: string) => {
    try {
      await api.deleteMentalModel(id);
      set((state) => ({
        mentalModels: state.mentalModels.filter(mm => mm.id !== id),
        currentMentalModel: state.currentMentalModel?.id === id ? null : state.currentMentalModel,
      }));
    } catch (error) {
      console.error('Failed to delete mental model:', error);
      throw error;
    }
  },

  // Concepts
  createConcept: async (mentalModelId: string, data) => {
    try {
      const newConcept = await api.createConcept(mentalModelId, data);
      set((state) => ({
        currentMentalModel: state.currentMentalModel?.id === mentalModelId
          ? {
              ...state.currentMentalModel,
              concepts: [...(state.currentMentalModel.concepts || []), newConcept],
            }
          : state.currentMentalModel,
      }));
      return newConcept;
    } catch (error) {
      console.error('Failed to create concept:', error);
      throw error;
    }
  },

  updateConcept: async (id: string, data) => {
    try {
      await api.updateConcept(id, data);
      set((state) => ({
        currentMentalModel: state.currentMentalModel
          ? {
              ...state.currentMentalModel,
              concepts: state.currentMentalModel.concepts?.map(c =>
                c.id === id ? { ...c, ...data } : c
              ),
            }
          : null,
      }));
    } catch (error) {
      console.error('Failed to update concept:', error);
      throw error;
    }
  },

  deleteConcept: async (id: string) => {
    try {
      await api.deleteConcept(id);
      set((state) => ({
        currentMentalModel: state.currentMentalModel
          ? {
              ...state.currentMentalModel,
              concepts: state.currentMentalModel.concepts?.filter(c => c.id !== id),
            }
          : null,
      }));
    } catch (error) {
      console.error('Failed to delete concept:', error);
      throw error;
    }
  },

  // Beliefs
  createBelief: async (mentalModelId: string, data) => {
    try {
      const newBelief = await api.createBelief(mentalModelId, data);
      set((state) => ({
        currentMentalModel: state.currentMentalModel?.id === mentalModelId
          ? {
              ...state.currentMentalModel,
              beliefs: [...(state.currentMentalModel.beliefs || []), newBelief],
            }
          : state.currentMentalModel,
      }));
      return newBelief;
    } catch (error) {
      console.error('Failed to create belief:', error);
      throw error;
    }
  },

  updateBelief: async (id: string, data) => {
    try {
      await api.updateBelief(id, data);
      set((state) => ({
        currentMentalModel: state.currentMentalModel
          ? {
              ...state.currentMentalModel,
              beliefs: state.currentMentalModel.beliefs?.map(b =>
                b.id === id ? { ...b, ...data } : b
              ),
            }
          : null,
      }));
    } catch (error) {
      console.error('Failed to update belief:', error);
      throw error;
    }
  },

  deleteBelief: async (id: string) => {
    try {
      await api.deleteBelief(id);
      set((state) => ({
        currentMentalModel: state.currentMentalModel
          ? {
              ...state.currentMentalModel,
              beliefs: state.currentMentalModel.beliefs?.filter(b => b.id !== id),
            }
          : null,
      }));
    } catch (error) {
      console.error('Failed to delete belief:', error);
      throw error;
    }
  },

  // Relationships
  createRelationship: async (mentalModelId: string, data) => {
    try {
      const newRelationship = await api.createRelationship(mentalModelId, data);
      set((state) => ({
        currentMentalModel: state.currentMentalModel?.id === mentalModelId
          ? {
              ...state.currentMentalModel,
              relationships: [...(state.currentMentalModel.relationships || []), newRelationship],
            }
          : state.currentMentalModel,
      }));
      return newRelationship;
    } catch (error) {
      console.error('Failed to create relationship:', error);
      throw error;
    }
  },

  updateRelationship: async (id: string, data) => {
    try {
      await api.updateRelationship(id, data);
      set((state) => ({
        currentMentalModel: state.currentMentalModel
          ? {
              ...state.currentMentalModel,
              relationships: state.currentMentalModel.relationships?.map(r =>
                r.id === id ? { ...r, ...data } : r
              ),
            }
          : null,
      }));
    } catch (error) {
      console.error('Failed to update relationship:', error);
      throw error;
    }
  },

  deleteRelationship: async (id: string) => {
    try {
      await api.deleteRelationship(id);
      set((state) => ({
        currentMentalModel: state.currentMentalModel
          ? {
              ...state.currentMentalModel,
              relationships: state.currentMentalModel.relationships?.filter(r => r.id !== id),
            }
          : null,
      }));
    } catch (error) {
      console.error('Failed to delete relationship:', error);
      throw error;
    }
  },
}));
