import { memo } from 'react';
import { Bot } from 'lucide-react';
import type { Message } from './types';

interface MessageBubbleProps {
  message: Message;
  style?: React.CSSProperties;
}

export const MessageBubble = memo(({ message, style }: MessageBubbleProps) => {
  if (message.role === 'user') {
    return (
      <div style={style} className="flex justify-end" data-role={message.role}>
        <div className="px-5 py-3 rounded-2xl rounded-br-sm bg-brand-600 text-white text-[15px] leading-relaxed max-w-[85%] shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.role === 'assistant') {
    return (
      <div style={style} className="flex gap-3" data-role={message.role}>
        <div className="w-8 h-8 rounded-full bg-brand-600/10 flex items-center justify-center flex-shrink-0">
          <Bot size={16} className="text-brand-600" strokeWidth={2.5} />
        </div>
        <div className="px-5 py-3 rounded-2xl rounded-tl-sm bg-white border border-neutral-200 text-neutral-700 text-[15px] leading-relaxed max-w-[85%] shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div style={style} className="flex justify-center" data-role={message.role}>
      <div className="px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm text-center max-w-[85%]">
        {message.content}
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';
