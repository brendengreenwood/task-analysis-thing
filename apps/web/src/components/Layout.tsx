import React, { useState } from 'react';
import { LayoutGrid, HelpCircle, Plus, ChevronLeft, ChevronRight, Users, Calendar, Lightbulb, Workflow, Home } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { HelpModal } from './HelpModal';
import { AddItemForm } from './AddItemForm';
import { ChatSidebar } from './ChatSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isHelpModalOpen, setIsHelpModalOpen] = React.useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();
  const { projectId } = useParams();

  // Check if we're inside a project
  const isInProject = location.pathname.startsWith('/projects/') && projectId;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div
        className={`bg-[#0a0a0a] border-r border-zinc-700 transition-all duration-300 ease-in-out relative flex flex-col ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="h-14 flex items-center px-4 border-b border-zinc-700">
          <h1 className={`text-base font-medium text-zinc-300 transition-opacity duration-200 ${
            isSidebarCollapsed ? 'opacity-0' : 'opacity-100'
          }`}>
            task-analyzer v1.0
          </h1>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          {!isInProject ? (
            // Global navigation (not in a project)
            <>
              <button
                onClick={() => setShowNewProjectForm(true)}
                className={`w-full flex items-center px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}
                title="New Project"
              >
                <Plus className="w-4 h-4 flex-shrink-0" />
                <span className={`ml-2 transition-opacity duration-200 ${
                  isSidebarCollapsed ? 'hidden' : 'block'
                }`}>
                  new project
                </span>
              </button>

              <Link
                to="/"
                className={`flex items-center px-3 py-1.5 text-sm hover:bg-zinc-900 transition-colors ${
                  location.pathname === '/' ? 'text-zinc-200 bg-zinc-900' : 'text-zinc-500'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title="Projects"
              >
                <LayoutGrid className="w-4 h-4 flex-shrink-0" />
                <span className={`ml-2 transition-opacity duration-200 ${
                  isSidebarCollapsed ? 'hidden' : 'block'
                }`}>
                  projects
                </span>
              </Link>

              <button
                onClick={() => setIsHelpModalOpen(true)}
                className={`w-full flex items-center px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-900 hover:text-zinc-400 transition-colors ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}
                title="About Analysis"
              >
                <HelpCircle className="w-4 h-4 flex-shrink-0" />
                <span className={`ml-2 transition-opacity duration-200 ${
                  isSidebarCollapsed ? 'hidden' : 'block'
                }`}>
                  about
                </span>
              </button>
            </>
          ) : (
            // Project-scoped navigation
            <>
              <Link
                to="/"
                className={`flex items-center px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-900 hover:text-zinc-400 transition-colors ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}
                title="Back to Projects"
              >
                <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                <span className={`ml-2 transition-opacity duration-200 ${
                  isSidebarCollapsed ? 'hidden' : 'block'
                }`}>
                  all projects
                </span>
              </Link>

              <Link
                to={`/projects/${projectId}`}
                className={`flex items-center px-3 py-1.5 text-sm hover:bg-zinc-900 transition-colors ${
                  location.pathname === `/projects/${projectId}` ? 'text-zinc-200 bg-zinc-900' : 'text-zinc-500'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title="Dashboard"
              >
                <Home className="w-4 h-4 flex-shrink-0" />
                <span className={`ml-2 transition-opacity duration-200 ${
                  isSidebarCollapsed ? 'hidden' : 'block'
                }`}>
                  dashboard
                </span>
              </Link>

              <Link
                to={`/projects/${projectId}/task-analysis`}
                className={`flex items-center px-3 py-1.5 text-sm hover:bg-zinc-900 transition-colors ${
                  location.pathname === `/projects/${projectId}/task-analysis` ? 'text-zinc-200 bg-zinc-900' : 'text-zinc-500'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title="Task Analysis"
              >
                <Workflow className="w-4 h-4 flex-shrink-0" />
                <span className={`ml-2 transition-opacity duration-200 ${
                  isSidebarCollapsed ? 'hidden' : 'block'
                }`}>
                  task analysis
                </span>
              </Link>

              <Link
                to={`/projects/${projectId}/personas`}
                className={`flex items-center px-3 py-1.5 text-sm hover:bg-zinc-900 transition-colors ${
                  location.pathname === `/projects/${projectId}/personas` ? 'text-zinc-200 bg-zinc-900' : 'text-zinc-500'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title="Personas"
              >
                <Users className="w-4 h-4 flex-shrink-0" />
                <span className={`ml-2 transition-opacity duration-200 ${
                  isSidebarCollapsed ? 'hidden' : 'block'
                }`}>
                  personas
                </span>
              </Link>

              <Link
                to={`/projects/${projectId}/sessions`}
                className={`flex items-center px-3 py-1.5 text-sm hover:bg-zinc-900 transition-colors ${
                  location.pathname === `/projects/${projectId}/sessions` ? 'text-zinc-200 bg-zinc-900' : 'text-zinc-500'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title="Sessions"
              >
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className={`ml-2 transition-opacity duration-200 ${
                  isSidebarCollapsed ? 'hidden' : 'block'
                }`}>
                  sessions
                </span>
              </Link>

              <Link
                to={`/projects/${projectId}/insights`}
                className={`flex items-center px-3 py-1.5 text-sm hover:bg-zinc-900 transition-colors ${
                  location.pathname === `/projects/${projectId}/insights` ? 'text-zinc-200 bg-zinc-900' : 'text-zinc-500'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title="Insights"
              >
                <Lightbulb className="w-4 h-4 flex-shrink-0" />
                <span className={`ml-2 transition-opacity duration-200 ${
                  isSidebarCollapsed ? 'hidden' : 'block'
                }`}>
                  insights
                </span>
              </Link>

              <button
                onClick={() => setIsHelpModalOpen(true)}
                className={`w-full flex items-center px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-900 hover:text-zinc-400 transition-colors ${
                  isSidebarCollapsed ? 'justify-center' : ''
                }`}
                title="About Analysis"
              >
                <HelpCircle className="w-4 h-4 flex-shrink-0" />
                <span className={`ml-2 transition-opacity duration-200 ${
                  isSidebarCollapsed ? 'hidden' : 'block'
                }`}>
                  about
                </span>
              </button>
            </>
          )}
        </nav>

        {/* Collapse toggle button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-16 bg-[#0a0a0a] border border-zinc-700 p-0.5 hover:bg-zinc-900 text-zinc-500 focus:outline-none transition-colors"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </div>

      {/* Chat Sidebar */}
      <ChatSidebar isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />

      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
      
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