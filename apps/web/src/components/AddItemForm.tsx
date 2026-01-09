import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { FocusLevel } from '../types';

interface AddItemFormProps {
  level: FocusLevel;
  onSubmit?: (name: string, description?: string) => void;
  onClose: () => void;
}

export const AddItemForm: React.FC<AddItemFormProps> = ({
  level,
  onSubmit,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { addProject } = useStore();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    // Focus the input when the form appears
    inputRef.current?.focus();

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (level === 'project') {
      const projectId = addProject(name, description);
      onClose();
      navigate(`/projects/${projectId}`);
    } else if (onSubmit) {
      onSubmit(name.trim(), description.trim());
      setName('');
      setDescription('');
      onClose();
    }
  };

  if (level === 'project') {
    return (
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 p-4">
        <div>
          <label htmlFor="name" className="block text-xs text-zinc-500 mb-1.5">
            name
          </label>
          <input
            ref={inputRef}
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-zinc-700 bg-[#0a0a0a] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 text-sm"
            placeholder="project name"
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-xs text-zinc-500 mb-1.5">
            description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-2.5 py-1.5 border border-zinc-700 bg-[#0a0a0a] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 text-sm resize-none"
            placeholder="description"
          />
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-400 focus:outline-none transition-colors"
          >
            cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs text-zinc-300 border border-zinc-700 hover:bg-zinc-900 focus:outline-none transition-colors"
          >
            create
          </button>
        </div>
      </form>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex items-center gap-2 mb-3 group"
    >
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={`new ${level}`}
        className="flex-1 px-2.5 py-1.5 border border-zinc-700 bg-[#0a0a0a] text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-600"
      />
      <button
        type="submit"
        className="p-1.5 text-zinc-400 border border-zinc-700 hover:bg-zinc-900 focus:outline-none transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onClose}
        className="p-1.5 text-zinc-600 hover:text-red-500 focus:outline-none transition-colors"
        title="Cancel (Esc)"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </form>
  );
};