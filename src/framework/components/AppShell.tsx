import { useState, useEffect, useCallback } from 'react';
import { Rocket } from 'lucide-react';
import { AppCard } from './AppCard';
import { UserMenu } from './UserMenu';
import type { FrameworkConfig, User, AppManifest } from '../types';

interface AppShellProps {
  config: FrameworkConfig;
  user: User | null;
  token: string | null;
  onLogout: () => void;
  onClearCache: () => void;
  onTrack?: (event: string, data?: Record<string, any>) => void;
  onNavigate?: (route: string) => void;
}

interface AppData {
  name: string;
  path: string;
  manifest: AppManifest | null;
}

export function AppShell({
  config,
  user,
  onLogout,
  onClearCache,
  onTrack,
  onNavigate
}: AppShellProps) {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      setLoading(true);

      // Fetch apps registry (single API call instead of 7+)
      const response = await fetch('/apps-registry.json');
      if (!response.ok) {
        throw new Error('Failed to load apps registry');
      }

      const registry = await response.json();

      const appData: AppData[] = registry.apps.map((app: any) => ({
        name: app.name,
        path: app.path,
        manifest: app.manifest
      }));

      setApps(appData);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const loadApp = useCallback((appPath: string, appName: string) => {
    onTrack?.('app_launch', { appName, appPath });

    const manifest = apps.find(app => app.path === appPath)?.manifest;
    if (manifest?.reactRoute && onNavigate) {
      onNavigate(manifest.reactRoute);
    }
  }, [apps, onTrack, onNavigate]);

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
    </div>
  );
}
