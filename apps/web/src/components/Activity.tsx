import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Plus, Trash, GripVertical, FileText } from 'lucide-react';
import { Activity as ActivityType } from '../types';
import { Task } from './Task';
import { useStore } from '../store/useStore';
import { AddItemForm } from './AddItemForm';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EditableText } from './EditableText';

interface ActivityProps {
  activity: ActivityType;
  projectId: string;
  index: number;
  isLastActivity: boolean;
}

export const Activity: React.FC<ActivityProps> = ({ activity, projectId, index, isLastActivity }) => {
  const { toggleExpanded, focusedItem, setFocusedItem, deleteItem, editActivity, editActivityOverview, addTask } = useStore();
  const isFocused = focusedItem?.id === activity.id && focusedItem?.level === 'activity';
  const [showAddTask, setShowAddTask] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey) {
      switch (e.key.toLowerCase()) {
        case 't':
          e.preventDefault();
          setShowAddTask(true);
          break;
        case 'e':
          e.preventDefault();
          toggleExpanded(activity.id, 'activity');
          break;
        case 'd':
          e.preventDefault();
          if (isFocused) {
            deleteItem({ id: activity.id, level: 'activity' });
          }
          break;
      }
    }
  };

  const handleAddTask = (name: string) => {
    addTask(projectId, activity.id, name);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isLastActivity ? undefined : 'mb-6'}
      data-id={activity.id}
    >
      <div
        className={`bg-[#0a0a0a] border border-zinc-700 overflow-hidden flex ${
          isFocused ? 'ring-1 ring-purple-500/40' : ''
        }`}
      >
        <div className="w-1 bg-gradient-to-b from-purple-500 to-purple-700 flex-shrink-0" />
        <div className="flex-grow">
          <div
            className={`p-3 cursor-pointer transition-colors ${
              isFocused ? 'bg-purple-950/30' : 'hover:bg-zinc-900'
            }`}
            onClick={() => setFocusedItem({ id: activity.id, level: 'activity' })}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <div className="flex items-start">
              <div className="flex items-center mt-1">
                <button
                  {...attributes}
                  {...listeners}
                  className="p-1 hover:bg-zinc-800 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <GripVertical className="w-4 h-4 text-zinc-500" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(activity.id, 'activity');
                  }}
                  className="p-1 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {activity.expanded ? (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  )}
                </button>
              </div>
              <div className="flex-1 ml-2">
                <EditableText
                  value={activity.name}
                  onSave={(name) => editActivity(projectId, activity.id, name)}
                  className="font-medium text-lg text-zinc-200"
                />
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    activity
                  </span>
                  {(activity.tasks.length > 0 || activity.tasks.reduce((acc, t) => acc + t.operations.length, 0) > 0) && (
                    <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                      <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {activity.tasks.length} {activity.tasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                      <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {activity.tasks.reduce((acc, t) => acc + t.operations.length, 0)} {activity.tasks.reduce((acc, t) => acc + t.operations.length, 0) === 1 ? 'op' : 'ops'}
                      </span>
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddTask(true);
                }}
                className="flex items-center px-2 py-1 text-xs border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 mr-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                title="Alt+T"
              >
                <Plus className="w-3 h-3 mr-1" />
                add task
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteItem({ id: activity.id, level: 'activity' });
                }}
                className="w-[26px] h-[26px] flex items-center justify-center text-xs border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                title="Delete (Alt+D)"
              >
                <Trash className="w-3 h-3" />
              </button>
            </div>
            <div className="flex mt-2 ml-12">
              <FileText className="w-4 h-4 text-zinc-500 mr-2 mt-1 flex-shrink-0" />
              <EditableText
                value={activity.overview}
                onSave={(overview) => editActivityOverview(projectId, activity.id, overview)}
                className="flex-1 text-sm text-zinc-400 italic"
                placeholder="add overview..."
              />
            </div>
          </div>
          {activity.expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border-t border-zinc-700 bg-zinc-900/50 p-3"
            >
              {showAddTask && (
                <AddItemForm
                  level="task"
                  onSubmit={handleAddTask}
                  onClose={() => setShowAddTask(false)}
                />
              )}
              <div className="space-y-3">
                {activity.tasks.map((task, taskIndex) => (
                  <Task
                    key={task.id}
                    task={task}
                    activityId={activity.id}
                    projectId={projectId}
                    index={taskIndex}
                  />
                ))}
              </div>
              {activity.tasks.length === 0 && !showAddTask && isFocused && (
                <div className="text-center text-zinc-500 py-4 text-sm">
                  press alt+t to add task
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};