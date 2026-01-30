import { Component, type PropsWithChildren, type ReactNode } from 'react';
import type { ErrorLog } from '../stores/createAnalyticsStore';

interface ErrorBoundaryProps extends PropsWithChildren {
  fallback?: ReactNode;
  appName?: string;
  onError?: (error: ErrorLog) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
      timestamp: Date.now(),
      appName: this.props.appName,
    };

    if (this.props.onError) {
      this.props.onError(errorLog);
    }

    console.error('[ErrorBoundary] Caught error:', errorLog);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: '#ef4444',
          background: '#fef2f2',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1.25rem', fontWeight: 600 }}>
            Something went wrong
          </h2>
          <p style={{ margin: '0 0 16px', color: '#991b1b', fontSize: '0.875rem' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
