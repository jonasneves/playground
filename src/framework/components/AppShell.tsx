import { useState, useEffect, useRef, useCallback } from 'react';
import { Rocket, Search, X } from 'lucide-react';
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

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden animate-pulse">
    <div className="w-full h-20 bg-gradient-to-br from-neutral-100 to-neutral-50" />
    <div className="p-4">
      <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-neutral-200 rounded w-full mb-1" />
      <div className="h-3 bg-neutral-200 rounded w-2/3 mb-3" />
      <div className="flex gap-1.5 mb-3">
        <div className="h-5 bg-neutral-200 rounded-full w-12" />
        <div className="h-5 bg-neutral-200 rounded-full w-16" />
      </div>
      <div className="h-8 bg-neutral-200 rounded-lg w-full" />
    </div>
  </div>
);

const ShortcutsDialog = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <h2 className="text-xl font-semibold text-neutral-900 mb-4">Keyboard Shortcuts</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-neutral-600">Start typing</span>
          <kbd className="bg-neutral-100 text-neutral-900 px-2 py-1 rounded text-sm font-mono">Any key</kbd>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-600">Clear search</span>
          <kbd className="bg-neutral-100 text-neutral-900 px-2 py-1 rounded text-sm font-mono">Esc</kbd>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-600">Navigate apps</span>
          <div className="flex gap-1">
            <kbd className="bg-neutral-100 text-neutral-900 px-2 py-1 rounded text-sm font-mono">↑</kbd>
            <kbd className="bg-neutral-100 text-neutral-900 px-2 py-1 rounded text-sm font-mono">↓</kbd>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-600">Launch app</span>
          <kbd className="bg-neutral-100 text-neutral-900 px-2 py-1 rounded text-sm font-mono">Enter</kbd>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-600">Show shortcuts</span>
          <kbd className="bg-neutral-100 text-neutral-900 px-2 py-1 rounded text-sm font-mono">?</kbd>
        </div>
      </div>
      <button
        onClick={onClose}
        className="mt-6 w-full bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-lg font-medium transition-colors"
      >
        Close
      </button>
    </div>
  </div>
);

const Header = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <header className="pt-6 pb-8">
    <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2 mb-1">
      <Rocket className="text-brand-600" size={24} />
      {title}
    </h1>
    <p className="text-sm text-neutral-600">
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

interface AppsRegistry {
  version: string;
  generated: string;
  apps: AppData[];
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedAppIndex, setSelectedAppIndex] = useState(-1);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [recentApps, setRecentApps] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadApps() {
      try {
        const response = await fetch('/apps-registry.json');
        if (!response.ok) {
          throw new Error('Failed to load apps registry');
        }
        const registry: AppsRegistry = await response.json();
        setApps(registry.apps);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    loadApps();
    const stored = localStorage.getItem('recentApps');
    if (stored) {
      setRecentApps(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setSelectedAppIndex(-1);
  }, [debouncedSearch, filter]);

  const handleAppLaunch = useCallback((appPath: string, appName: string) => {
    onTrack?.('app_launch', { appName, appPath });
    const manifest = apps.find(app => app.path === appPath)?.manifest;
    if (manifest?.reactRoute && onNavigate) {
      onNavigate(manifest.reactRoute);
    }

    const updated = [appName, ...recentApps.filter(name => name !== appName)].slice(0, 5);
    setRecentApps(updated);
    localStorage.setItem('recentApps', JSON.stringify(updated));
  }, [apps, onTrack, onNavigate, recentApps]);

  function handleClearSearch(): void {
    setSearchQuery('');
    searchInputRef.current?.focus();
  }

  const filteredApps = (() => {
    const filtered = apps.filter(app => {
      const category = APP_CATEGORIES[app.name];
      const matchesCategory = filter === 'all' || category === filter;

      if (!debouncedSearch) return matchesCategory;

      const query = debouncedSearch.toLowerCase();
      const matchesSearch =
        app.name.toLowerCase().includes(query) ||
        app.manifest?.description?.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });

    if (!debouncedSearch && recentApps.length > 0) {
      return filtered.sort((a, b) => {
        const aIndex = recentApps.indexOf(a.name);
        const bIndex = recentApps.indexOf(b.name);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }

    return filtered;
  })();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (e.key === 'Escape') {
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
        if (isInputFocused) {
          setSearchQuery('');
          searchInputRef.current?.blur();
          setSelectedAppIndex(-1);
          return;
        }
      }

      if (e.key === '?' && !isInputFocused && !e.shiftKey) {
        setShowShortcuts(true);
        return;
      }

      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !isInputFocused) {
        e.preventDefault();
        setSelectedAppIndex(prev => {
          if (e.key === 'ArrowDown') {
            return prev < filteredApps.length - 1 ? prev + 1 : prev;
          } else {
            return prev > 0 ? prev - 1 : -1;
          }
        });
        return;
      }

      if (e.key === 'Enter' && selectedAppIndex >= 0 && !isInputFocused) {
        e.preventDefault();
        const app = filteredApps[selectedAppIndex];
        if (app) {
          handleAppLaunch(app.path, app.name);
        }
        return;
      }

      if (!isInputFocused && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        searchInputRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showShortcuts, selectedAppIndex, filteredApps, handleAppLaunch]);

  if (loading && apps.length === 0) {
    return (
      <div className="relative min-h-screen">
        <BackgroundGlow />
        <UserMenu user={user} onLogout={onLogout} onClearCache={onClearCache} />
        <div className="relative z-10 container pt-4 pb-20">
          <Header title={config.branding.title} subtitle={config.branding.subtitle} />
          <div className="mb-8 flex justify-center">
            <div className="h-12 bg-neutral-100 rounded-xl w-full max-w-md animate-pulse" />
          </div>
          <div className="grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
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
      <div className="relative z-10 container pt-4 pb-20">
        <Header title={config.branding.title} subtitle={config.branding.subtitle} />
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Type to search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search apps"
                className="w-full pl-12 pr-10 py-3 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
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

          <div className="flex items-center justify-between text-sm" role="region" aria-live="polite" aria-atomic="true">
            <p className="text-neutral-600">
              {filteredApps.length} {filteredApps.length === 1 ? 'app' : 'apps'}
            </p>
            {!debouncedSearch && recentApps.length > 0 && (
              <p className="text-xs text-neutral-500">Recently used shown first</p>
            )}
          </div>
        </div>

          <div className="grid" role="region" aria-label="Applications">
            {filteredApps.map((app, index) => (
              <AppCard
                key={app.name}
                appName={app.name}
                manifest={app.manifest}
                path={app.path}
                onLaunch={handleAppLaunch}
                isSelected={index === selectedAppIndex}
                searchTerm={debouncedSearch}
              />
            ))}
          </div>

        {filteredApps.length === 0 && (
          <div className="text-center py-16">
            <p className="text-neutral-600 text-lg mb-2">No apps found</p>
            <p className="text-neutral-500 text-sm">
              {debouncedSearch ? (
                <>
                  Try adjusting your search or{' '}
                  <button
                    onClick={() => setFilter('all')}
                    className="text-brand-600 hover:text-brand-700 underline"
                  >
                    view all categories
                  </button>
                </>
              ) : (
                'No apps in this category'
              )}
            </p>
          </div>
        )}
      </div>
      {showShortcuts && <ShortcutsDialog onClose={() => setShowShortcuts(false)} />}
    </div>
  );
}