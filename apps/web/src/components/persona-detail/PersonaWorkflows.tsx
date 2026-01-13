import React from 'react';
import { Workflow, AlertCircle, TrendingDown } from 'lucide-react';

interface PersonaWorkflowsProps {
  persona: any;
}

export const PersonaWorkflows: React.FC<PersonaWorkflowsProps> = ({ persona }) => {
  const activities = persona.activities || [];

  // Calculate pain points for each activity
  const calculateActivityPain = (activity: any) => {
    const activityInsights = persona.insights?.filter((insight: any) => {
      if (insight.linkedEntityType === 'activity' && insight.linkedEntityId === activity.id) {
        return true;
      }

      // Check if insight is linked to tasks/operations within this activity
      const taskIds = activity.tasks?.map((t: any) => t.id) || [];
      const operationIds = activity.tasks?.flatMap((t: any) => t.operations?.map((o: any) => o.id) || []) || [];

      if (insight.linkedEntityType === 'task' && taskIds.includes(insight.linkedEntityId)) {
        return true;
      }

      if (insight.linkedEntityType === 'operation' && operationIds.includes(insight.linkedEntityId)) {
        return true;
      }

      return false;
    }) || [];

    const painPoints = activityInsights.filter((i: any) => i.type === 'pain_point');

    const critical = painPoints.filter((p: any) => p.severity === 'critical').length;
    const high = painPoints.filter((p: any) => p.severity === 'high').length;
    const medium = painPoints.filter((p: any) => p.severity === 'medium').length;
    const low = painPoints.filter((p: any) => p.severity === 'low').length;

    const frictionScore = (critical * 4) + (high * 3) + (medium * 2) + (low * 1);

    return {
      total: painPoints.length,
      critical,
      high,
      medium,
      low,
      frictionScore,
    };
  };

  const FrictionBar: React.FC<{ pain: any }> = ({ pain }) => {
    const maxScore = 20; // Arbitrary max for visualization
    const percentage = Math.min((pain.frictionScore / maxScore) * 100, 100);

    let barColor = 'bg-zinc-700';
    if (pain.frictionScore > 10) barColor = 'bg-red-500';
    else if (pain.frictionScore > 6) barColor = 'bg-orange-500';
    else if (pain.frictionScore > 3) barColor = 'bg-yellow-500';
    else if (pain.frictionScore > 0) barColor = 'bg-blue-500';

    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">friction score</span>
          <span className="text-zinc-400 font-medium">{pain.frictionScore}</span>
        </div>
        <div className="h-1.5 bg-zinc-900 border border-zinc-700">
          <div
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {pain.total > 0 && (
          <div className="flex items-center gap-2 text-xs">
            {pain.critical > 0 && <span className="text-red-400">{pain.critical} critical</span>}
            {pain.high > 0 && <span className="text-orange-400">{pain.high} high</span>}
            {pain.medium > 0 && <span className="text-yellow-400">{pain.medium} medium</span>}
            {pain.low > 0 && <span className="text-blue-400">{pain.low} low</span>}
          </div>
        )}
      </div>
    );
  };

  const getImportanceColor = (importance: string | null) => {
    switch (importance) {
      case 'critical':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-blue-400';
      default:
        return 'text-zinc-500';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Workflow className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">no workflows linked to this persona</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity: any) => {
        const pain = calculateActivityPain(activity);

        return (
          <div key={activity.id} className="bg-[#0a0a0a] border border-zinc-700 p-4">
            {/* Activity Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-zinc-200 mb-1">{activity.name}</h3>
                {activity.overview && (
                  <p className="text-xs text-zinc-500 mb-2">{activity.overview}</p>
                )}
                <div className="flex items-center gap-4 text-xs">
                  {activity.frequency && (
                    <span className="text-zinc-500">
                      frequency: <span className="text-zinc-400">{activity.frequency}</span>
                    </span>
                  )}
                  {activity.importance && (
                    <span className="text-zinc-500">
                      importance:{' '}
                      <span className={getImportanceColor(activity.importance)}>
                        {activity.importance}
                      </span>
                    </span>
                  )}
                </div>
              </div>
              {pain.total > 0 && (
                <div className="ml-4">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
              )}
            </div>

            {/* Friction Bar */}
            <FrictionBar pain={pain} />

            {/* Tasks */}
            {activity.tasks && activity.tasks.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-zinc-500 mb-2">{activity.tasks.length} tasks</p>
                {activity.tasks.map((task: any) => (
                  <div key={task.id} className="pl-3 border-l border-zinc-700">
                    <p className="text-xs text-zinc-400">{task.name}</p>
                    {task.goal && (
                      <p className="text-xs text-zinc-600 mt-0.5">→ {task.goal}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Summary */}
      <div className="bg-zinc-900 border border-zinc-700 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">total workflows</span>
          <span className="text-lg font-medium text-zinc-200">{activities.length}</span>
        </div>
      </div>
    </div>
  );
};
