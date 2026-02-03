import { useEffect, useState } from 'react';
import type { User } from '../types';

interface OAuthProps {
  children: (onLogin: () => void) => React.ReactNode;
  oauthServiceUrl: string;
  onAuthChange: (token: string | null, user: User | null) => void;
  isAuthenticated: boolean;
}

declare global {
  interface Window {
    GitHubAuth: {
      init: (config: { scope?: string; autoRedirect?: boolean; onLogin: (token: string) => void }) => Promise<void>;
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
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Check if we're handling an OAuth callback or already have auth
    const urlParams = new URLSearchParams(window.location.search);
    const hasTokenCallback = urlParams.has('token') || urlParams.has('error');
    const hasStoredAuth = localStorage.getItem('gh_token');

    // Only load script if we need it (callback or existing auth)
    if (!hasTokenCallback && !hasStoredAuth) {
      setIsLoading(false);
      return;
    }

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

    // Check if we're handling an OAuth callback (returning from OAuth proxy)
    const urlParams = new URLSearchParams(window.location.search);
    const hasTokenCallback = urlParams.has('token') || urlParams.has('error');

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
    } else if (hasTokenCallback) {
      // Only initialize if we're processing an OAuth callback
      window.GitHubAuth.init({
        scope: 'repo',
        autoRedirect: false,
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
      setAuthInitialized(true);
      setIsLoading(false);
    } else {
      // Not authenticated and no callback - show landing page
      setIsLoading(false);
    }
  }, [scriptLoaded, onAuthChange]);

  const handleLogin = async () => {
    if (!scriptLoaded) {
      // Load script on-demand when user clicks login
      setIsLoading(true);
      const script = document.createElement('script');
      script.src = `${oauthServiceUrl}/github-auth.js?v=${Date.now()}`;
      script.async = true;

      script.onload = () => {
        setTimeout(async () => {
          if (window.GitHubAuth) {
            await window.GitHubAuth.init({
              scope: 'repo',
              autoRedirect: false,
              onLogin: (token: string) => {
                const user = window.GitHubAuth.getUser();
                if (user) {
                  setTimeout(() => {
                    onAuthChange(token, user);
                  }, 0);
                }
              }
            });
            window.GitHubAuth.login();
          }
        }, 100);
      };

      document.head.appendChild(script);
    } else {
      if (!authInitialized && window.GitHubAuth) {
        await window.GitHubAuth.init({
          scope: 'repo',
          autoRedirect: false,
          onLogin: (token: string) => {
            const user = window.GitHubAuth.getUser();
            if (user) {
              setTimeout(() => {
                onAuthChange(token, user);
              }, 0);
            }
          }
        });
        setAuthInitialized(true);
      }
      window.GitHubAuth.login();
    }
  };

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

  return <>{children(handleLogin)}</>;
}
