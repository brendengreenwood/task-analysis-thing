const API_URL = 'http://localhost:4111/api';

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Projects
  async getProjects() {
    return this.request<any[]>('/projects');
  }

  async getProject(id: string) {
    return this.request<any>(`/projects/${id}`);
  }

  async createProject(data: { name: string; description?: string; phase?: string }) {
    return this.request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: { name?: string; description?: string; phase?: string }) {
    return this.request<any>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string) {
    return this.request<any>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Activities
  async getActivities(projectId: string) {
    return this.request<any[]>(`/projects/${projectId}/activities`);
  }

  async getActivity(id: string) {
    return this.request<any>(`/activities/${id}`);
  }

  async createActivity(projectId: string, data: { name: string; overview?: string; frequency?: string; importance?: string; order?: number }) {
    return this.request<any>(`/projects/${projectId}/activities`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateActivity(id: string, data: { name?: string; overview?: string; frequency?: string; importance?: string; order?: number }) {
    return this.request<any>(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteActivity(id: string) {
    return this.request<any>(`/activities/${id}`, {
      method: 'DELETE',
    });
  }

  // Tasks
  async getTasks(activityId: string) {
    return this.request<any[]>(`/activities/${activityId}/tasks`);
  }

  async getTask(id: string) {
    return this.request<any>(`/tasks/${id}`);
  }

  async createTask(activityId: string, data: { name: string; goal?: string; order?: number }) {
    return this.request<any>(`/activities/${activityId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: { name?: string; goal?: string; order?: number }) {
    return this.request<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return this.request<any>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Operations
  async getOperations(taskId: string) {
    return this.request<any[]>(`/tasks/${taskId}/operations`);
  }

  async getOperation(id: string) {
    return this.request<any>(`/operations/${id}`);
  }

  async createOperation(taskId: string, data: { name: string; details?: string; toolsUsed?: string[]; order?: number }) {
    return this.request<any>(`/tasks/${taskId}/operations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOperation(id: string, data: { name?: string; details?: string; toolsUsed?: string[]; order?: number }) {
    return this.request<any>(`/operations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOperation(id: string) {
    return this.request<any>(`/operations/${id}`, {
      method: 'DELETE',
    });
  }

  // Personas
  async getPersonas(projectId: string) {
    return this.request<any[]>(`/projects/${projectId}/personas`);
  }

  async createPersona(projectId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/personas`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePersona(id: string, data: any) {
    return this.request<any>(`/personas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePersona(id: string) {
    return this.request<any>(`/personas/${id}`, {
      method: 'DELETE',
    });
  }

  async linkPersonaToActivity(personaId: string, activityId: string) {
    return this.request<any>(`/personas/${personaId}/activities`, {
      method: 'POST',
      body: JSON.stringify({ activityId }),
    });
  }

  async unlinkPersonaFromActivity(personaId: string, activityId: string) {
    return this.request<any>(`/personas/${personaId}/activities/${activityId}`, {
      method: 'DELETE',
    });
  }

  // Sessions
  async getSessions(projectId: string) {
    return this.request<any[]>(`/projects/${projectId}/sessions`);
  }

  async createSession(projectId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/sessions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSession(id: string, data: any) {
    return this.request<any>(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSession(id: string) {
    return this.request<any>(`/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  // Insights
  async getInsights(projectId: string, filters?: { type?: string; sessionId?: string }) {
    const params = new URLSearchParams(filters as any);
    return this.request<any[]>(`/projects/${projectId}/insights?${params}`);
  }

  async getUnlinkedInsights() {
    return this.request<any[]>('/insights/unlinked');
  }

  async createInsight(projectId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/insights`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInsight(id: string, data: any) {
    return this.request<any>(`/insights/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInsight(id: string) {
    return this.request<any>(`/insights/${id}`, {
      method: 'DELETE',
    });
  }

  // Export
  async exportProject(id: string) {
    return this.request<any>(`/projects/${id}/export`);
  }
}

export const api = new ApiClient();
