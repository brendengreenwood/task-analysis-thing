import React from 'react';
import { X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#0a0a0a] border border-zinc-700 max-w-2xl w-full mx-4 relative">
        <div className="flex justify-between items-center p-6 border-b border-zinc-700">
          <h2 className="text-xl font-semibold text-zinc-200">activity-based task analysis</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-zinc-400 leading-relaxed text-sm">
            activity-based task analysis is a method for understanding and breaking down the work that users do. it involves three levels:
          </p>
          <div className="space-y-4">
            <div className="bg-purple-500/10 p-4 border border-purple-500/30">
              <h3 className="font-medium text-purple-300 mb-2 text-sm">activities</h3>
              <p className="text-purple-400/80 text-sm">these are high-level goals or purposes that users want to achieve.</p>
            </div>
            <div className="bg-emerald-500/10 p-4 border border-emerald-500/30">
              <h3 className="font-medium text-emerald-300 mb-2 text-sm">tasks</h3>
              <p className="text-emerald-400/80 text-sm">within each activity, tasks represent the specific steps or actions needed to accomplish that goal.</p>
            </div>
            <div className="bg-amber-500/10 p-4 border border-amber-500/30">
              <h3 className="font-medium text-amber-300 mb-2 text-sm">operations</h3>
              <p className="text-amber-400/80 text-sm">these are the smallest, detailed actions that make up each task.</p>
            </div>
          </div>
          <p className="text-zinc-400 leading-relaxed mt-4 text-sm">
            this structured approach helps you document and analyze how users perform their work, making it easier to design products that truly support their needs.
          </p>
        </div>
      </div>
    </div>
  );
};