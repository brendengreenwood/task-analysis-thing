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
    <div className="group relative bg-[#0a0a0a] border border-zinc-700 hover:border-zinc-600 transition-colors duration-200">
      <button
        onClick={onClick}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start">
          <div className="flex-1 space-y-1.5 pr-10">
            <h3 className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-zinc-500 line-clamp-2">
              {project.description}
            </p>
          </div>
          <div className="absolute right-4 top-4">
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-500 transition-colors" />
          </div>
        </div>

        <div className="mt-3 flex items-center space-x-3 text-xs text-zinc-600">
          <div>
            {project.activities.length} {project.activities.length === 1 ? 'activity' : 'activities'}
          </div>
          <div>·</div>
          <div>
            {project.activities.reduce((acc, activity) => acc + activity.tasks.length, 0)} tasks
          </div>
        </div>
      </button>

      <button
        onClick={handleDelete}
        className="absolute bottom-2 right-2 p-1 text-zinc-600 hover:text-red-500 transition-colors"
        title="Delete project"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};