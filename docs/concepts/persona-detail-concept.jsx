import React, { useState } from 'react';

const mockPersona = {
  id: 'persona-1',
  name: 'Senior Sales Rep',
  role: 'Account Executive',
  description: 'Experienced sales professional responsible for managing enterprise accounts. Spends 60% of time in meetings or preparing for them. Primary focus is closing deals, but drowning in admin work.',
  quote: "I just need to know what happened last time before I call",
  goals: ['Close deals faster', 'Reduce admin overhead', 'Never be surprised on a client call'],
  frustrations: ['Too many tools to juggle', 'Manual data entry everywhere', "Can't find info when needed", "CRM doesn't match how I think"],
  tools: ['Salesforce', 'Outlook', 'Excel', 'Slack', 'Zoom', 'LinkedIn'],
  skills: ['Negotiation', 'Relationship building', 'Pipeline management'],
  environment: 'Hybrid (office 3 days, home 2 days)',
  experienceLevel: 'expert',
  usageFrequency: 'daily',
  influence: 'end_user',
  stats: { activities: 4, insights: 12, sessions: 3, painPoints: 8 }
};

const mockActivities = [
  { id: 1, name: 'Prepare for client call', frequency: 'daily', importance: 'critical', painPoints: 5, insights: 8, frictionLevel: 0.85 },
  { id: 2, name: 'Update CRM after meeting', frequency: 'daily', importance: 'high', painPoints: 3, insights: 4, frictionLevel: 0.5 },
  { id: 3, name: 'Review weekly pipeline', frequency: 'weekly', importance: 'medium', painPoints: 1, insights: 2, frictionLevel: 0.2 },
  { id: 4, name: 'Handoff to customer success', frequency: 'occasional', importance: 'high', painPoints: 2, insights: 3, frictionLevel: 0.4 },
];

const mockSessions = [
  { id: 1, type: 'interview', date: 'Jan 8, 2025', participant: 'Sarah (P1)', duration: 45, preview: 'Spent first 15 min discussing call prep frustrations...', insightCount: 6 },
  { id: 2, type: 'observation', date: 'Jan 5, 2025', participant: 'Mike (P2)', duration: 60, preview: 'Shadowed pre-call routine. Watched him switch between 6 apps.', insightCount: 4 },
  { id: 3, type: 'usability_test', date: 'Dec 20, 2024', participant: 'Jordan (P3)', duration: 30, preview: 'Tested new dashboard prototype. Mixed results.', insightCount: 2 },
];

const mockInsights = [
  { id: 1, type: 'pain_point', severity: 'critical', content: 'Copy-pasting between 4+ systems for every client call', linkedTo: 'Prepare for client call > Gather context', sources: 3 },
  { id: 2, type: 'quote', content: 'I have 4 tabs open just to know who I\'m talking to', linkedTo: 'Senior Sales Rep (persona)', sources: 1 },
  { id: 3, type: 'pattern', content: 'All observed reps have personal workaround docs/sheets', linkedTo: 'Senior Sales Rep (persona)', sources: 2 },
  { id: 4, type: 'observation', content: 'Keeps sticky notes on monitor with client nicknames', linkedTo: 'Prepare for client call', sources: 1 },
  { id: 5, type: 'pain_point', severity: 'high', content: 'No single view of account history across touchpoints', linkedTo: 'Prepare for client call > Review history', sources: 2 },
];

const FrictionBar = ({ level }) => {
  const color = level > 0.7 ? 'bg-red-500' : level > 0.4 ? 'bg-yellow-500' : 'bg-green-500';
  const label = level > 0.7 ? 'High friction' : level > 0.4 ? 'Medium friction' : 'Low friction';
  return (
    <div className="flex items-center gap-2">
      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${level * 100}%` }} />
      </div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
};

const InsightTypeBadge = ({ type, severity }) => {
  const styles = {
    pain_point: severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400',
    quote: 'bg-purple-500/20 text-purple-400',
    pattern: 'bg-blue-500/20 text-blue-400',
    observation: 'bg-gray-500/20 text-gray-400',
  };
  const icons = {
    pain_point: '🔴',
    quote: '💬',
    pattern: '🔵',
    observation: '👁',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[type]}`}>
      {icons[type]} {type.replace('_', ' ')}
      {severity && ` · ${severity}`}
    </span>
  );
};

const ContextBadge = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
    <span className="text-gray-400 text-sm">{label}</span>
    <span className="text-gray-200 text-sm capitalize">{value.replace('_', ' ')}</span>
  </div>
);

