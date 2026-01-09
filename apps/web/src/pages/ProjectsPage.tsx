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
    <div className="space-y-5">
      <h2 className="text-base font-medium text-zinc-300 border-b border-zinc-700 pb-2">projects</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => navigate(`/projects/${project.id}`)}
          />
        ))}

        {projects.length === 0 && (
          <div className="col-span-full bg-[#0a0a0a] border border-zinc-700 py-12 px-8 text-center">
            <p className="text-zinc-500 text-sm mb-6">no projects found</p>
            <button
              onClick={() => setShowNewProjectForm(true)}
              className="inline-flex items-center px-3 py-1.5 text-sm text-zinc-400 border border-zinc-700 hover:bg-zinc-900 hover:text-zinc-200 focus:outline-none transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              new project
            </button>
          </div>
        )}
      </div>

      {showNewProjectForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0a0a0a] border border-zinc-700 max-w-md w-full mx-4">
            <div className="border-b border-zinc-700 px-5 py-2.5">
              <h2 className="text-sm font-medium text-zinc-300">new project</h2>
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