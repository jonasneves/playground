import { useState, useCallback, useEffect } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ModelSelector } from './ModelSelector';
import { useStreamAccumulator } from '@/hooks/useStreamAccumulator';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useAuthStore } from '@/stores';
import type { Message, Model } from './types';

export default function ChatApp() {
  const token = useAuthStore(state => state.token);
  const { startTimer, endTimer } = usePerformanceMonitor('chat');
  const [messages, setMessages, clearMessages] = useLocalStorage<Message[]>('chat_history', []);
  const [selectedModel, setSelectedModel] = useLocalStorage<Model>('chat_model', 'gpt-4o-mini');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    endTimer('ttfr');
  }, [endTimer]);

  // RAF batching for message updates
  const { accumulate } = useStreamAccumulator<Message>((newMessages) => {
    setMessages(prev => [...prev, ...newMessages]);
  });

  const addMessage = useCallback((role: Message['role'], content: string) => {
    const message: Message = {
      role,
      content,
      id: `${Date.now()}-${Math.random()}`
    };
    accumulate(message);
  }, [accumulate]);

  const handleSend = useCallback(async (content: string) => {
    if (!token || isLoading) return;

    setIsLoading(true);
    addMessage('user', content);

    try {
      startTimer('api_latency_ms');
      const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [...messages, { role: 'user', content }].map(m => ({
            role: m.role,
            content: m.content
          })),
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: `API error: ${response.status}` } }));
        throw new Error(error.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices[0].message.content;
      endTimer('api_latency_ms');

      addMessage('assistant', reply);
    } catch (error: any) {
      addMessage('system', `Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedModel, messages, isLoading, addMessage, startTimer, endTimer]);

  const handleClearChat = useCallback(() => {
    if (confirm('Clear all chat history?')) {
      clearMessages();
    }
  }, [clearMessages]);

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <h1 className="text-2xl font-semibold text-neutral-900">AI Chat</h1>
        <p className="text-sm text-neutral-600">Powered by GitHub Models</p>
      </div>

      <ModelSelector
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        onClearChat={handleClearChat}
      />

      <MessageList messages={messages} />

      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
