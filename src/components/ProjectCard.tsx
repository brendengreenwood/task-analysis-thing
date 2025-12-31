import React from 'react';
import { Project } from '../types';
import { ChevronRight, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const { deleteProject } = useStore();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProject(project.id);
    }
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
      <button
        onClick={onClick}
        className="w-full p-6 text-left"
      >
        <div className="flex items-start">
          <div className="flex-1 space-y-2 pr-12">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2">
              {project.description}
            </p>
          </div>
          <div className="absolute right-6 top-6">
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>
        
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
          <div>
            {project.activities.length} {project.activities.length === 1 ? 'Activity' : 'Activities'}
          </div>
          <div>
            {project.activities.reduce((acc, activity) => acc + activity.tasks.length, 0)} Tasks
          </div>
        </div>
      </button>

      <button
        onClick={handleDelete}
        className="absolute bottom-4 right-4 p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
        title="Delete project"
      >
        <Trash2 className="w-5 h-5 text-red-500" />
      </button>
    </div>
  );
};