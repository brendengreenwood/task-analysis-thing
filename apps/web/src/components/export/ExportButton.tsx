import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { api } from '../../lib/api';

interface ExportButtonProps {
  projectId: string;
  projectName: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ projectId, projectName }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Fetch the export data
      const exportData = await api.exportProject(projectId);

      // Create a blob from the JSON data
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      // Create a download link and trigger it
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with project name and timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${projectName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.json`;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export project:', error);
      alert('Failed to export project. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-zinc-600 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Export project as JSON"
    >
      <Download className="w-3.5 h-3.5" />
      <span>{isExporting ? 'exporting...' : 'export'}</span>
    </button>
  );
};
