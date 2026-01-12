import { create } from 'zustand';
import { api } from '../lib/api';

export type InsightType = 'observation' | 'pattern' | 'quote' | 'pain_point';
export type InsightSeverity = 'low' | 'medium' | 'high' | 'critical';
export type LinkedEntityType = 'activity' | 'task' | 'operation' | 'persona';

export interface Insight {
  id: string;
  projectId: string;
  sessionId: string | null;
  content: string;
  type: InsightType;
  severity: InsightSeverity | null;
  linkedEntityType: LinkedEntityType | null;
  linkedEntityId: string | null;
  createdAt: Date;
}

interface InsightStore {
  insights: Insight[];
  loading: boolean;

  fetchInsights: (projectId: string, filters?: { type?: string; sessionId?: string }) => Promise<void>;
  createInsight: (projectId: string, data: Omit<Insight, 'id' | 'projectId' | 'createdAt'>) => Promise<Insight>;
  updateInsight: (id: string, data: Partial<Omit<Insight, 'id' | 'projectId' | 'createdAt'>>) => Promise<void>;
  deleteInsight: (id: string) => Promise<void>;
  linkInsight: (id: string, entityType: LinkedEntityType, entityId: string) => Promise<void>;
}

export const useInsightStore = create<InsightStore>((set, get) => ({
  insights: [],
  loading: false,

  fetchInsights: async (projectId: string, filters?: { type?: string; sessionId?: string }) => {
    set({ loading: true });
    try {
      const insights = await api.getInsights(projectId, filters);
      // Transform dates
      const transformedInsights = insights.map((i: any) => ({
        ...i,
        createdAt: new Date(i.createdAt),
      }));
      set({ insights: transformedInsights, loading: false });
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      set({ loading: false });
    }
  },

  createInsight: async (projectId: string, data) => {
    try {
      const newInsight = await api.createInsight(projectId, data);
      const transformedInsight = {
        ...newInsight,
        createdAt: new Date(newInsight.createdAt),
      };
      set((state) => ({
        insights: [...state.insights, transformedInsight],
      }));
      return transformedInsight;
    } catch (error) {
      console.error('Failed to create insight:', error);
      throw error;
    }
  },

  updateInsight: async (id: string, data) => {
    try {
      await api.updateInsight(id, data);
      set((state) => ({
        insights: state.insights.map(i =>
          i.id === id ? { ...i, ...data } : i
        ),
      }));
    } catch (error) {
      console.error('Failed to update insight:', error);
      throw error;
    }
  },

  deleteInsight: async (id: string) => {
    try {
      await api.deleteInsight(id);
      set((state) => ({
        insights: state.insights.filter(i => i.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete insight:', error);
      throw error;
    }
  },

  linkInsight: async (id: string, entityType: LinkedEntityType, entityId: string) => {
    try {
      await api.updateInsight(id, {
        linkedEntityType: entityType,
        linkedEntityId: entityId,
      });
      set((state) => ({
        insights: state.insights.map(i =>
          i.id === id
            ? { ...i, linkedEntityType: entityType, linkedEntityId: entityId }
            : i
        ),
      }));
    } catch (error) {
      console.error('Failed to link insight:', error);
      throw error;
    }
  },
}));
