import React, { useState, useEffect } from 'react';
import { X, Plus, Trash } from 'lucide-react';
import { Persona } from '../../store/personaStore';

interface PersonaEditorProps {
  persona?: Persona | null;
  onSave: (data: Partial<Persona>) => void;
  onClose: () => void;
}

export const PersonaEditor: React.FC<PersonaEditorProps> = ({ persona, onSave, onClose }) => {
  const [name, setName] = useState(persona?.name || '');
  const [role, setRole] = useState(persona?.role || '');
  const [description, setDescription] = useState(persona?.description || '');
  const [quote, setQuote] = useState(persona?.quote || '');
  const [goals, setGoals] = useState<string[]>(persona?.goals || []);
  const [frustrations, setFrustrations] = useState<string[]>(persona?.frustrations || []);
  const [tools, setTools] = useState<string[]>(persona?.tools || []);

  const [newGoal, setNewGoal] = useState('');
  const [newFrustration, setNewFrustration] = useState('');
  const [newTool, setNewTool] = useState('');

  useEffect(() => {
    if (persona) {
      setName(persona.name);
      setRole(persona.role || '');
      setDescription(persona.description || '');
      setQuote(persona.quote || '');
      setGoals(persona.goals || []);
      setFrustrations(persona.frustrations || []);
      setTools(persona.tools || []);
    }
  }, [persona]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      role: role.trim() || null,
      description: description.trim() || null,
      quote: quote.trim() || null,
      goals: goals.filter(g => g.trim()),
      frustrations: frustrations.filter(f => f.trim()),
      tools: tools.filter(t => t.trim()),
    });
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const addFrustration = () => {
    if (newFrustration.trim()) {
      setFrustrations([...frustrations, newFrustration.trim()]);
      setNewFrustration('');
    }
  };

  const addTool = () => {
    if (newTool.trim()) {
      setTools([...tools, newTool.trim()]);
      setNewTool('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0a] border border-zinc-700 max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-zinc-700 px-5 py-2.5 flex items-center justify-between flex-shrink-0">
          <h2 className="text-sm font-medium text-zinc-300">
            {persona ? 'edit persona' : 'new persona'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Sarah Chen"
                autoFocus
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Sales Manager"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                rows={2}
                placeholder="Brief description of this persona"
              />
            </div>

            {/* Quote */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">quote</label>
              <input
                type="text"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="A representative quote from this persona"
              />
            </div>

            {/* Goals */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">goals</label>
              <div className="space-y-1.5">
                {goals.map((goal, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="text-xs text-zinc-500 flex-grow bg-zinc-900 border border-zinc-700 px-2 py-1">
                      {goal}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGoals(goals.filter((_, i) => i !== idx))}
                      className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                    className="flex-grow bg-zinc-900 border border-zinc-700 px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Add a goal..."
                  />
                  <button
                    type="button"
                    onClick={addGoal}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Frustrations */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">frustrations</label>
              <div className="space-y-1.5">
                {frustrations.map((frustration, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="text-xs text-zinc-500 flex-grow bg-zinc-900 border border-zinc-700 px-2 py-1">
                      {frustration}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFrustrations(frustrations.filter((_, i) => i !== idx))}
                      className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newFrustration}
                    onChange={(e) => setNewFrustration(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFrustration())}
                    className="flex-grow bg-zinc-900 border border-zinc-700 px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Add a frustration..."
                  />
                  <button
                    type="button"
                    onClick={addFrustration}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tools */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">tools used</label>
              <div className="space-y-1.5">
                <div className="flex flex-wrap gap-1.5">
                  {tools.map((tool, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-1 px-2 py-0.5 bg-zinc-800 text-xs text-zinc-400 border border-zinc-700"
                    >
                      <span>{tool}</span>
                      <button
                        type="button"
                        onClick={() => setTools(tools.filter((_, i) => i !== idx))}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
                    className="flex-grow bg-zinc-900 border border-zinc-700 px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Add a tool..."
                  />
                  <button
                    type="button"
                    onClick={addTool}
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-700 px-5 py-3 flex justify-end space-x-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-xs text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!name.trim()}
            >
              {persona ? 'save changes' : 'create persona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
