import React, { useEffect } from 'react';
import { Workflow } from 'lucide-react';
import { Activity } from '../Activity';
import { AddItemForm } from '../AddItemForm';
import { useStore } from '../../store/useStore';
import { useInsightStore } from '../../store/insightStore';
import { usePersonaStore } from '../../store/personaStore';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface PersonaWorkflowsProps {
  persona: any;
}

export const PersonaWorkflows: React.FC<PersonaWorkflowsProps> = ({ persona }) => {
  const {
    projects,
    reorderActivities,
    reorderTasks,
    reorderOperations,
    addActivity,
    expandAllActivities,
    collapseAllActivities,
  } = useStore();
  const { insights, fetchInsights } = useInsightStore();
  const { linkToActivity } = usePersonaStore();

  const currentProject = projects.find(p => p.id === persona.projectId);

  useEffect(() => {
    if (persona.projectId) {
      fetchInsights(persona.projectId);
    }
  }, [persona.projectId, fetchInsights]);

  // Filter activities to only show ones linked to this persona
  const personaActivities = currentProject?.activities.filter(activity =>
    activity.personaIds?.includes(persona.id)
  ) || [];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const element = document.querySelector(`[data-id="${active.id}"]`);
    if (element) {
      element.classList.add('dragging');
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());

    if (active.id !== over.id) {
      const overElement = document.querySelector(`[data-id="${over.id}"]`);
      if (overElement) {
        const indicator = document.createElement('div');
        indicator.className = 'drop-indicator h-1 bg-blue-400 rounded-full my-2 transform transition-all duration-200 scale-x-0';
        overElement.parentNode?.insertBefore(indicator, overElement);
        requestAnimationFrame(() => {
          indicator.classList.add('scale-x-100');
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());

    if (!over || !currentProject) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activity = currentProject.activities.find(a =>
      a.id === activeId ||
      a.tasks.some(t => t.id === activeId || t.operations.some(o => o.id === activeId))
    );

    if (!activity) return;

    const findIndices = (items: any[], activeId: string, overId: string) => {
      const oldIndex = items.findIndex(item => item.id === activeId);
      const newIndex = items.findIndex(item => item.id === overId);
      return { oldIndex, newIndex };
    };

    if (currentProject.activities.some(a => a.id === activeId)) {
      const { oldIndex, newIndex } = findIndices(currentProject.activities, activeId as string, overId as string);
      reorderActivities(currentProject.id, oldIndex, newIndex);
      return;
    }

    const task = activity.tasks.find(t => t.id === activeId);
    if (task) {
      const { oldIndex, newIndex } = findIndices(activity.tasks, activeId as string, overId as string);
      reorderTasks(currentProject.id, activity.id, oldIndex, newIndex);
      return;
    }

    const taskWithOperation = activity.tasks.find(t =>
      t.operations.some(o => o.id === activeId)
    );
    if (taskWithOperation) {
      const { oldIndex, newIndex } = findIndices(
        taskWithOperation.operations,
        activeId as string,
        overId as string
      );
      reorderOperations(currentProject.id, activity.id, taskWithOperation.id, oldIndex, newIndex);
    }
  };

  const handleAddActivity = async (name: string) => {
    if (currentProject) {
      // Create activity and get the returned ID
      const newActivityId = await addActivity(currentProject.id, name);
      // Link the new activity to this persona
      await linkToActivity(persona.id, newActivityId);
    }
  };

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <Workflow className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#0a0a0a] border border-zinc-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-1">task analysis</h3>
            <p className="text-xs text-zinc-500">
              {persona.name}'s activities broken down into tasks and operations
            </p>
          </div>
          {personaActivities.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={expandAllActivities}
                className="text-zinc-500 hover:text-zinc-400 transition-colors"
                title="Expand all activities"
              >
                expand all
              </button>
              <span className="text-zinc-600">/</span>
              <button
                onClick={collapseAllActivities}
                className="text-zinc-500 hover:text-zinc-400 transition-colors"
                title="Collapse all activities"
              >
                collapse all
              </button>
            </div>
          )}
        </div>

        <AddItemForm
          level="activity"
          onSubmit={handleAddActivity}
          onClose={() => {}}
        />
      </div>

      {personaActivities.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-zinc-700 p-12 text-center">
          <Workflow className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-400 mb-2">no workflows yet</p>
          <p className="text-xs text-zinc-600">
            Create an activity above to start mapping {persona.name}'s workflow
          </p>
        </div>
      ) : (
        <div className="bg-[#0a0a0a] border border-zinc-700 p-5">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={personaActivities.map(a => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div>
                {personaActivities.map((activity, index) => (
                  <Activity
                    key={activity.id}
                    activity={activity}
                    projectId={currentProject.id}
                    index={index}
                    isLastActivity={index === personaActivities.length - 1}
                    insights={insights}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Summary Stats */}
      {personaActivities.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-700 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-medium text-zinc-200">{personaActivities.length}</div>
              <div className="text-xs text-zinc-500">activities</div>
            </div>
            <div>
              <div className="text-lg font-medium text-zinc-200">
                {personaActivities.reduce((acc, a) => acc + a.tasks.length, 0)}
              </div>
              <div className="text-xs text-zinc-500">tasks</div>
            </div>
            <div>
              <div className="text-lg font-medium text-zinc-200">
                {personaActivities.reduce(
                  (acc, a) => acc + a.tasks.reduce((tAcc, t) => tAcc + t.operations.length, 0),
                  0
                )}
              </div>
              <div className="text-xs text-zinc-500">operations</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
