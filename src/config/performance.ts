export const PerformanceConfig = {
  metrics: {
    chat: ['ttfr', 'message_render_ms', 'api_latency_ms'],
    cms: ['preview_parse_ms', 'save_latency_ms'],
    dashboard: ['data_load_ms'],
    'file-browser': ['directory_load_ms', 'scroll_performance_ms'],
  },
  thresholds: {
    ttfr: 1000,
    api_latency_ms: 2000,
    message_render_ms: 100,
    preview_parse_ms: 50,
    save_latency_ms: 1500,
    data_load_ms: 2000,
    directory_load_ms: 1500,
    scroll_performance_ms: 16,
  },
  apps: {
    chat: {
      maxHistorySize: 1000,
      virtualScrollThreshold: 50,
    },
    cms: {
      debounceMs: 300,
      useWorker: true,
    },
  },
} as const;

export type AppName = keyof typeof PerformanceConfig.metrics;
export type MetricName = string;
