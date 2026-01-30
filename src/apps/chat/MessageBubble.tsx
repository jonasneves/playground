import { memo } from 'react';
import type { Message } from './types';

interface MessageBubbleProps {
  message: Message;
  style?: React.CSSProperties;
}

export const MessageBubble = memo(({ message, style }: MessageBubbleProps) => {
  const baseClasses = "px-4 py-3 rounded-lg text-sm leading-relaxed max-w-[80%]";

  const roleClasses = {
    user: "ml-auto bg-brand-600 text-white",
    assistant: "mr-auto bg-white border border-neutral-200 text-neutral-900",
    system: "mx-auto bg-amber-50 border border-amber-200 text-amber-800 text-center"
  };

  return (
    <div
      style={style}
      className={`${baseClasses} ${roleClasses[message.role]}`}
      data-role={message.role}
    >
      {message.content}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';
