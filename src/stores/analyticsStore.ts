import { create } from 'zustand';

interface AnalyticsEvent {
  type: string;
  data: Record<string, any>;
  timestamp: number;
}

interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
}

interface MetricEntry {
  app: string;
  metric: string;
  value: number;
  timestamp: number;
}

interface AnalyticsState {
  events: AnalyticsEvent[];
  errors: ErrorLog[];
  metrics: MetricEntry[];
  track: (type: string, data?: Record<string, any>) => void;
  logError: (error: ErrorLog) => void;
  trackMetric: (app: string, metric: string, value: number) => void;
  getMetrics: (app: string) => MetricEntry[];
}

export const useAnalyticsStore = create<AnalyticsState>()((set, get) => ({
  events: [],
  errors: [],
  metrics: [],

  track: (type, data = {}) => {
    const event: AnalyticsEvent = {
      type,
      data,
      timestamp: Date.now()
    };
    set(state => ({ events: [...state.events.slice(-99), event] }));
    console.log('[Analytics]', type, data);
  },

  logError: (error) => {
    set(state => ({ errors: [...state.errors.slice(-49), error] }));
    console.error('[Error]', error);
  },

  trackMetric: (app, metric, value) => {
    const entry: MetricEntry = { app, metric, value, timestamp: Date.now() };
    set(state => ({ metrics: [...state.metrics.slice(-199), entry] }));
  },

  getMetrics: (app) => {
    return get().metrics.filter(m => m.app === app);
  }
}));
