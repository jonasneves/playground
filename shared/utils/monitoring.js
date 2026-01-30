/**
 * Error Tracking and Analytics
 */

class ErrorTracker {
  constructor() {
    this.maxErrors = 100;
    this.storageKey = 'error_log';
  }

  log(error, context = {}) {
    const errorEntry = {
      message: error.message || String(error),
      stack: error.stack,
      context: context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    try {
      const errors = this.getErrors();
      errors.unshift(errorEntry);

      // Keep only recent errors
      if (errors.length > this.maxErrors) {
        errors.length = this.maxErrors;
      }

      localStorage.setItem(this.storageKey, JSON.stringify(errors));
      console.error('Error tracked:', errorEntry);
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  getErrors() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  clear() {
    localStorage.removeItem(this.storageKey);
  }

  exportErrors() {
    const errors = this.getErrors();
    const blob = new Blob([JSON.stringify(errors, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `errors-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

class Analytics {
  constructor() {
    this.storageKey = 'app_analytics';
  }

  track(event, data = {}) {
    const entry = {
      event: event,
      data: data,
      timestamp: new Date().toISOString()
    };

    try {
      const analytics = this.getAnalytics();

      // Track event counts
      if (!analytics.events) analytics.events = {};
      analytics.events[event] = (analytics.events[event] || 0) + 1;

      // Track app launches
      if (event === 'app_launch' && data.appName) {
        if (!analytics.appLaunches) analytics.appLaunches = {};
        analytics.appLaunches[data.appName] = (analytics.appLaunches[data.appName] || 0) + 1;
      }

      // Track session info
      if (!analytics.sessions) analytics.sessions = [];
      analytics.sessions.push(entry);

      // Keep only last 1000 events
      if (analytics.sessions.length > 1000) {
        analytics.sessions = analytics.sessions.slice(-1000);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(analytics));
    } catch (e) {
      console.warn('Failed to track analytics:', e);
    }
  }

  getAnalytics() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }

  getStats() {
    const analytics = this.getAnalytics();
    return {
      totalEvents: Object.values(analytics.events || {}).reduce((a, b) => a + b, 0),
      eventCounts: analytics.events || {},
      appLaunches: analytics.appLaunches || {},
      mostUsedApp: this.getMostUsedApp(analytics.appLaunches || {}),
      sessionCount: (analytics.sessions || []).length
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

  exportAnalytics() {
    const analytics = this.getAnalytics();
    const blob = new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
