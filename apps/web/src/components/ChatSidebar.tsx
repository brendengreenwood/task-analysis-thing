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
  baseUrl: import.meta.env.VITE_MASTRA_API_URL || 'http://localhost:4111',
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
        className="fixed right-4 bottom-4 bg-[#0a0a0a] border border-zinc-700 text-zinc-400 p-3 hover:bg-zinc-900 hover:text-zinc-300 transition-all z-50"
        title="Open AI Assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="w-80 h-screen sticky top-0 bg-[#0a0a0a] flex flex-col border-l border-zinc-700">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-zinc-400" />
          <h2 className="font-medium text-zinc-300 text-sm">ai assistant</h2>
        </div>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-zinc-900 transition-colors"
          title="Close chat"
        >
          <X className="w-3.5 h-3.5 text-zinc-500" />
        </button>
      </div>

      {/* Project context indicator */}
      {currentProject ? (
        <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-700 text-xs">
          <span className="text-zinc-500">context: </span>
          <span className="font-medium text-zinc-300">{currentProject.name}</span>
        </div>
      ) : (
        <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-700 text-xs text-zinc-500">
          select project first
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-zinc-500 mt-8 border border-zinc-700 p-4">
            <MessageSquare className="w-8 h-8 mx-auto mb-3 text-zinc-600" />
            <p className="text-xs">
              describe activities, tasks, and operations
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 text-xs ${
                message.role === 'user'
                  ? 'bg-zinc-900 border border-zinc-600 text-zinc-200'
                  : 'bg-[#0a0a0a] border border-zinc-700 text-zinc-300'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>

              {/* Show tool calls */}
              {message.toolCalls && message.toolCalls.length > 0 && (
                <div className="mt-2 pt-2 border-t border-zinc-600 text-xs text-zinc-400">
                  {message.toolCalls.map((tool, idx) => (
                    <div key={idx} className="flex items-center gap-1 font-mono">
                      {tool.status === 'pending' ? (
                        <Loader2 className="w-3 h-3 animate-spin text-zinc-300" />
                      ) : (
                        <span className="text-zinc-300">[OK]</span>
                      )}
                      <span className={tool.status === 'pending' ? 'text-zinc-300' : ''}>
                        {(() => {
                          const labels: Record<string, [string, string]> = {
                            'add-activity': ['EXEC: add-activity', 'DONE: add-activity'],
                            'add-task': ['EXEC: add-task', 'DONE: add-task'],
                            'add-operation': ['EXEC: add-operation', 'DONE: add-operation'],
                            'edit-activity': ['EXEC: edit-activity', 'DONE: edit-activity'],
                            'edit-task': ['EXEC: edit-task', 'DONE: edit-task'],
                            'edit-operation': ['EXEC: edit-operation', 'DONE: edit-operation'],
                            'delete-activity': ['EXEC: delete-activity', 'DONE: delete-activity'],
                            'delete-task': ['EXEC: delete-task', 'DONE: delete-task'],
                            'delete-operation': ['EXEC: delete-operation', 'DONE: delete-operation'],
                            'bulk-add': ['EXEC: bulk-add', 'DONE: bulk-add'],
                            'get-project-context': ['EXEC: get-context', 'DONE: get-context'],
                          };
                          const label = labels[tool.toolName];
                          if (label) {
                            return tool.status === 'pending' ? label[0] : label[1];
                          }
                          // Fallback: show raw tool name
                          return tool.status === 'pending' ? `EXEC: ${tool.toolName}` : `DONE: ${tool.toolName}`;
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
            <div className="bg-[#0a0a0a] border border-zinc-600 px-3 py-2 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
              <span className="text-xs text-zinc-300 font-mono">processing...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-xs px-3 py-2">
            error: {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="p-4 border-t border-zinc-700">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentProject ? 'enter command...' : 'select project first'}
            disabled={!currentProject || isLoading}
            rows={1}
            className="flex-1 resize-none border border-zinc-700 bg-[#0a0a0a] text-zinc-200 placeholder-zinc-600 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!currentProject || !input.trim() || isLoading}
            className="bg-zinc-900 border border-zinc-700 text-zinc-300 p-2 hover:bg-zinc-800 hover:text-zinc-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-zinc-500 mt-2 font-mono">enter=send | shift+enter=newline</p>
      </form>
    </div>
  );
};
