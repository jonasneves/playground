import { useRef, useCallback } from 'react';
import { PerformanceConfig, type AppName } from '@/config/performance';
import { useAnalyticsStore } from '@/stores';

export function usePerformanceMonitor(appName: AppName) {
  const trackMetric = useAnalyticsStore((state) => state.trackMetric);
  const metricsRef = useRef<Map<string, number>>(new Map());

  const startTimer = useCallback((metricName: string) => {
    metricsRef.current.set(metricName, performance.now());
  }, []);

  const endTimer = useCallback(
    (metricName: string) => {
      const start = metricsRef.current.get(metricName);
      if (start === undefined) {
        console.warn(`[${appName}] Timer "${metricName}" was never started`);
        return;
      }

      const duration = performance.now() - start;
      metricsRef.current.delete(metricName);

      const threshold = PerformanceConfig.thresholds[metricName as keyof typeof PerformanceConfig.thresholds];
      trackMetric(appName, metricName, duration, threshold);

      return duration;
    },
    [appName, trackMetric]
  );

  const measure = useCallback(
    async <T,>(metricName: string, fn: () => T | Promise<T>): Promise<T> => {
      startTimer(metricName);
      try {
        const result = await fn();
        endTimer(metricName);
        return result;
      } catch (error) {
        endTimer(metricName);
        throw error;
      }
    },
    [startTimer, endTimer]
  );

  return { startTimer, endTimer, measure };
}
