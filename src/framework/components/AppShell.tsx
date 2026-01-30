import { useState, useEffect, useCallback, useRef } from 'react';
import { Rocket } from 'lucide-react';
import { AppCard } from './AppCard';
import { UserMenu } from './UserMenu';
import type { FrameworkConfig, User, AppManifest } from '../types';

interface AppShellProps {
  config: FrameworkConfig;
  user: User | null;
  token: string | null;
  useGitHubAPI: (owner: string, repo: string) => any;
  onLogout: () => void;
  onClearCache: () => void;
  onTrack?: (event: string, data?: Record<string, any>) => void;
  onNavigate?: (route: string) => void;
}

interface AppDirectory {
  name: string;
  path: string;
  type: 'file' | 'dir';
}

interface AppData {
  name: string;
  path: string;
  manifest: AppManifest | null;
}

export function AppShell({
  config,
  user,
  token,
  useGitHubAPI,
  onLogout,
  onClearCache,
  onTrack,
  onNavigate
}: AppShellProps) {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentApp, setCurrentApp] = useState<{ path: string; name: string } | null>(null);
  const [appLoading, setAppLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const api = useGitHubAPI(config.repository.owner, config.repository.name);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    loadApps();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && currentApp) {
        closeApp();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentApp]);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data === 'close-app') {
        closeApp();
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const loadApps = async () => {
    try {
      setLoading(true);
      const directories = await api.listDirectory('apps');
      const appDirs = directories.filter((d: AppDirectory) => d.type === 'dir');

      const appData: AppData[] = appDirs.map((app: AppDirectory) => ({
        name: app.name,
        path: app.path,
        manifest: null
      }));
      setApps(appData);

      for (let i = 0; i < appDirs.length; i++) {
        await new Promise(resolve => setTimeout(resolve, i * 100));
        const manifest = await api.getManifest(appDirs[i].path);
        if (manifest) {
          setApps(prev => prev.map(app =>
            app.name === appDirs[i].name ? { ...app, manifest } : app
          ));
        }
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const loadApp = useCallback(async (appPath: string, appName: string) => {
    try {
      setAppLoading(true);
      onTrack?.('app_launch', { appName, appPath });

      // Check if this app has a React route
      const manifest = apps.find(app => app.path === appPath)?.manifest;
      if (manifest?.reactRoute && onNavigate) {
        onNavigate(manifest.reactRoute);
        setAppLoading(false);
        return;
      }

      setCurrentApp({ path: appPath, name: appName });
      const file = await api.getFile(`${appPath}/index.html`);

      const injectionScript = `<script>
        window.INJECTED_TOKEN = ${JSON.stringify(token)};
        window.INJECTED_USER = ${JSON.stringify(user)};
        window.PARENT_REPO = window.parent.repo;
      </script>`;

      const htmlWithInjection = file.content.replace('<head>', '<head>' + injectionScript);

      if (iframeRef.current) {
        iframeRef.current.srcdoc = htmlWithInjection;
        iframeRef.current.onload = () => {
          setAppLoading(false);
          setShowHint(true);
          setTimeout(() => setShowHint(false), 3000);
        };
      }
    } catch (err: any) {
      alert(`Error loading app: ${err.message}`);
      setAppLoading(false);
      setCurrentApp(null);
    }
  }, [api, token, user, onTrack, apps, onNavigate]);

  const closeApp = useCallback(() => {
    setCurrentApp(null);
    setShowHint(false);
    if (iframeRef.current) {
      iframeRef.current.srcdoc = '';
    }
  }, []);

  if (loading && apps.length === 0) {
    return (
      <div>
        <UserMenu user={user} onLogout={onLogout} onClearCache={onClearCache} />
        <div style={{
          background: `linear-gradient(135deg, ${config.branding.theme.primary} 0%, ${config.branding.theme.secondary} 100%)`,
          color: 'white',
          padding: '48px 20px',
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '2.5em',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <Rocket size={32} /> {config.branding.title}
          </h1>
          <p style={{ margin: 0, opacity: 0.95, fontSize: '1.05em' }}>
            {config.branding.subtitle}
          </p>
        </div>
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
            <p>Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <UserMenu user={user} onLogout={onLogout} onClearCache={onClearCache} />
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <UserMenu user={user} onLogout={onLogout} onClearCache={onClearCache} />

      <div style={{
        background: `linear-gradient(135deg, ${config.branding.theme.primary} 0%, ${config.branding.theme.secondary} 100%)`,
        color: 'white',
        padding: '48px 20px',
        textAlign: 'center',
        marginBottom: '48px'
      }}>
        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: '2.5em',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <Rocket size={32} /> {config.branding.title}
        </h1>
        <p style={{ margin: 0, opacity: 0.95, fontSize: '1.05em' }}>
          {config.branding.subtitle}
        </p>
      </div>

      <div className="app-grid">
        {apps.map(app => (
          <AppCard
            key={app.name}
            appName={app.name}
            manifest={app.manifest}
            path={app.path}
            onLaunch={loadApp}
          />
        ))}
      </div>

      {currentApp && (
        <>
          <iframe
            ref={iframeRef}
            className="app-frame"
            style={{ display: 'block' }}
            title={currentApp.name}
          />

          {appLoading && (
            <div className="app-loader" style={{ display: 'flex' }}>
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
                <p>Loading app...</p>
              </div>
            </div>
          )}

          <div className={`hint ${showHint ? 'visible' : ''}`}>
            Press ESC to return to gallery
          </div>
        </>
      )}
    </div>
  );
}
