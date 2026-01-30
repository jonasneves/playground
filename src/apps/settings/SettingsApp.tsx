import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, GitBranch, Package } from 'lucide-react';
import { useAuthStore, useCacheStore, useAnalyticsStore, useRepositoryStore } from '@/stores';
import { AppConfig } from '@/config/app';
import { RepositorySelector } from '@/framework';

function SettingCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
      <h2 className="text-base font-semibold text-neutral-700">{title}</h2>
      {children}
    </div>
  );
}

function SettingRow({
  label,
  value,
  action
}: {
  label: string;
  value?: string;
  action?: { label: string; onClick: () => void; variant?: 'default' | 'danger' };
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-b-0">
      <span className="text-sm text-neutral-600">{label}</span>
      {value && <span className="text-sm text-neutral-900 font-medium">{value}</span>}
      {action && (
        <button
          onClick={action.onClick}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            action.variant === 'danger'
              ? 'text-red-600 hover:bg-red-50'
              : 'text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

function StorageBar({ label, used, total, unit = 'KB' }: { label: string; used: number; total: number; unit?: string }) {
  const percentage = Math.min((used / total) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-600">{label}</span>
        <span className="text-neutral-900 font-medium">
          {used.toFixed(1)} {unit} / {total.toFixed(1)} {unit}
        </span>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-600 rounded-full transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function SettingsApp() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { clearCache } = useCacheStore();
  const { metrics } = useAnalyticsStore();
  const { repository, setRepository } = useRepositoryStore();
  const [showRepoSelector, setShowRepoSelector] = useState(false);

  const currentRepo = repository || AppConfig.repository;

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/');
    }
  };

  const handleClearCache = () => {
    if (confirm('Clear all cached data? This will reload the page.')) {
      clearCache(currentRepo.owner, currentRepo.name);
      window.location.reload();
    }
  };

  const handleClearAllData = () => {
    if (confirm('Delete all local data including todos, chat history, and cache? This cannot be undone.')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  // Calculate storage usage (memoized to avoid blocking UI on every render)
  const storageUsed = useMemo(() => {
    let total = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total / 1024; // Convert to KB
  }, []); // Empty deps - only calculate once per mount

  const storageLimit = 5 * 1024; // 5MB typical limit

  return (
    <div className="min-h-screen bg-neutral-50">
      {showRepoSelector && (
        <RepositorySelector
          onSelect={(repo) => {
            setRepository(repo);
            setShowRepoSelector(false);
            window.location.reload();
          }}
          currentRepository={repository}
          userLogin={user?.login}
        />
      )}

      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
            <SettingsIcon className="text-brand-600" size={22} />
          </div>
          <h1 className="text-xl font-semibold text-neutral-900">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* User Profile */}
        <SettingCard title="Profile">
          <div className="flex items-center gap-4 py-2">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.login}
                loading="lazy"
                className="w-16 h-16 rounded-full ring-2 ring-neutral-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.login?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-lg font-semibold text-neutral-900">{user?.name || user?.login}</div>
              <div className="text-sm text-neutral-500">{user?.email || `@${user?.login}`}</div>
            </div>
          </div>
        </SettingCard>

        {/* Repository Info */}
        <SettingCard title="Repository">
          <SettingRow
            label={<span className="flex items-center gap-2"><Package size={14} />Owner</span> as any}
            value={currentRepo.owner}
          />
          <SettingRow
            label={<span className="flex items-center gap-2"><GitBranch size={14} />Repository</span> as any}
            value={currentRepo.name}
          />
          <SettingRow
            label="Change Repository"
            action={{
              label: 'Edit',
              onClick: () => setShowRepoSelector(true)
            }}
          />
          <SettingRow
            label="Version"
            value={AppConfig.version}
          />
        </SettingCard>

        {/* Storage */}
        <SettingCard title="Storage">
          <StorageBar
            label="Data Usage"
            used={storageUsed}
            total={storageLimit}
            unit="KB"
          />
          <SettingRow
            label="Cache"
            action={{
              label: 'Clear Cache',
              onClick: handleClearCache
            }}
          />
          <SettingRow
            label="Performance Metrics"
            value={`${Object.keys(metrics).length} tracked`}
          />
        </SettingCard>

        {/* Developer */}
        <SettingCard title="Developer">
          <SettingRow
            label="GitHub Token"
            value="••••••••••••••••"
          />
          <SettingRow
            label="Analytics"
            value={AppConfig.features.analytics ? 'Enabled' : 'Disabled'}
          />
          <SettingRow
            label="Error Tracking"
            value={AppConfig.features.errorTracking ? 'Enabled' : 'Disabled'}
          />
        </SettingCard>

        {/* Account Actions */}
        <SettingCard title="Account">
          <SettingRow
            label="Log out of your account"
            action={{
              label: 'Log Out',
              onClick: handleLogout
            }}
          />
          <SettingRow
            label="Delete all local data"
            action={{
              label: 'Delete',
              onClick: handleClearAllData,
              variant: 'danger'
            }}
          />
        </SettingCard>
      </div>
    </div>
  );
}
