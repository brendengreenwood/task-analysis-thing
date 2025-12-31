import React from 'react';
import { Trash, GripVertical, AlignLeft } from 'lucide-react';
import { Operation as OperationType } from '../types';
import { useStore } from '../store/useStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EditableText } from './EditableText';

interface OperationProps {
  operation: OperationType;
  taskId: string;
  activityId: string;
  projectId: string;
  index: number;
}

export const Operation: React.FC<OperationProps> = ({
  operation,
  taskId,
  activityId,
  projectId,
  index
}) => {
  const { focusedItem, setFocusedItem, deleteItem, editOperation, editOperationDetail } = useStore();
  const isFocused =
    focusedItem?.id === operation.id && focusedItem?.level === 'operation';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: operation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey) {
      switch (e.key.toLowerCase()) {
        case 'd':
          e.preventDefault();
          if (isFocused) {
            deleteItem({
              id: operation.id,
              level: 'operation',
              parentId: taskId,
            });
          }
          break;
      }
    }
  };

  return (
    <div ref={setNodeRef} style={style} data-id={operation.id}>
      <div
        className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex ${
          isFocused ? 'ring-2 ring-amber-400' : ''
        }`}
      >
        <div className="w-1 bg-amber-500 flex-shrink-0" />
        <div className="flex-grow">
          <div
            className={`p-3 cursor-pointer hover:bg-gray-50`}
            onClick={() => setFocusedItem({ id: operation.id, level: 'operation' })}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <div className="flex items-start">
              <button
                {...attributes}
                {...listeners}
                className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <GripVertical className="w-4 h-4 text-gray-500" />
              </button>
              <div className="flex-1 ml-2">
                <EditableText
                  value={operation.name}
                  onSave={(name) => editOperation(projectId, activityId, taskId, operation.id, name)}
                />
                <div className="mt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                    Operation
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteItem({
                    id: operation.id,
                    level: 'operation',
                    parentId: taskId,
                  });
                }}
                className="w-[26px] h-[26px] flex items-center justify-center text-xs border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-colors"
                title="Delete (Alt+D)"
              >
                <Trash className="w-3 h-3" />
              </button>
            </div>
            <div className="flex mt-2 ml-12">
              <AlignLeft className="w-4 h-4 text-gray-500 mr-2 mt-1 flex-shrink-0" />
              <EditableText
                value={operation.detail}
                onSave={(detail) => editOperationDetail(projectId, activityId, taskId, operation.id, detail)}
                className="flex-1 text-sm text-gray-600 italic"
                placeholder="Add details..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};