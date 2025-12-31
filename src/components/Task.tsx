import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Plus, Trash, GripVertical, Target } from 'lucide-react';
import { Task as TaskType } from '../types';
import { Operation } from './Operation';
import { useStore } from '../store/useStore';
import { AddItemForm } from './AddItemForm';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EditableText } from './EditableText';

interface TaskProps {
  task: TaskType;
  activityId: string;
  projectId: string;
  index: number;
}

export const Task: React.FC<TaskProps> = ({ task, activityId, projectId, index }) => {
  const { toggleExpanded, focusedItem, setFocusedItem, deleteItem, editTask, editTaskGoal, addOperation } = useStore();
  const isFocused = focusedItem?.id === task.id && focusedItem?.level === 'task';
  const [showAddOperation, setShowAddOperation] = useState(false);

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

  return (
    <div ref={setNodeRef} style={style} data-id={task.id}>
      <div
        className={`bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden flex ${
          isFocused ? 'ring-2 ring-green-400' : ''
        }`}
      >
        <div className="w-1 bg-green-500 flex-shrink-0" />
        <div className="flex-grow">
          <div
            className={`p-3 cursor-pointer hover:bg-gray-50`}
            onClick={() => setFocusedItem({ id: task.id, level: 'task' })}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <div className="flex items-start">
              <div className="flex items-center mt-1">
                <button
                  {...attributes}
                  {...listeners}
                  className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <GripVertical className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(task.id, 'task');
                  }}
                  className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  {task.expanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex-1 ml-2">
                <EditableText
                  value={task.name}
                  onSave={(name) => editTask(projectId, activityId, task.id, name)}
                  className="font-medium"
                />
                <div className="mt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Task
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddOperation(true);
                }}
                className="flex items-center px-2 py-1 text-xs border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-colors"
                title="Alt+O"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Operation
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteItem({ id: task.id, level: 'task' });
                }}
                className="w-[26px] h-[26px] flex items-center justify-center text-xs border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-colors"
                title="Delete (Alt+D)"
              >
                <Trash className="w-3 h-3" />
              </button>
            </div>
            <div className="flex mt-2 ml-12">
              <Target className="w-4 h-4 text-gray-500 mr-2 mt-1 flex-shrink-0" />
              <EditableText
                value={task.goal}
                onSave={(goal) => editTaskGoal(projectId, activityId, task.id, goal)}
                className="flex-1 text-sm text-gray-600 italic"
                placeholder="Add a goal..."
              />
            </div>
          </div>
          {task.expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border-t border-gray-100 bg-gray-50 p-3"
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
                  />
                ))}
              </div>
              {task.operations.length === 0 && !showAddOperation && isFocused && (
                <div className="text-center text-gray-500 py-4">
                  Press Alt+O to add your first operation
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};