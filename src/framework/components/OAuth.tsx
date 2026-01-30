import { useEffect, useState } from 'react';
import type { User } from '../types';

interface OAuthProps {
  children: React.ReactNode;
  oauthServiceUrl: string;
  storageKey?: string;
  onAuthChange: (token: string | null, user: User | null) => void;
  isAuthenticated: boolean;
}

declare global {
  interface Window {
    GitHubAuth: {
      init: (config: { scope: string; onLogin: (token: string) => void }) => void;
      isAuthenticated: () => boolean;
      getUser: () => any;
      getToken: () => string | null;
      login: () => void;
      logout: () => void;
    };
  }
}

export function OAuth({
  children,
  oauthServiceUrl,
  onAuthChange,
  isAuthenticated
}: OAuthProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `${oauthServiceUrl}/github-auth.js?v=${Date.now()}`;
    script.async = true;

    script.onload = () => {
      // Small delay to ensure GitHubAuth is fully initialized
      setTimeout(() => {
        if (window.GitHubAuth) {
          setScriptLoaded(true);
        } else {
          console.error('GitHubAuth not available after script load');
          setIsLoading(false);
        }
      }, 100);
    };

    script.onerror = () => {
      console.error('Failed to load OAuth script');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [oauthServiceUrl]);

  useEffect(() => {
    if (!scriptLoaded) return;

    if (window.GitHubAuth.isAuthenticated()) {
      const user = window.GitHubAuth.getUser();
      const token = window.GitHubAuth.getToken();
      if (user && token) {
        // Defer state update to avoid updating during render
        setTimeout(() => {
          onAuthChange(token, user);
          setIsLoading(false);
        }, 0);
      }
    } else {
      window.GitHubAuth.init({
        scope: 'repo',
        onLogin: (token: string) => {
          const user = window.GitHubAuth.getUser();
          if (user) {
            // Defer state update to avoid updating during render
            setTimeout(() => {
              onAuthChange(token, user);
              setIsLoading(false);
            }, 0);
          }
        }
      });
      setIsLoading(false);
    }
  }, [scriptLoaded, onAuthChange]);

  if (isLoading) {
    return (
      <div className="loading">
        <div style={{ textAlign: 'center' }}>
          <div style={{
            border: '4px solid rgba(255,255,255,0.3)',
            borderRadius: '50%',
            borderTopColor: 'white',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p>Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="loading">
        <div style={{ textAlign: 'center' }}>
          <h2>Authentication Required</h2>
          <p style={{ marginTop: 16, marginBottom: 24, opacity: 0.9 }}>
            Please sign in with GitHub to access the gallery
          </p>
          <button
            onClick={() => window.GitHubAuth.login()}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Sign in with GitHub
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
