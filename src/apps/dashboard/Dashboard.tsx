import { useState, useEffect } from 'react';
import { StatCard } from './StatCard';
import { useGitHubAPI } from '@/hooks';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { AppConfig } from '@/config/app';
import { useRepositoryStore } from '@/stores';
import type { RepoStats } from './types';

export default function Dashboard() {
  const { repository } = useRepositoryStore();
  const currentRepo = repository || AppConfig.repository;
  const api = useGitHubAPI(currentRepo.owner, currentRepo.name);
  const { startTimer, endTimer } = usePerformanceMonitor('dashboard');
  const [stats, setStats] = useState<RepoStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      startTimer('data_load_ms');

      // Load directories in parallel
      const [rootFiles, apps, srcFiles] = await Promise.all([
        api.listDirectory(''),
        api.listDirectory('apps'),
        api.listDirectory('src')
      ]);

      // Count items by type
      const appDirs = apps.filter((a: any) => a.type === 'dir');
      const srcDirs = srcFiles.filter((a: any) => a.type === 'dir');
      const rootFileCount = rootFiles.filter((f: any) => f.type === 'file').length;

      endTimer('data_load_ms');

      setStats({
        appCount: appDirs.length,
        utilCount: srcDirs.length,
        fileCount: rootFileCount,
        lastChecked: new Date()
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const activityMessage = !stats ? '' :
    `Repository contains ${stats.appCount} apps, ${stats.utilCount} source modules, and ${stats.fileCount} root files. Last checked: ${stats.lastChecked.toLocaleString()}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="bg-white border-b border-neutral-200 px-6 py-8 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900 mb-2">Dashboard</h1>
          <p className="text-neutral-600">Repository Statistics</p>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <p className="text-center text-neutral-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="bg-white border-b border-neutral-200 px-6 py-8 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900 mb-2">Dashboard</h1>
          <p className="text-neutral-600">Repository Statistics</p>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium text-sm transition-colors"
              onClick={loadStats}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <button
        onClick={loadStats}
        className="w-full bg-white border-b border-neutral-200 px-6 py-8 text-center hover:bg-neutral-50 transition-colors duration-100"
        title="Click to refresh"
      >
        <h1 className="text-3xl font-semibold text-neutral-900 mb-2">Dashboard</h1>
        <p className="text-neutral-600">Repository Statistics</p>
      </button>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Applications" value={stats?.appCount || 0} />
          <StatCard title="Source Modules" value={stats?.utilCount || 0} />
          <StatCard title="Root Files" value={stats?.fileCount || 0} />
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Recent Activity</h3>
          <p className="text-sm text-neutral-600 leading-relaxed">{activityMessage}</p>
        </div>

      </div>
    </div>
  );
}
