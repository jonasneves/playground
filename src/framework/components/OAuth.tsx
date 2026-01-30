import { useEffect, useState } from 'react';
import type { User } from '../types';

interface OAuthProps {
  children: React.ReactNode;
  oauthServiceUrl: string;
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
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Check if we're handling an OAuth callback or already have auth
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthCallback = urlParams.has('code') || urlParams.has('state');
    const hasStoredAuth = localStorage.getItem('github_token');

    // Only load script if we need it (callback or existing auth)
    if (!hasOAuthCallback && !hasStoredAuth) {
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

    // Check if we're handling an OAuth callback (returning from GitHub)
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthCallback = urlParams.has('code') || urlParams.has('state');

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
    } else if (hasOAuthCallback) {
      // Only initialize if we're processing an OAuth callback
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
      setAuthInitialized(true);
      setIsLoading(false);
    } else {
      // Not authenticated and no callback - show landing page
      setIsLoading(false);
    }
  }, [scriptLoaded, onAuthChange]);

  const handleLogin = () => {
    if (!scriptLoaded) {
      // Load script on-demand when user clicks login
      setIsLoading(true);
      const script = document.createElement('script');
      script.src = `${oauthServiceUrl}/github-auth.js?v=${Date.now()}`;
      script.async = true;

      script.onload = () => {
        setTimeout(() => {
          if (window.GitHubAuth) {
            window.GitHubAuth.init({
              scope: 'repo',
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
        window.GitHubAuth.init({
          scope: 'repo',
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl mx-auto flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-neutral-900">Welcome to Playground</h1>
              <p className="text-neutral-600">
                Launch and experiment with apps powered by your GitHub repository
              </p>
            </div>

            <div className="space-y-3 text-sm text-neutral-600">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Access your repository files and content</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Manage todos, chat, and browse files</span>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Secure authentication with GitHub</span>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Sign in with GitHub
            </button>

            <p className="text-xs text-center text-neutral-500">
              By signing in, you'll be redirected to GitHub to authorize access
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
