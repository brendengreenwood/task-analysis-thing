import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import { Activity } from '../components/Activity';
import { AddItemForm } from '../components/AddItemForm';
import { useStore } from '../store/useStore';
import { useInsightStore } from '../store/insightStore';
import { EditableText } from '../components/EditableText';
import { ExportButton } from '../components/export/ExportButton';
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

export const TaskAnalysisPage: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    setCurrentProject,
    reorderActivities,
    reorderTasks,
    reorderOperations,
    addActivity,
    editProject,
    expandAllActivities,
    collapseAllActivities,
    expandAllTasks,
    collapseAllTasks
  } = useStore();
  const { insights, fetchInsights } = useInsightStore();
  const currentProject = projects.find(p => p.id === projectId);

  useEffect(() => {
    if (!currentProject) {
      navigate('/');
      return;
    }
    setCurrentProject(projectId!);
  }, [projectId, currentProject, navigate, setCurrentProject]);

  useEffect(() => {
    if (projectId) {
      fetchInsights(projectId);
    }
  }, [projectId, fetchInsights]);

  const handleAddActivity = (name: string) => {
    if (currentProject) {
      addActivity(currentProject.id, name);
    }
  };

  const handleEditProject = (name: string) => {
    if (currentProject) {
      editProject(currentProject.id, name, currentProject.description);
    }
  };

  const handleEditDescription = (description: string) => {
    if (currentProject) {
      editProject(currentProject.id, currentProject.name, description);
    }
  };

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

  if (!currentProject) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5 border-b border-zinc-700 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <EditableText
              value={currentProject.name}
              onSave={handleEditProject}
              className="text-base font-medium text-zinc-200 hover:bg-zinc-900 px-2 py-1 -ml-2"
            />
            <EditableText
              value={currentProject.description}
              onSave={handleEditDescription}
              className="text-zinc-500 text-sm hover:bg-zinc-900 px-2 py-1 -ml-2 block"
              placeholder="description"
            />
          </div>
          <ExportButton projectId={currentProject.id} projectName={currentProject.name} />
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-zinc-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <AddItemForm
            level="activity"
            onSubmit={handleAddActivity}
            onClose={() => {}}
          />
          {currentProject.activities.length > 0 && (
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
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={currentProject.activities.map(a => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <div>
              {currentProject.activities.map((activity, index) => (
                <Activity
                  key={activity.id}
                  activity={activity}
                  projectId={currentProject.id}
                  index={index}
                  isLastActivity={index === currentProject.activities.length - 1}
                  insights={insights}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        
        {currentProject.activities.length === 0 && (
          <div className="text-center text-zinc-600 py-8 text-sm">
            no activities — press alt+a to add
          </div>
        )}
      </div>
    </div>
  );
};