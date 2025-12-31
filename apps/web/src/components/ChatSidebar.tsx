import React, { useEffect, useRef, useState } from 'react';
import { MastraClient } from '@mastra/client-js';
import { MessageSquare, Send, X, Loader2 } from 'lucide-react';
import { useAgentActions } from '../hooks/useAgentActions';

interface ToolCall {
  toolName: string;
  status: 'pending' | 'complete';
  result?: unknown;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const client = new MastraClient({
  baseUrl: 'http://localhost:4111',
});

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onToggle }) => {
  const { dispatchAction, getProjectContext, getCurrentProject } = useAgentActions();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentProject = getCurrentProject();

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

    const userMessage = input.trim();
    const contextStr = buildContextString();
    const messageWithContext = userMessage + contextStr;

    // Add user message to UI (show without context)
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const agent = client.getAgent('task-analysis-agent');
      const response = await agent.stream({
        messages: [
          ...messages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          { role: 'user' as const, content: messageWithContext },
        ],
      });

      let assistantContent = '';
      const toolCalls: ToolCall[] = [];
      const assistantMsgId = (Date.now() + 1).toString();

      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '', toolCalls: [] }]);

      await response.processDataStream({
        onChunk: async (chunk: { type: string; payload?: unknown }) => {
          console.log('[STREAM] chunk:', chunk.type, chunk.payload);

          if (chunk.type === 'text-delta') {
            const payload = chunk.payload as { text: string };
            assistantContent += payload.text;
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMsgId ? { ...m, content: assistantContent } : m
              )
            );
          } else if (chunk.type === 'tool-call') {
            // Tool call started - show pending state
            const payload = chunk.payload as { toolName: string };
            toolCalls.push({ toolName: payload.toolName, status: 'pending' });
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMsgId ? { ...m, toolCalls: [...toolCalls] } : m
              )
            );
          } else if (chunk.type === 'tool-result') {
            // Tool call completed - update to complete state
            const payload = chunk.payload as { toolName: string; result: unknown };
            const existingIdx = toolCalls.findIndex(
              t => t.toolName === payload.toolName && t.status === 'pending'
            );
            if (existingIdx >= 0) {
              toolCalls[existingIdx] = { toolName: payload.toolName, status: 'complete', result: payload.result };
            } else {
              toolCalls.push({ toolName: payload.toolName, status: 'complete', result: payload.result });
            }
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMsgId ? { ...m, toolCalls: [...toolCalls] } : m
              )
            );

            // Dispatch the action to update the store
            try {
              const actionData = payload.result as {
                action: string;
                payload?: unknown;
              };
              if (actionData?.action) {
                dispatchAction(actionData as Parameters<typeof dispatchAction>[0]);
              }
            } catch (e) {
              console.error('Error dispatching action:', e);
            }
          }
        },
      });
    } catch (err) {
      console.error('Stream error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get response');
    } finally {
      setIsLoading(false);
    }
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
    <div className="w-80 h-screen sticky top-0 bg-white shadow-lg flex flex-col border-l border-gray-200">
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

              {/* Show tool calls */}
              {message.toolCalls && message.toolCalls.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                  {message.toolCalls.map((tool, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      {tool.status === 'pending' ? (
                        <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                      ) : (
                        <span className="text-green-600">✓</span>
                      )}
                      <span className={tool.status === 'pending' ? 'text-blue-600' : ''}>
                        {(() => {
                          const labels: Record<string, [string, string]> = {
                            'add-activity': ['Adding activity...', 'Added activity'],
                            'add-task': ['Adding task...', 'Added task'],
                            'add-operation': ['Adding operation...', 'Added operation'],
                            'edit-activity': ['Updating activity...', 'Updated activity'],
                            'edit-task': ['Updating task...', 'Updated task'],
                            'edit-operation': ['Updating operation...', 'Updated operation'],
                            'delete-activity': ['Deleting activity...', 'Deleted activity'],
                            'delete-task': ['Deleting task...', 'Deleted task'],
                            'delete-operation': ['Deleting operation...', 'Deleted operation'],
                            'bulk-add': ['Adding items...', 'Added multiple items'],
                            'get-project-context': ['Reviewing project...', 'Reviewed project'],
                          };
                          const label = labels[tool.toolName];
                          if (label) {
                            return tool.status === 'pending' ? label[0] : label[1];
                          }
                          // Fallback: show raw tool name
                          return tool.status === 'pending' ? `Calling ${tool.toolName}...` : `Called ${tool.toolName}`;
                        })()}
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
            Error: {error}
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
            onChange={(e) => setInput(e.target.value)}
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
