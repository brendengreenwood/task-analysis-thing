import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Plus, Trash, GripVertical, Target, Lightbulb } from 'lucide-react';
import { Task as TaskType } from '../types';
import { Operation } from './Operation';
import { useStore } from '../store/useStore';
import { Insight, useInsightStore } from '../store/insightStore';
import { AddItemForm } from './AddItemForm';
import { InsightEditor } from './insights/InsightEditor';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EditableText } from './EditableText';

interface TaskProps {
  task: TaskType;
  activityId: string;
  projectId: string;
  index: number;
  insights: Insight[];
}

export const Task: React.FC<TaskProps> = ({ task, activityId, projectId, index, insights }) => {
  const { toggleExpanded, focusedItem, setFocusedItem, deleteItem, editTask, editTaskGoal, addOperation } = useStore();
  const { createInsight, fetchInsights } = useInsightStore();
  const isFocused = focusedItem?.id === task.id && focusedItem?.level === 'task';
  const [showAddOperation, setShowAddOperation] = useState(false);
  const [showInsightEditor, setShowInsightEditor] = useState(false);

  // Count insights linked to this task
  const taskInsightCount = insights.filter(
    (i) => i.linkedEntityType === 'task' && i.linkedEntityId === task.id
  ).length;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey) {
      switch (e.key.toLowerCase()) {
        case 'o':
          e.preventDefault();
          setShowAddOperation(true);
          break;
        case 'e':
          e.preventDefault();
          toggleExpanded(task.id, 'task');
          break;
        case 'd':
          e.preventDefault();
          if (isFocused) {
            deleteItem({ id: task.id, level: 'task' });
          }
          break;
      }
    }
  };

  const handleAddOperation = (name: string) => {
    addOperation(projectId, activityId, task.id, name);
  };

  const handleCreateInsight = async (data: any) => {
    try {
      await createInsight(projectId, data);
      await fetchInsights(projectId);
      setShowInsightEditor(false);
    } catch (error) {
      console.error('Failed to create insight:', error);
    }
  };

  return (
    <div ref={setNodeRef} style={style} data-id={task.id}>
      <div
        className={`bg-[#0a0a0a] border border-zinc-700 overflow-hidden flex ${
          isFocused ? 'ring-1 ring-emerald-500/40' : ''
        }`}
      >
        <div className="w-1 bg-gradient-to-b from-emerald-500 to-teal-600 flex-shrink-0" />
        <div className="flex-grow">
          <div
            className={`p-3 cursor-pointer transition-colors ${
              isFocused ? 'bg-emerald-950/30' : 'hover:bg-zinc-900'
            }`}
            onClick={() => setFocusedItem({ id: task.id, level: 'task' })}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <div className="flex items-start">
              <div className="flex items-center mt-1">
                <button
                  {...attributes}
                  {...listeners}
                  className="p-1 hover:bg-zinc-800 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <GripVertical className="w-4 h-4 text-zinc-500" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(task.id, 'task');
                  }}
                  className="p-1 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {task.expanded ? (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  )}
                </button>
              </div>
              <div className="flex-1 ml-2">
                <EditableText
                  value={task.name}
                  onSave={(name) => editTask(projectId, activityId, task.id, name)}
                  className="font-medium text-zinc-200"
                />
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    task
                  </span>
                  {task.operations.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">
                      {task.operations.length} {task.operations.length === 1 ? 'op' : 'ops'}
                    </span>
                  )}
                  {taskInsightCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs">
                      <Lightbulb className="w-3 h-3" />
                      {taskInsightCount}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowInsightEditor(true);
                    }}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs hover:bg-yellow-500/20 transition-colors"
                    title="Add insight for this task"
                  >
                    <Plus className="w-3 h-3" />
                    insight
                  </button>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddOperation(true);
                }}
                className="flex items-center px-2 py-1 text-xs border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 mr-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                title="Alt+O"
              >
                <Plus className="w-3 h-3 mr-1" />
                add operation
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteItem({ id: task.id, level: 'task' });
                }}
                className="w-[26px] h-[26px] flex items-center justify-center text-xs border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                title="Delete (Alt+D)"
              >
                <Trash className="w-3 h-3" />
              </button>
            </div>
            <div className="flex mt-2 ml-12">
              <Target className="w-4 h-4 text-zinc-500 mr-2 mt-1 flex-shrink-0" />
              <EditableText
                value={task.goal}
                onSave={(goal) => editTaskGoal(projectId, activityId, task.id, goal)}
                className="flex-1 text-sm text-zinc-400 italic"
                placeholder="add goal..."
              />
            </div>
          </div>
          {task.expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border-t border-zinc-700 bg-zinc-900/50 p-3"
            >
              {showAddOperation && (
                <AddItemForm
                  level="operation"
                  onSubmit={handleAddOperation}
                  onClose={() => setShowAddOperation(false)}
                />
              )}
              <div className="space-y-3">
                {task.operations.map((operation, operationIndex) => (
                  <Operation
                    key={operation.id}
                    operation={operation}
                    taskId={task.id}
                    activityId={activityId}
                    projectId={projectId}
                    index={operationIndex}
                    insights={insights}
                  />
                ))}
              </div>
              {task.operations.length === 0 && !showAddOperation && isFocused && (
                <div className="text-center text-zinc-500 py-4 text-sm">
                  press alt+o to add operation
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
      {showInsightEditor && (
        <InsightEditor
          projectId={projectId}
          prefilledEntity={{ type: 'task', id: task.id }}
          onSave={handleCreateInsight}
          onClose={() => setShowInsightEditor(false)}
        />
      )}
    </div>
  );
};