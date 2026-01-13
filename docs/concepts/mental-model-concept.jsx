import React, { useState } from 'react';

// Mock data
const mockMentalModel = {
  name: "How Sales Reps Think About Customers",
  persona: "Senior Sales Rep",
  concepts: [
    { id: 1, name: "CLIENT", userLanguage: "the company we sell to", systemEquivalent: "Account", x: 150, y: 80 },
    { id: 2, name: "CONTACT", userLanguage: "my person there", systemEquivalent: "Contact", x: 150, y: 280 },
    { id: 3, name: "DEAL", userLanguage: "an opp, a chance to close", systemEquivalent: "Opportunity", x: 450, y: 80 },
    { id: 4, name: "REP", userLanguage: "me, my territory", systemEquivalent: "User", x: 450, y: 280 },
  ],
  relationships: [
    { from: 1, to: 2, label: "has contacts", type: "contains" },
    { from: 1, to: 3, label: "has deals", type: "contains" },
    { from: 3, to: 4, label: "owned by", type: "requires" },
    { from: 2, to: 4, label: "managed by", type: "requires" },
  ],
  beliefs: [
    { id: 1, content: "When I save notes, they sync to my phone automatically", reality: "Drafts are local-only until published. No automatic sync.", isMismatch: true, severity: "critical", evidenceCount: 3 },
    { id: 2, content: "My manager can see all my deal notes", reality: "Notes are private by default unless explicitly shared.", isMismatch: true, severity: "high", evidenceCount: 5 },
    { id: 3, content: "Contacts and Accounts are basically the same thing", reality: "Separate entities with different permissions, fields, and reporting.", isMismatch: true, severity: "medium", evidenceCount: 4 },
    { id: 4, content: "Admins can see everything in the system", reality: null, isMismatch: false, evidenceCount: 2 },
  ],
};

const ConceptNode = ({ concept, isSelected, onClick }) => (
  <g onClick={onClick} style={{ cursor: 'pointer' }}>
    <rect
      x={concept.x - 70}
      y={concept.y - 40}
      width={140}
      height={80}
      rx={8}
      fill={isSelected ? "#1e3a5f" : "#1e293b"}
      stroke={isSelected ? "#3b82f6" : "#334155"}
      strokeWidth={isSelected ? 2 : 1}
    />
    <text x={concept.x} y={concept.y - 15} textAnchor="middle" fill="white" fontWeight="bold" fontSize={14}>
      {concept.name}
    </text>
    <text x={concept.x} y={concept.y + 5} textAnchor="middle" fill="#94a3b8" fontSize={11}>
      "{concept.userLanguage}"
    </text>
    <text x={concept.x} y={concept.y + 25} textAnchor="middle" fill="#64748b" fontSize={10}>
      → {concept.systemEquivalent}
    </text>
  </g>
);

const RelationshipLine = ({ from, to, label }) => {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  
  return (
    <g>
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
        </marker>
      </defs>
      <line
        x1={from.x}
        y1={from.y + 40}
        x2={to.x}
        y2={to.y - 40}
        stroke="#64748b"
        strokeWidth={1.5}
        markerEnd="url(#arrowhead)"
      />
      <rect
        x={midX - 40}
        y={midY - 10}
        width={80}
        height={20}
        rx={4}
        fill="#0f172a"
      />
      <text x={midX} y={midY + 4} textAnchor="middle" fill="#94a3b8" fontSize={10}>
        {label}
      </text>
    </g>
  );
};

const SeverityBadge = ({ severity }) => {
  const styles = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/40',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    low: 'bg-green-500/20 text-green-400 border-green-500/40',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${styles[severity]}`}>
      {severity}
    </span>
  );
};

const BeliefCard = ({ belief }) => (
  <div className={`p-4 rounded-lg border ${belief.isMismatch ? 'bg-red-950/20 border-red-500/30' : 'bg-green-950/20 border-green-500/30'}`}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {belief.isMismatch ? (
          <span className="text-red-400">⚠️ Mismatch</span>
        ) : (
          <span className="text-green-400">✓ Accurate</span>
        )}
      </div>
      {belief.isMismatch && <SeverityBadge severity={belief.severity} />}
    </div>
    
    <div className="mb-3">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">User believes:</div>
      <div className="text-gray-200 text-sm">"{belief.content}"</div>
    </div>
    
    {belief.isMismatch && belief.reality && (
      <div className="mb-3">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reality:</div>
        <div className="text-gray-400 text-sm">{belief.reality}</div>
      </div>
    )}
    
    <div className="text-xs text-gray-500">
      {belief.evidenceCount} supporting insight{belief.evidenceCount !== 1 ? 's' : ''}
    </div>
  </div>
);

