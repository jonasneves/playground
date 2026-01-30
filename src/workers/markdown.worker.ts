import { marked } from 'marked';

// Configure marked for better performance
marked.setOptions({
  breaks: true,
  gfm: true
});

interface MarkdownMessage {
  id: string;
  markdown: string;
}

interface MarkdownResponse {
  id: string;
  html: string;
  error?: string;
}

// Handle messages from main thread
self.onmessage = (e: MessageEvent<MarkdownMessage>) => {
  const { id, markdown } = e.data;

  try {
    const html = marked.parse(markdown) as string;

    const response: MarkdownResponse = {
      id,
      html
    };

    self.postMessage(response);
  } catch (error: any) {
    const response: MarkdownResponse = {
      id,
      html: '',
      error: error.message
    };

    self.postMessage(response);
  }
};

// Signal that worker is ready
self.postMessage({ id: 'ready', html: '' });
