/**
 * Error Tracking and Analytics
 */

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function getStoredJson(key, fallback) {
  const stored = localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    return JSON.parse(stored);
  } catch {
    return fallback;
  }
}

class ErrorTracker {
  constructor() {
    this.maxErrors = 100;
    this.storageKey = 'error_log';
  }

  log(error, context = {}) {
    const errorEntry = {
      message: error.message || String(error),
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    const errors = this.getErrors();
    errors.unshift(errorEntry);
    errors.length = Math.min(errors.length, this.maxErrors);

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to log error:', e);
    }
    console.error('Error tracked:', errorEntry);
  }

  getErrors() {
    return getStoredJson(this.storageKey, []);
  }

  clear() {
    localStorage.removeItem(this.storageKey);
  }

  export() {
    downloadJson(this.getErrors(), `errors-${Date.now()}.json`);
  }
}

class Analytics {
  constructor() {
    this.storageKey = 'app_analytics';
    this.maxSessions = 1000;
  }

  track(event, data = {}) {
    const analytics = this.getAnalytics();
    analytics.events = analytics.events || {};
    analytics.events[event] = (analytics.events[event] || 0) + 1;

    if (event === 'app_launch' && data.appName) {
      analytics.appLaunches = analytics.appLaunches || {};
      analytics.appLaunches[data.appName] = (analytics.appLaunches[data.appName] || 0) + 1;
    }

    analytics.sessions = analytics.sessions || [];
    analytics.sessions.push({ event, data, timestamp: new Date().toISOString() });
    if (analytics.sessions.length > this.maxSessions) {
      analytics.sessions = analytics.sessions.slice(-this.maxSessions);
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(analytics));
    } catch (e) {
      console.warn('Failed to track analytics:', e);
    }
  }

  getAnalytics() {
    return getStoredJson(this.storageKey, {});
  }

  getStats() {
    const analytics = this.getAnalytics();
    const events = analytics.events || {};
    const appLaunches = analytics.appLaunches || {};
    const sessions = analytics.sessions || [];

    return {
      totalEvents: Object.values(events).reduce((a, b) => a + b, 0),
      eventCounts: events,
      appLaunches,
      mostUsedApp: this.getMostUsedApp(appLaunches),
      sessionCount: sessions.length
    };
  }

  getMostUsedApp(launches) {
    const entries = Object.entries(launches);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => b[1] > a[1] ? b : a)[0];
  }

  clear() {
    localStorage.removeItem(this.storageKey);
  }

  export() {
    downloadJson(this.getAnalytics(), `analytics-${Date.now()}.json`);
  }
}

// Global instances
window.errorTracker = new ErrorTracker();
window.analytics = new Analytics();

// Setup global error handlers
window.addEventListener('error', (event) => {
  errorTracker.log(event.error, {
    type: 'uncaught_error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  errorTracker.log(event.reason, {
    type: 'unhandled_rejection',
    promise: 'Promise rejection'
  });
});

// Track page visibility
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    analytics.track('page_hidden');
  } else {
    analytics.track('page_visible');
  }
});
