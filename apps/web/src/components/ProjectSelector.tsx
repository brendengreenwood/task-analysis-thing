import React, { useState } from 'react';
import { Plus, Trash, Edit2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { EditableText } from './EditableText';

interface ProjectFormProps {
  onSubmit: (name: string, description: string) => void;
  onCancel: () => void;
  initialName?: string;
  initialDescription?: string;
  submitLabel: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  onSubmit,
  onCancel,
  initialName = '',
  initialDescription = '',
  submitLabel
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim(), description.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Project Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Enter project name"
          autoFocus
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none"
          placeholder="Enter project description"
        />
      </div>
      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export const ProjectSelector: React.FC = () => {
  const { projects, currentProjectId, addProject, setCurrentProject, editProject, deleteProject } = useStore();
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);

  const handleAddProject = (name: string, description: string) => {
    addProject(name, description);
    setShowNewProjectForm(false);
  };

  const handleEditProject = (id: string, name: string, description: string) => {
    editProject(id, name, description);
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProject(id);
    }
  };

  if (showNewProjectForm) {
    return (
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b px-4 py-3">
          <h2 className="text-lg font-medium text-gray-900">Create New Project</h2>
        </div>
        <ProjectForm
          onSubmit={handleAddProject}
          onCancel={() => setShowNewProjectForm(false)}
          submitLabel="Create Project"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Projects</h2>
        <button
          onClick={() => setShowNewProjectForm(true)}
          className="flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Project
        </button>
      </div>
      <div className="divide-y">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`p-4 ${
              project.id === currentProjectId ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            {editingProject === project.id ? (
              <ProjectForm
                onSubmit={(name, description) => handleEditProject(project.id, name, description)}
                onCancel={() => setEditingProject(null)}
                initialName={project.name}
                initialDescription={project.description}
                submitLabel="Save Changes"
              />
            ) : (
              <div className="flex items-start justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => setCurrentProject(project.id)}
                >
                  <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{project.description}</p>
                </div>
                <div className="ml-4 flex items-center space-x-2">
                  <button
                    onClick={() => setEditingProject(project.id)}
                    className="p-1 text-gray-400 hover:text-gray-500"
                    title="Edit project"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="Delete project"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {projects.length === 0 && !showNewProjectForm && (
          <div className="p-8 text-center text-gray-500">
            <p>No projects yet. Create your first project to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};