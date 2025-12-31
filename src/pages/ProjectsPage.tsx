import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from '../components/ProjectCard';
import { Plus } from 'lucide-react';
import { AddItemForm } from '../components/AddItemForm';

export const ProjectsPage: React.FC = () => {
  const { projects } = useStore();
  const navigate = useNavigate();
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => navigate(`/projects/${project.id}`)}
          />
        ))}
        
        {projects.length === 0 && (
          <div className="col-span-full bg-white rounded-xl shadow-lg py-16 px-8 text-center">
            <p className="text-gray-500 mb-4">Create your first project to get started!</p>
            <button
              onClick={() => setShowNewProjectForm(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </button>
          </div>
        )}
      </div>

      {showNewProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Create New Project</h2>
            </div>
            <AddItemForm
              level="project"
              onClose={() => setShowNewProjectForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};