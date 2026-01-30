import { useEffect, useRef, useMemo } from 'react';
import { Bot } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import type { Message } from './types';

interface MessageListProps {
  messages: Message[];
}

const VIRTUALIZATION_THRESHOLD = 50;
const RENDER_WINDOW_SIZE = 100;

export function MessageList({ messages }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  // Only render recent messages when list gets too long (performance optimization)
  const visibleMessages = useMemo(() => {
    if (messages.length <= VIRTUALIZATION_THRESHOLD) {
      return messages;
    }
    return messages.slice(-RENDER_WINDOW_SIZE);
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScrollRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  // Track if user is at bottom
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
    shouldAutoScrollRef.current = isAtBottom;
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-6 py-6"
      id="chat"
      onScroll={handleScroll}
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <div className="w-20 h-20 bg-brand-600/10 rounded-3xl flex items-center justify-center mb-6">
            <Bot size={40} className="text-brand-600" strokeWidth={2} />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">AI Chat</h2>
          <p className="text-sm text-neutral-500 max-w-sm">
            Start a conversation with AI
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.length > VIRTUALIZATION_THRESHOLD && (
            <div className="text-center text-xs text-neutral-400 py-2">
              Showing last {RENDER_WINDOW_SIZE} of {messages.length} messages
            </div>
          )}
          {visibleMessages.map((message, index) => (
            <MessageBubble
              key={message.id || index}
              message={message}
            />
          ))}
        </div>
      )}
    </div>
  );
}
