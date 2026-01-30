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
      <div className="relative min-h-screen">
        <div className="fixed top-[70%] left-[75%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] rounded-full bg-brand-500 blur-[100px] sm:blur-[150px] opacity-40 animate-breathe pointer-events-none" />
        <UserMenu user={user} onLogout={onLogout} onClearCache={onClearCache} />

        <div className="relative z-10">
          <header className="py-16 sm:py-24 text-center">
            <h1 className="text-4xl sm:text-5xl font-semibold text-neutral-900 flex items-center justify-center gap-3 mb-3">
              <Rocket className="text-brand-600" size={40} />
              {config.branding.title}
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto px-4">
              {config.branding.subtitle}
            </p>
          </header>

          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-neutral-200 border-t-brand-600 rounded-full animate-[spin_1s_linear_infinite]" />
              <p className="text-neutral-600">Loading applications...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen">
        <UserMenu user={user} onLogout={onLogout} onClearCache={onClearCache} />
        <div className="container py-8">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6">
            <strong className="font-semibold">Error:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed top-[70%] left-[75%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] rounded-full bg-brand-500 blur-[100px] sm:blur-[150px] opacity-40 animate-breathe pointer-events-none" />

      <UserMenu user={user} onLogout={onLogout} onClearCache={onClearCache} />

      <div className="relative z-10">
        <header className="py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold text-neutral-900 flex items-center justify-center gap-3 mb-3">
            <Rocket className="text-brand-600" size={40} />
            {config.branding.title}
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto px-4">
            {config.branding.subtitle}
          </p>
        </header>

        <div className="container pb-20">
          <div className="grid">
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
        </div>
      </div>

      {currentApp && (
        <>
          <iframe
            ref={iframeRef}
            className="fixed inset-0 w-full h-full border-0 z-[9998]"
            style={{ display: 'block' }}
            title={currentApp.name}
          />

          {appLoading && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
              <div className="flex flex-col items-center gap-4 text-white">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-[spin_1s_linear_infinite]" />
                <p className="text-lg">Loading app...</p>
              </div>
            </div>
          )}

          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/90 text-white px-6 py-3 rounded-full text-sm flex items-center gap-2 transition-all duration-300 z-[10000] ${showHint ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            Press ESC to return to gallery
          </div>
        </>
      )}
    </div>
  );
}