const VocabularyTable = ({ concepts }) => (
  <div className="bg-gray-900 rounded-lg overflow-hidden">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-800">
          <th className="text-left p-3 text-gray-400 font-medium">User Says</th>
          <th className="text-left p-3 text-gray-400 font-medium">System Calls It</th>
        </tr>
      </thead>
      <tbody>
        {concepts.map(concept => (
          <tr key={concept.id} className="border-t border-gray-800">
            <td className="p-3 text-gray-200">"{concept.userLanguage}"</td>
            <td className="p-3 text-gray-400">{concept.systemEquivalent}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function MentalModelVisualization() {
  const [activeTab, setActiveTab] = useState('canvas');
  const [selectedConcept, setSelectedConcept] = useState(null);
  
  const tabs = ['canvas', 'beliefs', 'vocabulary'];
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-gray-400 text-sm">Mental Model</span>
          <span className="text-gray-600">/</span>
          <span className="text-gray-400 text-sm">{mockMentalModel.persona}</span>
        </div>
        <h1 className="text-xl font-semibold">{mockMentalModel.name}</h1>
        
        {/* Tabs */}
        <div className="flex gap-6 mt-4">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium border-b-2 transition capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Canvas View */}
        {activeTab === 'canvas' && (
          <div className="flex gap-6">
            <div className="flex-1 bg-gray-900 rounded-xl p-4">
              <svg viewBox="0 0 600 400" className="w-full h-96">
                {/* Relationships (render first so they're behind nodes) */}
                {mockMentalModel.relationships.map((rel, i) => {
                  const from = mockMentalModel.concepts.find(c => c.id === rel.from);
                  const to = mockMentalModel.concepts.find(c => c.id === rel.to);
                  return <RelationshipLine key={i} from={from} to={to} label={rel.label} />;
                })}
                
                {/* Concept nodes */}
                {mockMentalModel.concepts.map(concept => (
                  <ConceptNode
                    key={concept.id}
                    concept={concept}
                    isSelected={selectedConcept === concept.id}
                    onClick={() => setSelectedConcept(concept.id === selectedConcept ? null : concept.id)}
                  />
                ))}
              </svg>
              
              <div className="flex justify-center gap-4 mt-4">
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
                  + Add Concept
                </button>
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
                  + Add Relationship
                </button>
              </div>
            </div>
            
            {/* Side panel for selected concept */}
            {selectedConcept && (
              <div className="w-80 bg-gray-900 rounded-xl p-4">
                {(() => {
                  const concept = mockMentalModel.concepts.find(c => c.id === selectedConcept);
                  return (
                    <>
                      <h3 className="font-semibold text-lg mb-4">{concept.name}</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-gray-500 uppercase tracking-wide">User Language</label>
                          <div className="mt-1 p-2 bg-gray-800 rounded text-sm">"{concept.userLanguage}"</div>
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-500 uppercase tracking-wide">System Equivalent</label>
                          <div className="mt-1 p-2 bg-gray-800 rounded text-sm">{concept.systemEquivalent}</div>
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-500 uppercase tracking-wide">Related Beliefs</label>
                          <div className="mt-1 text-sm text-gray-400">2 beliefs reference this concept</div>
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-500 uppercase tracking-wide">Used In Tasks</label>
                          <div className="mt-1 text-sm text-gray-400">
                            • Log call notes<br/>
                            • Update deal stage
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Beliefs View */}
        {activeTab === 'beliefs' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-4">
                <button className="px-3 py-1.5 bg-gray-800 rounded-lg text-sm">All</button>
                <button className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm">Mismatches</button>
                <button className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm">Accurate</button>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition">
                + Add Belief
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {mockMentalModel.beliefs.map(belief => (
                <BeliefCard key={belief.id} belief={belief} />
              ))}
            </div>
            
            {/* Summary stats */}
            <div className="mt-8 p-4 bg-gray-900 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-red-400">3</span>
                <span className="text-gray-400 ml-2">belief mismatches</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-orange-400">2</span>
                <span className="text-gray-400 ml-2">high+ severity</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-blue-400">14</span>
                <span className="text-gray-400 ml-2">supporting insights</span>
              </div>
            </div>
          </div>
        )}

        {/* Vocabulary View */}
        {activeTab === 'vocabulary' && (
          <div>
            <p className="text-gray-400 mb-6">
              Map between how users talk about concepts and what the system calls them. 
              Use this for UI copy, agent prompts, and documentation.
            </p>
            
            <VocabularyTable concepts={mockMentalModel.concepts} />
            
            <div className="mt-6 p-4 bg-blue-950/30 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-blue-400 text-lg">💡</span>
                <div>
                  <div className="text-blue-400 font-medium mb-1">Agent Context Tip</div>
                  <div className="text-gray-400 text-sm">
                    Export this vocabulary map to your agent prompts. When users say "my person there", 
                    the agent should understand they mean a Contact and respond using their language, not system terminology.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
