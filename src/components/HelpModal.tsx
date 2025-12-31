import React from 'react';
import { X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 relative">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">Activity-Based Task Analysis</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Activity-Based Task Analysis is a method for understanding and breaking down the work that users do. It involves three levels:
          </p>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-medium text-blue-900 mb-2">Activities</h3>
              <p className="text-blue-800">These are high-level goals or purposes that users want to achieve.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="font-medium text-green-900 mb-2">Tasks</h3>
              <p className="text-green-800">Within each activity, tasks represent the specific steps or actions needed to accomplish that goal.</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <h3 className="font-medium text-amber-900 mb-2">Operations</h3>
              <p className="text-amber-800">These are the smallest, detailed actions that make up each task.</p>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed mt-4">
            This structured approach helps you document and analyze how users perform their work, making it easier to design products that truly support their needs.
          </p>
        </div>
      </div>
    </div>
  );
};