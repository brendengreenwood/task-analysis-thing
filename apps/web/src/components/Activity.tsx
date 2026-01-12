import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Plus, Trash, GripVertical, FileText, User, UserPlus, Lightbulb } from 'lucide-react';
import { Activity as ActivityType } from '../types';
import { Task } from './Task';
import { useStore } from '../store/useStore';
import { usePersonaStore } from '../store/personaStore';
import { Insight, useInsightStore } from '../store/insightStore';
import { AddItemForm } from './AddItemForm';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EditableText } from './EditableText';
import { InsightEditor } from './insights/InsightEditor';

interface ActivityProps {
  activity: ActivityType;
  projectId: string;
  index: number;
  isLastActivity: boolean;
  insights: Insight[];
}

export const Activity: React.FC<ActivityProps> = ({ activity, projectId, index, isLastActivity, insights }) => {
  const { toggleExpanded, focusedItem, setFocusedItem, deleteItem, editActivity, editActivityOverview, addTask, loadProject } = useStore();
  const { personas, fetchPersonas, linkToActivity, unlinkFromActivity } = usePersonaStore();
  const { createInsight, fetchInsights } = useInsightStore();
  const isFocused = focusedItem?.id === activity.id && focusedItem?.level === 'activity';
  const [showAddTask, setShowAddTask] = useState(false);
  const [showPersonaDropdown, setShowPersonaDropdown] = useState(false);
  const [showInsightEditor, setShowInsightEditor] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch personas on mount
  useEffect(() => {
    if (projectId) {
      fetchPersonas(projectId);
    }
  }, [projectId, fetchPersonas]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPersonaDropdown(false);
      }
    };

    if (showPersonaDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPersonaDropdown]);

  // Compute operation count once
  const operationCount = activity.tasks.reduce((acc, t) => acc + t.operations.length, 0);

  // Get linked personas for this activity
  const linkedPersonas = personas.filter(p =>
    activity.personaIds?.includes(p.id)
  );

  // Count insights linked to this activity
  const activityInsightCount = insights.filter(
    (i) => i.linkedEntityType === 'activity' && i.linkedEntityId === activity.id
  ).length;

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

  const handleTogglePersona = async (personaId: string) => {
    const isLinked = linkedPersonas.some(p => p.id === personaId);
    if (isLinked) {
      await unlinkFromActivity(personaId, activity.id);
    } else {
      await linkToActivity(personaId, activity.id);
    }
    // Reload project data to update personaIds
    await loadProject(projectId);
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
                <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    activity
                  </span>
                  {(activity.tasks.length > 0 || operationCount > 0) && (
                    <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                      <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {activity.tasks.length} {activity.tasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                      <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {operationCount} {operationCount === 1 ? 'op' : 'ops'}
                      </span>
                    </span>
                  )}
                  {activityInsightCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs">
                      <Lightbulb className="w-3 h-3" />
                      {activityInsightCount}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowInsightEditor(true);
                    }}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs hover:bg-yellow-500/20 transition-colors"
                    title="Add insight for this activity"
                  >
                    <Plus className="w-3 h-3" />
                    insight
                  </button>
                  {linkedPersonas.length > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      {linkedPersonas.map(persona => (
                        <span
                          key={persona.id}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs"
                          title={persona.role || persona.name}
                        >
                          <User className="w-3 h-3" />
                          {persona.name}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              </div>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPersonaDropdown(!showPersonaDropdown);
                  }}
                  className="flex items-center px-2 py-1 text-xs border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  title="Link personas"
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  personas
                </button>
                {showPersonaDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-[#0a0a0a] border border-zinc-700 shadow-lg z-50 max-h-80 overflow-y-auto">
                    <div className="p-2">
                      {personas.length === 0 ? (
                        <p className="text-xs text-zinc-500 p-2">no personas available</p>
                      ) : (
                        <div className="space-y-1">
                          {personas.map((persona) => {
                            const isLinked = linkedPersonas.some(p => p.id === persona.id);
                            return (
                              <label
                                key={persona.id}
                                className="flex items-start gap-2 p-2 hover:bg-zinc-900 cursor-pointer text-xs"
                              >
                                <input
                                  type="checkbox"
                                  checked={isLinked}
                                  onChange={() => handleTogglePersona(persona.id)}
                                  className="mt-0.5 accent-blue-500"
                                />
                                <div className="flex-1">
                                  <div className="text-zinc-200 font-medium">{persona.name}</div>
                                  {persona.role && (
                                    <div className="text-zinc-500 text-xs">{persona.role}</div>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                    insights={insights}
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
      {showInsightEditor && (
        <InsightEditor
          projectId={projectId}
          prefilledEntity={{ type: 'activity', id: activity.id }}
          onSave={handleCreateInsight}
          onClose={() => setShowInsightEditor(false)}
        />
      )}
    </div>
  );
};