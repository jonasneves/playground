import { useState, useEffect } from 'react';
import { Rocket, Search } from 'lucide-react';
import { AppCard } from './AppCard';
import { UserMenu } from './UserMenu';
import { PillToggle } from './PillToggle';
import type { FrameworkConfig, User, AppManifest } from '../types';

type FilterType = 'all' | 'productivity' | 'content';

const APP_CATEGORIES: Record<string, FilterType> = {
  todo: 'productivity',
  dashboard: 'productivity',
  settings: 'productivity',
  cms: 'content',
  'file-browser': 'content',
  chat: 'productivity',
  'medical-viz': 'content',
};

const BackgroundGlow = () => (
  <div className="fixed top-[70%] left-[75%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] rounded-full bg-brand-500 blur-[100px] sm:blur-[150px] opacity-40 animate-breathe pointer-events-none" />
);

const Header = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <header className="py-16 sm:py-24 text-center">
    <h1 className="text-4xl sm:text-5xl font-semibold text-neutral-900 flex items-center justify-center gap-3 mb-3">
      <Rocket className="text-brand-600" size={40} />
      {title}
    </h1>
    <p className="text-lg text-neutral-600 max-w-2xl mx-auto px-4">
      {subtitle}
    </p>
  </header>
);

interface AppShellProps {
  config: FrameworkConfig;
  user: User | null;
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
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadApps() {
      try {
        const response = await fetch('/apps-registry.json');
        if (!response.ok) {
          throw new Error('Failed to load apps registry');
        }
        const registry = await response.json();
        setApps(registry.apps.map((app: { name: string; path: string; manifest: AppManifest }) => ({
          name: app.name,
          path: app.path,
          manifest: app.manifest
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    loadApps();
  }, []);

  function handleAppLaunch(appPath: string, appName: string) {
    onTrack?.('app_launch', { appName, appPath });
    const manifest = apps.find(app => app.path === appPath)?.manifest;
    if (manifest?.reactRoute && onNavigate) {
      onNavigate(manifest.reactRoute);
    }
  }

  const filteredApps = apps.filter(app => {
    const category = APP_CATEGORIES[app.name];
    const matchesCategory = filter === 'all' || category === filter;

    if (!searchQuery) return matchesCategory;

    const query = searchQuery.toLowerCase();
    const manifest = app.manifest;

    const matchesSearch =
      app.name.toLowerCase().includes(query) ||
      manifest?.description?.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  if (loading && apps.length === 0) {
    return (
      <div className="relative min-h-screen">
        <BackgroundGlow />
        <UserMenu user={user} onLogout={onLogout} onClearCache={onClearCache} />
        <div className="relative z-10">
          <Header title={config.branding.title} subtitle={config.branding.subtitle} />
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
      <BackgroundGlow />
      <UserMenu user={user} onLogout={onLogout} onClearCache={onClearCache} />
      <div className="relative z-10">
        <Header title={config.branding.title} subtitle={config.branding.subtitle} />
        <div className="container pb-20">
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            <PillToggle
              options={[
                { value: 'all', label: 'All' },
                { value: 'productivity', label: 'Productivity' },
                { value: 'content', label: 'Content' },
              ]}
              value={filter}
              onChange={(value) => setFilter(value as FilterType)}
            />
          </div>

          <div className="grid">
            {filteredApps.map(app => (
              <AppCard
                key={app.name}
                appName={app.name}
                manifest={app.manifest}
                path={app.path}
                onLaunch={handleAppLaunch}
              />
            ))}
          </div>

          {filteredApps.length === 0 && (
            <div className="text-center py-16">
              <p className="text-neutral-500">
                {searchQuery ? 'No apps match your search' : 'No apps in this category'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}