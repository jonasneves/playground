import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AnalyticsEvent {
  type: string;
  data: Record<string, any>;
  timestamp: number;
}

export interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  appName?: string;
}

export interface PerformanceMetric {
  appName: string;
  metricName: string;
  duration: number;
  timestamp: number;
  threshold?: number;
  exceedsThreshold: boolean;
}

interface AnalyticsState {
  events: AnalyticsEvent[];
  errors: ErrorLog[];
  metrics: PerformanceMetric[];
  track: (type: string, data?: Record<string, any>) => void;
  logError: (error: ErrorLog) => void;
  trackMetric: (appName: string, metricName: string, duration: number, threshold?: number) => void;
  clearMetrics: () => void;
  clearErrors: () => void;
  getMetricStats: (appName: string, metricName: string) => {
    count: number;
    average: number;
    min: number;
    max: number;
    exceedCount: number;
  } | null;
}

export function createAnalyticsStore(
  storageKey = 'analytics-storage',
  options = { enabled: true, maxEvents: 100 }
) {
  return create<AnalyticsState>()(
    persist(
      (set, get) => ({
        events: [],
        errors: [],
        metrics: [],

        track: (type, data = {}) => {
          if (!options.enabled) return;

          const event: AnalyticsEvent = {
            type,
            data,
            timestamp: Date.now(),
          };
          set((state) => ({
            events: [...state.events.slice(-(options.maxEvents - 1)), event],
          }));
          console.log('[Analytics]', type, data);
        },

        logError: (error) => {
          if (!options.enabled) return;

          console.error('[Analytics] Error logged:', error);
          set((state) => ({
            errors: [...state.errors.slice(-99), error],
          }));
        },

        trackMetric: (appName, metricName, duration, threshold) => {
          if (!options.enabled) return;

          const exceedsThreshold = threshold ? duration > threshold : false;

          const metric: PerformanceMetric = {
            appName,
            metricName,
            duration,
            timestamp: Date.now(),
            threshold,
            exceedsThreshold,
          };

          if (exceedsThreshold) {
            console.warn(
              `[${appName}] ${metricName} exceeded threshold: ${duration.toFixed(2)}ms > ${threshold}ms`
            );
          }

          set((state) => ({
            metrics: [...state.metrics.slice(-999), metric],
          }));
        },

        clearMetrics: () => set({ metrics: [] }),
        clearErrors: () => set({ errors: [] }),

        getMetricStats: (appName, metricName) => {
          const filtered = get().metrics.filter(
            (m) => m.appName === appName && m.metricName === metricName
          );

          if (filtered.length === 0) return null;

          const durations = filtered.map((m) => m.duration);
          const exceedCount = filtered.filter((m) => m.exceedsThreshold).length;

          return {
            count: filtered.length,
            average: durations.reduce((a, b) => a + b, 0) / durations.length,
            min: Math.min(...durations),
            max: Math.max(...durations),
            exceedCount,
          };
        },
      }),
      {
        name: storageKey,
        partialize: (state) => ({
          events: state.events.slice(-50),
          metrics: state.metrics.slice(-100),
          errors: state.errors.slice(-20),
        }),
      }
    )
  );
}

export type AnalyticsStore = ReturnType<typeof createAnalyticsStore>;
