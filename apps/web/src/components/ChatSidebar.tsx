import React, { useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { MessageSquare, Send, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAgentActions } from '../hooks/useAgentActions';

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onToggle }) => {
  const { dispatchAction, getProjectContext, getCurrentProject } = useAgentActions();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentProject = getCurrentProject();

  const { messages, input, handleInputChange, isLoading, error, append, setInput } = useChat({
    api: '/chat/task-analysis-agent',
    onFinish: (message) => {
      // Process tool invocations after the message is complete
      if (message.toolInvocations) {
        for (const toolInvocation of message.toolInvocations) {
          if (toolInvocation.state === 'result' && toolInvocation.result) {
            try {
              const actionData = toolInvocation.result as {
                action: string;
                payload?: unknown;
                context?: unknown;
              };
              dispatchAction(actionData as Parameters<typeof dispatchAction>[0]);
            } catch (e) {
              console.error('Error dispatching action:', e);
            }
          }
        }
      }
    },
  });

  // Build context string to prepend to messages
  const buildContextString = () => {
    const context = getProjectContext();
    if (!context) return '';

    let contextStr = `\n\n[Current Project Context]\nProject: ${context.projectName} (ID: ${context.projectId})\n`;

    if (context.activities.length === 0) {
      contextStr += 'Activities: None yet\n';
    } else {
      contextStr += 'Activities:\n';
      for (const activity of context.activities) {
        contextStr += `- ${activity.name} (ID: ${activity.id})${activity.overview ? `: ${activity.overview}` : ''}\n`;
        for (const task of activity.tasks) {
          contextStr += `  - Task: ${task.name} (ID: ${task.id})${task.goal ? `: ${task.goal}` : ''}\n`;
          for (const op of task.operations) {
            contextStr += `    - Op: ${op.name} (ID: ${op.id})${op.detail ? `: ${op.detail}` : ''}\n`;
          }
        }
      }
    }
    return contextStr;
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Include project context with the user message
    const contextStr = buildContextString();
    const messageWithContext = input.trim() + contextStr;

    // Clear input and send message with context
    setInput('');

    await append({
      role: 'user',
      content: messageWithContext,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 bottom-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Open AI Assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="w-80 bg-white shadow-lg flex flex-col border-l border-gray-200">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">AI Assistant</h2>
        </div>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-200 rounded-md transition-colors"
          title="Close chat"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Project context indicator */}
      {currentProject ? (
        <div className="px-4 py-2 bg-blue-50 border-b text-sm">
          <span className="text-gray-600">Working on: </span>
          <span className="font-medium text-blue-700">{currentProject.name}</span>
        </div>
      ) : (
        <div className="px-4 py-2 bg-yellow-50 border-b text-sm text-yellow-700">
          Select a project to start
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">
              Describe your activities, tasks, or operations and I'll help you organize them.
            </p>
            <div className="mt-4 text-xs text-gray-400">
              <p className="mb-2">Try saying:</p>
              <p className="italic">"I'm working on user authentication"</p>
              <p className="italic">"Add a task to implement the login form"</p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>

              {/* Show tool invocations */}
              {message.toolInvocations && message.toolInvocations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                  {message.toolInvocations.map((tool, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="text-green-600">+</span>
                      <span>
                        {tool.toolName === 'add-activity' && 'Added activity'}
                        {tool.toolName === 'add-task' && 'Added task'}
                        {tool.toolName === 'add-operation' && 'Added operation'}
                        {tool.toolName === 'edit-activity' && 'Updated activity'}
                        {tool.toolName === 'edit-task' && 'Updated task'}
                        {tool.toolName === 'edit-operation' && 'Updated operation'}
                        {tool.toolName === 'delete-activity' && 'Deleted activity'}
                        {tool.toolName === 'delete-task' && 'Deleted task'}
                        {tool.toolName === 'delete-operation' && 'Deleted operation'}
                        {tool.toolName === 'bulk-add' && 'Added multiple items'}
                        {tool.toolName === 'get-project-context' && 'Reviewed project'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-3 py-2 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm text-gray-500">Thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2">
            Error: {error.message}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={currentProject ? 'Describe your work...' : 'Select a project first'}
            disabled={!currentProject || isLoading}
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!currentProject || !input.trim() || isLoading}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Press Enter to send, Shift+Enter for new line</p>
      </form>
    </div>
  );
};
