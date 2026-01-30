import { useRef, useCallback, useEffect } from 'react';

/**
 * RAF-based batching hook for streaming updates
 *
 * Accumulates rapid updates and flushes them in a single requestAnimationFrame,
 * preventing excessive re-renders and maintaining 60fps performance.
 *
 * Based on serverless-llm pattern for handling streaming responses.
 *
 * @example
 * const { accumulate } = useStreamAccumulator<Message>((items) => {
 *   setMessages(prev => [...prev, ...items]);
 * });
 *
 * // Call this many times rapidly - only flushes once per frame
 * accumulate(newMessage);
 */
export function useStreamAccumulator<T>(
  onFlush: (items: T[]) => void,
  options: { maxBatchSize?: number } = {}
) {
  const { maxBatchSize = Infinity } = options;
  const bufferRef = useRef<T[]>([]);
  const rafRef = useRef<number | undefined>(undefined);

  const accumulate = useCallback((item: T | T[]) => {
    const items = Array.isArray(item) ? item : [item];
    bufferRef.current.push(...items);

    // If we hit max batch size, flush immediately
    if (bufferRef.current.length >= maxBatchSize) {
      if (rafRef.current !== undefined) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = undefined;
      }
      onFlush(bufferRef.current);
      bufferRef.current = [];
      return;
    }

    // Already scheduled a flush for next frame
    if (rafRef.current) return;

    // Schedule flush for next animation frame
    rafRef.current = requestAnimationFrame(() => {
      onFlush(bufferRef.current);
      bufferRef.current = [];
      rafRef.current = undefined;
    });
  }, [onFlush, maxBatchSize]);

  const flush = useCallback(() => {
    if (rafRef.current !== undefined) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
    if (bufferRef.current.length > 0) {
      onFlush(bufferRef.current);
      bufferRef.current = [];
    }
  }, [onFlush]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== undefined) {
        cancelAnimationFrame(rafRef.current);
      }
      // Flush any remaining items
      if (bufferRef.current.length > 0) {
        onFlush(bufferRef.current);
      }
    };
  }, [onFlush]);

  return { accumulate, flush };
}
