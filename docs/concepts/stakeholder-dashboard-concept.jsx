import React, { useState } from 'react';

// Mock data representing what would come from the research tool
const mockData = {
  project: { name: "Enterprise CRM Research", phase: "discovery" },
  personas: [
    { id: 1, name: "Senior Sales Rep", role: "Account Executive", color: "#22c55e", activitiesCount: 4, insightsCount: 12 },
    { id: 2, name: "Sales Manager", role: "Team Lead", color: "#3b82f6", activitiesCount: 3, insightsCount: 8 },
    { id: 3, name: "Sales Ops", role: "Operations Analyst", color: "#f59e0b", activitiesCount: 5, insightsCount: 15 },
  ],
  workflows: [
    {
      activity: "Prepare for client call",
      importance: "critical",
      personas: [1, 2],
      tasks: [
        { name: "Review account history", painLevel: 2, insights: 3 },
        { name: "Check recent emails", painLevel: 3, insights: 5 },
        { name: "Review open opportunities", painLevel: 1, insights: 2 },
      ]
    },
    {
      activity: "Update CRM after meeting",
      importance: "high",
      personas: [1],
      tasks: [
        { name: "Log call notes", painLevel: 3, insights: 7 },
        { name: "Update deal stage", painLevel: 1, insights: 1 },
        { name: "Schedule follow-up", painLevel: 2, insights: 3 },
      ]
    },
    {
      activity: "Generate weekly report",
      importance: "medium",
      personas: [2, 3],
      tasks: [
        { name: "Export data from CRM", painLevel: 3, insights: 4 },
        { name: "Compile in spreadsheet", painLevel: 3, insights: 6 },
        { name: "Create visualizations", painLevel: 2, insights: 2 },
      ]
    },
  ],
  topPainPoints: [
    { content: "Copy-pasting between 4+ systems for every client call", severity: "critical", count: 8 },
    { content: "No single source of truth for account history", severity: "critical", count: 6 },
    { content: "Manual report compilation takes 3+ hours weekly", severity: "high", count: 5 },
    { content: "CRM fields don't match actual workflow", severity: "high", count: 4 },
  ],
  stats: {
    sessions: 12,
    insights: 47,
    painPoints: 23,
    activities: 8,
  }
};

const PainIndicator = ({ level }) => {
  const colors = ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className={`w-2 h-2 rounded-full ${i < level ? colors[level - 1] : 'bg-gray-700'}`} />
      ))}
    </div>
  );
};

const SeverityBadge = ({ severity }) => {
  const styles = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${styles[severity]}`}>
      {severity}
    </span>
  );
};

export default function StakeholderDashboard() {
  const [activeView, setActiveView] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{mockData.project.name}</h1>
            <p className="text-gray-400 mt-1">Research findings & insights</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition">
              Export PDF
            </button>
            <button className="px-4 py-2 bg-indigo-600 rounded-lg text-sm hover:bg-indigo-500 transition">
              Share
            </button>
          </div>
        </div>
        
        {/* Nav tabs */}
        <div className="flex gap-6 mt-6">
          {['overview', 'workflows', 'personas', 'pain points'].map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`pb-2 text-sm font-medium border-b-2 transition ${
                activeView === view 
                  ? 'border-indigo-500 text-white' 
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Research Sessions', value: mockData.stats.sessions, color: 'text-yellow-400' },
            { label: 'Total Insights', value: mockData.stats.insights, color: 'text-blue-400' },
            { label: 'Pain Points', value: mockData.stats.painPoints, color: 'text-red-400' },
            { label: 'Activities Mapped', value: mockData.stats.activities, color: 'text-green-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 rounded-xl p-4">
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Workflow Pain Map */}
          <div className="col-span-2 bg-gray-900 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Workflow Pain Map</h2>
            <p className="text-gray-400 text-sm mb-6">Pain intensity across mapped activities and tasks</p>
            
            <div className="space-y-4">
              {mockData.workflows.map((workflow, i) => (
                <div key={i} className="border border-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-gray-800/50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{workflow.activity}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        workflow.importance === 'critical' ? 'bg-red-500/20 text-red-400' :
                        workflow.importance === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {workflow.importance}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {workflow.personas.map(pId => {
                        const persona = mockData.personas.find(p => p.id === pId);
                        return (
                          <div
                            key={pId}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: persona.color + '30', color: persona.color }}
                            title={persona.name}
                          >
                            {persona.name[0]}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    {workflow.tasks.map((task, j) => (
                      <div key={j} className="flex items-center justify-between py-1">
                        <span className="text-gray-300 text-sm">{task.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500 text-xs">{task.insights} insights</span>
                          <PainIndicator level={task.painLevel} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Personas */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Personas</h2>
              <div className="space-y-3">
                {mockData.personas.map(persona => (
                  <div key={persona.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                      style={{ backgroundColor: persona.color + '30', color: persona.color }}
                    >
                      {persona.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{persona.name}</div>
                      <div className="text-gray-400 text-xs">{persona.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">{persona.activitiesCount} activities</div>
                      <div className="text-xs text-gray-500">{persona.insightsCount} insights</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Pain Points */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Top Pain Points</h2>
              <div className="space-y-3">
                {mockData.topPainPoints.map((pain, i) => (
                  <div key={i} className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm text-gray-300">{pain.content}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <SeverityBadge severity={pain.severity} />
                      <span className="text-xs text-gray-500">{pain.count} mentions</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 flex items-center gap-8 text-sm text-gray-400">
          <span className="font-medium text-gray-300">Pain Level:</span>
          <div className="flex items-center gap-2">
            <PainIndicator level={1} />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-2">
            <PainIndicator level={2} />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <PainIndicator level={3} />
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <PainIndicator level={4} />
            <span>Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}
