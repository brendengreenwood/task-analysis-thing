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
        className={`bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden flex ${
          isFocused ? 'ring-2 ring-blue-400' : ''
        }`}
      >
        <div className="w-1 bg-blue-500 flex-shrink-0" />
        <div className="flex-grow">
          <div
            className={`p-3 cursor-pointer hover:bg-gray-50`}
            onClick={() => setFocusedItem({ id: activity.id, level: 'activity' })}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <div className="flex items-start">
              <div className="flex items-center mt-1">
                <button
                  {...attributes}
                  {...listeners}
                  className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <GripVertical className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(activity.id, 'activity');
                  }}
                  className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {activity.expanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex-1 ml-2">
                <EditableText
                  value={activity.name}
                  onSave={(name) => editActivity(projectId, activity.id, name)}
                  className="font-medium text-lg"
                />
                <div className="mt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Activity
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddTask(true);
                }}
                className="flex items-center px-2 py-1 text-xs border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors"
                title="Alt+T"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Task
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteItem({ id: activity.id, level: 'activity' });
                }}
                className="w-[26px] h-[26px] flex items-center justify-center text-xs border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-colors"
                title="Delete (Alt+D)"
              >
                <Trash className="w-3 h-3" />
              </button>
            </div>
            <div className="flex mt-2 ml-12">
              <FileText className="w-4 h-4 text-gray-500 mr-2 mt-1 flex-shrink-0" />
              <EditableText
                value={activity.overview}
                onSave={(overview) => editActivityOverview(projectId, activity.id, overview)}
                className="flex-1 text-sm text-gray-600 italic"
                placeholder="Add an overview..."
              />
            </div>
          </div>
          {activity.expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border-t border-gray-100 bg-gray-50 p-3"
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
                <div className="text-center text-gray-500 py-4">
                  Press Alt+T to add your first task
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};