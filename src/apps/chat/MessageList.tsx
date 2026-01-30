import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Message } from './types';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

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
      className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
      id="chat"
      onScroll={handleScroll}
    >
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id || index}
          message={message}
        />
      ))}
    </div>
  );
}
