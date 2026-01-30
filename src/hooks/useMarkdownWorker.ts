import { useState, useEffect, useCallback, useRef } from 'react';

interface MarkdownMessage {
  id: string;
  markdown: string;
}

interface MarkdownResponse {
  id: string;
  html: string;
  error?: string;
}

/**
 * Hook to parse markdown using a Web Worker
 *
 * Offloads heavy markdown parsing to a background thread,
 * preventing UI blocking during typing.
 *
 * @returns { html, parse, isReady, error }
 */
export function useMarkdownWorker() {
  const [html, setHtml] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const pendingRequestRef = useRef<string | null>(null);

  // Initialize worker
  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/markdown.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e: MessageEvent<MarkdownResponse>) => {
      const { id, html, error } = e.data;

      // Worker ready signal
      if (id === 'ready') {
        setIsReady(true);
        return;
      }

      // Check if this is the response we're waiting for
      if (pendingRequestRef.current === id) {
        if (error) {
          setError(error);
        } else {
          setHtml(html);
          setError(null);
        }
        pendingRequestRef.current = null;
      }
    };

    worker.onerror = (e) => {
      console.error('Markdown worker error:', e);
      setError('Worker error occurred');
      setIsReady(false);
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  const parse = useCallback((markdown: string) => {
    if (!workerRef.current || !isReady) {
      return;
    }

    const id = `request-${++requestIdRef.current}`;
    pendingRequestRef.current = id;

    const message: MarkdownMessage = {
      id,
      markdown
    };

    workerRef.current.postMessage(message);
  }, [isReady]);

  return { html, parse, isReady, error };
}