export default function PersonaDetailConcept() {
  const [activeTab, setActiveTab] = useState('overview');
  const tabs = ['overview', 'workflows', 'research', 'insights', 'mental model'];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="px-6 py-4">
          <button className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-1">
            ← Back to Personas
          </button>
          
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-xl flex items-center justify-center text-3xl font-bold text-green-400 border border-green-500/30">
              SR
            </div>
            
            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{mockPersona.name}</h1>
              <p className="text-gray-400">{mockPersona.role}</p>
              <p className="text-gray-500 mt-2 italic">"{mockPersona.quote}"</p>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
                Edit
              </button>
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
                Export
              </button>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="px-6 flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition capitalize ${
                activeTab === tab
                  ? 'border-green-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Left column */}
            <div className="col-span-2 space-y-6">
              {/* About */}
              <div className="bg-gray-900 rounded-xl p-5">
                <h3 className="text-sm font-medium text-gray-400 mb-3">About</h3>
                <p className="text-gray-200">{mockPersona.description}</p>
              </div>
              
              {/* Goals & Frustrations */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-xl p-5">
                  <h3 className="text-sm font-medium text-green-400 mb-3">Goals</h3>
                  <ul className="space-y-2">
                    {mockPersona.goals.map((goal, i) => (
                      <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-900 rounded-xl p-5">
                  <h3 className="text-sm font-medium text-red-400 mb-3">Frustrations</h3>
                  <ul className="space-y-2">
                    {mockPersona.frustrations.map((f, i) => (
                      <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Tools */}
              <div className="bg-gray-900 rounded-xl p-5">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Tools</h3>
                <div className="flex flex-wrap gap-2">
                  {mockPersona.tools.map((tool, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-800 rounded-lg text-sm text-gray-300">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right column */}
            <div className="space-y-6">
              {/* Context */}
              <div className="bg-gray-900 rounded-xl p-5">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Context</h3>
                <ContextBadge label="Experience" value={mockPersona.experienceLevel} />
                <ContextBadge label="Frequency" value={mockPersona.usageFrequency} />
                <ContextBadge label="Influence" value={mockPersona.influence} />
                <ContextBadge label="Environment" value={mockPersona.environment} />
              </div>
              
              {/* Quick Stats */}
              <div className="bg-gray-900 rounded-xl p-5">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Research Coverage</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-400">{mockPersona.stats.activities}</div>
                    <div className="text-xs text-gray-400">Activities</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">{mockPersona.stats.sessions}</div>
                    <div className="text-xs text-gray-400">Sessions</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{mockPersona.stats.insights}</div>
                    <div className="text-xs text-gray-400">Insights</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">{mockPersona.stats.painPoints}</div>
                    <div className="text-xs text-gray-400">Pain Points</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400">Activities performed by {mockPersona.name}</p>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm transition">
                + Link Activity
              </button>
            </div>
            
            <div className="space-y-4">
              {mockActivities.map(activity => (
                <div key={activity.id} className="bg-gray-900 rounded-xl p-5 hover:bg-gray-850 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${
                          activity.frictionLevel > 0.7 ? 'bg-red-500' : 
                          activity.frictionLevel > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <h3 className="font-medium text-lg">{activity.name}</h3>
                      </div>
                      <p className="text-gray-400 text-sm mt-1 ml-6">
                        {activity.frequency} · {activity.importance} importance
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-white text-sm">
                      View Full →
                    </button>
                  </div>
                  
                  <div className="ml-6 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      {activity.painPoints} pain points · {activity.insights} insights
                    </div>
                    <FrictionBar level={activity.frictionLevel} />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gray-900 rounded-xl border border-gray-800">
              <p className="text-gray-300">
                <span className="text-yellow-400 font-medium">Pain Summary:</span> This persona's biggest friction is in call preparation. 
                Consider aggregating client context into a single pre-call view.
              </p>
            </div>
          </div>
        )}

        {/* Research Tab */}
        {activeTab === 'research' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400">Research sessions with {mockPersona.name}</p>
              <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-sm transition">
                + Add Session
              </button>
            </div>
            
            <div className="space-y-4">
              {mockSessions.map(session => (
                <div key={session.id} className="bg-gray-900 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300 capitalize">
                          {session.type.replace('_', ' ')}
                        </span>
                        <span className="text-gray-400 text-sm">{session.date}</span>
                      </div>
                      <p className="text-white mt-2">Participant: {session.participant}</p>
                      <p className="text-gray-400 text-sm">Duration: {session.duration} min</p>
                    </div>
                    <button className="text-gray-400 hover:text-white text-sm">
                      View Session →
                    </button>
                  </div>
                  
                  <p className="text-gray-300 text-sm italic border-l-2 border-gray-700 pl-3 mt-3">
                    "{session.preview}"
                  </p>
                  
                  <div className="mt-3 text-sm text-gray-500">
                    {session.insightCount} insights extracted
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-gray-800 rounded-lg text-sm">All</button>
                <button className="px-3 py-1.5 bg-gray-800/50 text-gray-400 rounded-lg text-sm">Observations</button>
                <button className="px-3 py-1.5 bg-gray-800/50 text-gray-400 rounded-lg text-sm">Patterns</button>
                <button className="px-3 py-1.5 bg-gray-800/50 text-gray-400 rounded-lg text-sm">Quotes</button>
                <button className="px-3 py-1.5 bg-gray-800/50 text-gray-400 rounded-lg text-sm">Pain Points</button>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition">
                + Add Insight
              </button>
            </div>
            
            <div className="space-y-4">
              {mockInsights.map(insight => (
                <div key={insight.id} className="bg-gray-900 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <InsightTypeBadge type={insight.type} severity={insight.severity} />
                  </div>
                  
                  <p className="text-gray-200 mb-3">"{insight.content}"</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Linked to: {insight.linkedTo}</span>
                    <span className="text-gray-500">{insight.sources} source{insight.sources > 1 ? 's' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mental Model Tab */}
        {activeTab === 'mental model' && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-medium mb-2">No mental model yet</h3>
              <p className="text-gray-400 mb-6">
                Mental models capture how this persona thinks about their work — the concepts they use, how they relate, and what they believe.
              </p>
              <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm transition">
                + Create Mental Model
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
