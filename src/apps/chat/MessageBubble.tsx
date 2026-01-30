import { memo } from 'react';
import type { Message } from './types';

interface MessageBubbleProps {
  message: Message;
  style?: React.CSSProperties;
}

export const MessageBubble = memo(({ message, style }: MessageBubbleProps) => {
  return (
    <div
      style={style}
      className={`message ${message.role}`}
      data-role={message.role}
    >
      {message.content}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';
