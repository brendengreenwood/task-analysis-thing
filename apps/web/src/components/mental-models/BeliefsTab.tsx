import React, { useState } from 'react';
import { MentalModel, useMentalModelStore } from '../../store/mentalModelStore';
import { Plus, AlertTriangle, CheckCircle, Edit, Trash2 } from 'lucide-react';

interface BeliefsTabProps {
  mentalModel: MentalModel;
}

type Filter = 'all' | 'mismatches' | 'accurate';

export const BeliefsTab: React.FC<BeliefsTabProps> = ({ mentalModel }) => {
  const { createBelief, updateBelief, deleteBelief } = useMentalModelStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    content: '',
    reality: '',
    isMismatch: false,
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  });

  const beliefs = mentalModel.beliefs || [];
  const filteredBeliefs = beliefs.filter((b) => {
    if (filter === 'mismatches') return b.isMismatch;
    if (filter === 'accurate') return !b.isMismatch;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    try {
      if (editingId) {
        await updateBelief(editingId, formData);
        setEditingId(null);
      } else {
        await createBelief(mentalModel.id, {
          ...formData,
          insightIds: [],
        });
        setIsAdding(false);
      }
      setFormData({
        content: '',
        reality: '',
        isMismatch: false,
        severity: 'medium',
      });
    } catch (error) {
      console.error('Failed to save belief:', error);
    }
  };

  const handleEdit = (belief: any) => {
    setEditingId(belief.id);
    setFormData({
      content: belief.content,
      reality: belief.reality || '',
      isMismatch: belief.isMismatch,
      severity: belief.severity || 'medium',
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this belief?')) {
      try {
        await deleteBelief(id);
      } catch (error) {
        console.error('Failed to delete belief:', error);
      }
    }
  };

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 border-red-400';
      case 'high':
        return 'text-orange-400 border-orange-400';
      case 'medium':
        return 'text-yellow-400 border-yellow-400';
      case 'low':
        return 'text-blue-400 border-blue-400';
      default:
        return 'text-zinc-500 border-zinc-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs border transition-colors ${
              filter === 'all'
                ? 'border-purple-400 text-purple-400 bg-purple-950/30'
                : 'border-zinc-700 text-zinc-500 hover:text-zinc-400'
            }`}
          >
            all ({beliefs.length})
          </button>
          <button
            onClick={() => setFilter('mismatches')}
            className={`px-3 py-1.5 text-xs border transition-colors ${
              filter === 'mismatches'
                ? 'border-red-400 text-red-400 bg-red-950/30'
                : 'border-zinc-700 text-zinc-500 hover:text-zinc-400'
            }`}
          >
            mismatches ({beliefs.filter((b) => b.isMismatch).length})
          </button>
          <button
            onClick={() => setFilter('accurate')}
            className={`px-3 py-1.5 text-xs border transition-colors ${
              filter === 'accurate'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-950/30'
                : 'border-zinc-700 text-zinc-500 hover:text-zinc-400'
            }`}
          >
            accurate ({beliefs.filter((b) => !b.isMismatch).length})
          </button>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-xs text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>add belief</span>
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-zinc-700 p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">what user believes</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="e.g., When I save notes, they sync to my phone automatically"
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm px-3 py-2 focus:outline-none focus:border-purple-500"
                rows={2}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">actual reality</label>
              <textarea
                value={formData.reality}
                onChange={(e) => setFormData({ ...formData, reality: e.target.value })}
                placeholder="e.g., Drafts are local-only until published. No automatic sync."
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm px-3 py-2 focus:outline-none focus:border-purple-500"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-zinc-400">
                <input
                  type="checkbox"
                  checked={formData.isMismatch}
                  onChange={(e) => setFormData({ ...formData, isMismatch: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>belief mismatches reality</span>
              </label>
              {formData.isMismatch && (
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs px-2 py-1 focus:outline-none focus:border-purple-500"
                >
                  <option value="low">low severity</option>
                  <option value="medium">medium severity</option>
                  <option value="high">high severity</option>
                  <option value="critical">critical severity</option>
                </select>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-xs text-white transition-colors"
              >
                {editingId ? 'update' : 'add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData({ content: '', reality: '', isMismatch: false, severity: 'medium' });
                }}
                className="px-3 py-1.5 border border-zinc-700 text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Beliefs List */}
      {filteredBeliefs.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-zinc-700 p-8 text-center">
          <p className="text-sm text-zinc-500">no beliefs to show</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBeliefs.map((belief) => (
            <div
              key={belief.id}
              className={`bg-[#0a0a0a] border p-4 ${
                belief.isMismatch ? 'border-red-900/50' : 'border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Belief Content */}
                  <div className="flex items-start gap-2 mb-3">
                    {belief.isMismatch ? (
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-zinc-200 mb-2">{belief.content}</p>
                      {belief.reality && (
                        <div className="bg-zinc-900/50 border border-zinc-800 p-2">
                          <p className="text-xs text-zinc-500 mb-1">reality:</p>
                          <p className="text-xs text-zinc-400">{belief.reality}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Severity Badge */}
                  {belief.isMismatch && belief.severity && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs border ${getSeverityColor(
                          belief.severity
                        )}`}
                      >
                        {belief.severity} severity
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(belief)}
                    className="text-zinc-500 hover:text-zinc-400 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(belief.id)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
