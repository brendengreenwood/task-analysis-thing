import React, { useState } from 'react';
import { LayoutGrid, HelpCircle, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
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

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div 
        className={`bg-white shadow-lg transition-all duration-300 ease-in-out relative flex flex-col ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className={`text-xl font-bold text-gray-900 transition-opacity duration-200 ${
            isSidebarCollapsed ? 'opacity-0' : 'opacity-100'
          }`}>
            Task Analyzer
          </h1>
        </div>
        
        <nav className="p-4 space-y-2 flex-1">
          <button
            onClick={() => setShowNewProjectForm(true)}
            className={`w-full flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
            title="New Project"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span className={`ml-2 transition-opacity duration-200 ${
              isSidebarCollapsed ? 'hidden' : 'block'
            }`}>
              New Project
            </span>
          </button>

          <Link
            to="/"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors ${
              location.pathname === '/' ? 'text-blue-600 bg-blue-50' : 'text-gray-900'
            } ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title="Projects"
          >
            <LayoutGrid className="w-4 h-4 flex-shrink-0" />
            <span className={`ml-2 transition-opacity duration-200 ${
              isSidebarCollapsed ? 'hidden' : 'block'
            }`}>
              Projects
            </span>
          </Link>

          <button
            onClick={() => setIsHelpModalOpen(true)}
            className={`w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 transition-colors ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
            title="About Analysis"
          >
            <HelpCircle className="w-4 h-4 flex-shrink-0" />
            <span className={`ml-2 transition-opacity duration-200 ${
              isSidebarCollapsed ? 'hidden' : 'block'
            }`}>
              About Analysis
            </span>
          </button>
        </nav>

        {/* Collapse toggle button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-20 bg-white rounded-full p-1 shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
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