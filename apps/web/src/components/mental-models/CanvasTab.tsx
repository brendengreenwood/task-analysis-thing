import React, { useState, useRef } from 'react';
import { MentalModel, useMentalModelStore, Concept } from '../../store/mentalModelStore';
import { Plus, Edit, Trash2, Move } from 'lucide-react';

interface CanvasTabProps {
  mentalModel: MentalModel;
}

export const CanvasTab: React.FC<CanvasTabProps> = ({ mentalModel }) => {
  const { createConcept, updateConcept, deleteConcept, createRelationship, deleteRelationship } = useMentalModelStore();
  const svgRef = useRef<SVGSVGElement>(null);

  const [isAddingConcept, setIsAddingConcept] = useState(false);
  const [isAddingRelationship, setIsAddingRelationship] = useState(false);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [conceptForm, setConceptForm] = useState({
    name: '',
    description: '',
    userLanguage: '',
    systemEquivalent: '',
  });

  const [relationshipForm, setRelationshipForm] = useState({
    fromConceptId: '',
    toConceptId: '',
    label: '',
  });

  const concepts = mentalModel.concepts || [];
  const relationships = mentalModel.relationships || [];

  const handleAddConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conceptForm.name.trim()) return;

    try {
      await createConcept(mentalModel.id, {
        ...conceptForm,
        description: conceptForm.description || null,
        userLanguage: conceptForm.userLanguage || null,
        systemEquivalent: conceptForm.systemEquivalent || null,
        x: 200,
        y: 150,
      });
      setConceptForm({ name: '', description: '', userLanguage: '', systemEquivalent: '' });
      setIsAddingConcept(false);
    } catch (error) {
      console.error('Failed to add concept:', error);
    }
  };

  const handleAddRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!relationshipForm.fromConceptId || !relationshipForm.toConceptId) return;

    try {
      await createRelationship(mentalModel.id, {
        fromConceptId: relationshipForm.fromConceptId,
        toConceptId: relationshipForm.toConceptId,
        relationshipType: null,
        label: relationshipForm.label || null,
      });
      setRelationshipForm({ fromConceptId: '', toConceptId: '', label: '' });
      setIsAddingRelationship(false);
    } catch (error) {
      console.error('Failed to add relationship:', error);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, conceptId: string) => {
    if (!svgRef.current) return;

    const concept = concepts.find(c => c.id === conceptId);
    if (!concept) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;

    setDraggingId(conceptId);
    setDragOffset({
      x: mouseX - concept.x,
      y: mouseY - concept.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !svgRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;

    const newX = Math.max(0, Math.min(800 - 150, mouseX - dragOffset.x));
    const newY = Math.max(0, Math.min(600 - 100, mouseY - dragOffset.y));

    updateConcept(draggingId, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleDeleteConcept = async (id: string) => {
    if (confirm('Delete this concept?')) {
      try {
        await deleteConcept(id);
      } catch (error) {
        console.error('Failed to delete concept:', error);
      }
    }
  };

  const handleDeleteRelationship = async (id: string) => {
    if (confirm('Delete this relationship?')) {
      try {
        await deleteRelationship(id);
      } catch (error) {
        console.error('Failed to delete relationship:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        {!isAddingConcept && (
          <button
            onClick={() => setIsAddingConcept(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-xs text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>add concept</span>
          </button>
        )}
        {!isAddingRelationship && concepts.length >= 2 && (
          <button
            onClick={() => setIsAddingRelationship(true)}
            className="flex items-center gap-2 px-3 py-1.5 border border-purple-600 text-purple-400 hover:bg-purple-950/30 text-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>add relationship</span>
          </button>
        )}
      </div>

      {/* Add Concept Form */}
      {isAddingConcept && (
        <form onSubmit={handleAddConcept} className="bg-[#0a0a0a] border border-zinc-700 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">concept name</label>
              <input
                type="text"
                value={conceptForm.name}
                onChange={(e) => setConceptForm({ ...conceptForm, name: e.target.value })}
                placeholder="e.g., CLIENT"
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm px-3 py-2 focus:outline-none focus:border-purple-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">description</label>
              <input
                type="text"
                value={conceptForm.description}
                onChange={(e) => setConceptForm({ ...conceptForm, description: e.target.value })}
                placeholder="optional"
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm px-3 py-2 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">user language</label>
              <input
                type="text"
                value={conceptForm.userLanguage}
                onChange={(e) => setConceptForm({ ...conceptForm, userLanguage: e.target.value })}
                placeholder="e.g., the company we sell to"
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm px-3 py-2 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">system equivalent</label>
              <input
                type="text"
                value={conceptForm.systemEquivalent}
                onChange={(e) => setConceptForm({ ...conceptForm, systemEquivalent: e.target.value })}
                placeholder="e.g., Account"
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm px-3 py-2 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              type="submit"
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-xs text-white transition-colors"
            >
              add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingConcept(false);
                setConceptForm({ name: '', description: '', userLanguage: '', systemEquivalent: '' });
              }}
              className="px-3 py-1.5 border border-zinc-700 text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              cancel
            </button>
          </div>
        </form>
      )}

      {/* Add Relationship Form */}
      {isAddingRelationship && (
        <form onSubmit={handleAddRelationship} className="bg-[#0a0a0a] border border-zinc-700 p-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">from concept</label>
              <select
                value={relationshipForm.fromConceptId}
                onChange={(e) => setRelationshipForm({ ...relationshipForm, fromConceptId: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm px-3 py-2 focus:outline-none focus:border-purple-500"
              >
                <option value="">select...</option>
                {concepts.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">relationship label</label>
              <input
                type="text"
                value={relationshipForm.label}
                onChange={(e) => setRelationshipForm({ ...relationshipForm, label: e.target.value })}
                placeholder="e.g., has contacts"
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm px-3 py-2 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">to concept</label>
              <select
                value={relationshipForm.toConceptId}
                onChange={(e) => setRelationshipForm({ ...relationshipForm, toConceptId: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm px-3 py-2 focus:outline-none focus:border-purple-500"
              >
                <option value="">select...</option>
                {concepts.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              type="submit"
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-xs text-white transition-colors"
            >
              add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingRelationship(false);
                setRelationshipForm({ fromConceptId: '', toConceptId: '', label: '' });
              }}
              className="px-3 py-1.5 border border-zinc-700 text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              cancel
            </button>
          </div>
        </form>
      )}

      {/* Canvas */}
      <div className="bg-[#0a0a0a] border border-zinc-700 p-4">
        {concepts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-zinc-500 mb-2">no concepts yet</p>
            <p className="text-xs text-zinc-600">add concepts to start building the mental model</p>
          </div>
        ) : (
          <svg
            ref={svgRef}
            width="800"
            height="600"
            className="bg-zinc-950 border border-zinc-800"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Relationships (arrows) */}
            {relationships.map((rel) => {
              const fromConcept = concepts.find(c => c.id === rel.fromConceptId);
              const toConcept = concepts.find(c => c.id === rel.toConceptId);
              if (!fromConcept || !toConcept) return null;

              const fromX = fromConcept.x + 75;
              const fromY = fromConcept.y + 50;
              const toX = toConcept.x + 75;
              const toY = toConcept.y + 50;

              return (
                <g key={rel.id}>
                  <defs>
                    <marker
                      id={`arrow-${rel.id}`}
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path d="M0,0 L0,6 L9,3 z" fill="#6366f1" />
                    </marker>
                  </defs>
                  <line
                    x1={fromX}
                    y1={fromY}
                    x2={toX}
                    y2={toY}
                    stroke="#6366f1"
                    strokeWidth="2"
                    markerEnd={`url(#arrow-${rel.id})`}
                  />
                  {rel.label && (
                    <text
                      x={(fromX + toX) / 2}
                      y={(fromY + toY) / 2 - 5}
                      fill="#a78bfa"
                      fontSize="12"
                      textAnchor="middle"
                    >
                      {rel.label}
                    </text>
                  )}
                  <circle
                    cx={(fromX + toX) / 2}
                    cy={(fromY + toY) / 2}
                    r="8"
                    fill="#a78bfa"
                    opacity="0.3"
                    className="cursor-pointer hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteRelationship(rel.id)}
                  />
                </g>
              );
            })}

            {/* Concepts (nodes) */}
            {concepts.map((concept) => (
              <g
                key={concept.id}
                transform={`translate(${concept.x}, ${concept.y})`}
                onMouseDown={(e) => handleMouseDown(e as any, concept.id)}
                className="cursor-move"
              >
                <rect
                  width="150"
                  height="100"
                  fill="#18181b"
                  stroke={selectedConceptId === concept.id ? '#a78bfa' : '#3f3f46'}
                  strokeWidth="2"
                  className="hover:stroke-purple-400 transition-colors"
                  onClick={() => setSelectedConceptId(concept.id)}
                />
                <text
                  x="75"
                  y="25"
                  fill="#e4e4e7"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {concept.name}
                </text>
                {concept.userLanguage && (
                  <text
                    x="75"
                    y="45"
                    fill="#a78bfa"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    "{concept.userLanguage}"
                  </text>
                )}
                {concept.systemEquivalent && (
                  <text
                    x="75"
                    y="60"
                    fill="#10b981"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {concept.systemEquivalent}
                  </text>
                )}
                {selectedConceptId === concept.id && (
                  <g>
                    <circle
                      cx="140"
                      cy="10"
                      r="8"
                      fill="#ef4444"
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConcept(concept.id);
                      }}
                    />
                    <text
                      x="140"
                      y="14"
                      fill="white"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      ×
                    </text>
                  </g>
                )}
              </g>
            ))}
          </svg>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-3">
        <p className="text-xs text-zinc-500">
          <Move className="w-3 h-3 inline mr-1" />
          drag concepts to arrange them • click to select • click the × to delete
        </p>
      </div>
    </div>
  );
};
