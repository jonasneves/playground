import { useState, useEffect } from 'react';
import { StatCard } from './StatCard';
import { useGitHubAPI } from '@/hooks';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { AppConfig } from '@/config/app';
import type { RepoStats } from './types';
import './dashboard.css';

export default function Dashboard() {
  const api = useGitHubAPI(AppConfig.repository.owner, AppConfig.repository.name);
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
      const [rootFiles, apps, shared] = await Promise.all([
        api.listDirectory(''),
        api.listDirectory('apps'),
        api.listDirectory('shared')
      ]);

      // Count items by type
      const appDirs = apps.filter((a: any) => a.type === 'dir');
      const sharedDirs = shared.filter((a: any) => a.type === 'dir');
      const rootFileCount = rootFiles.filter((f: any) => f.type === 'file').length;

      endTimer('data_load_ms');

      setStats({
        appCount: appDirs.length,
        utilCount: sharedDirs.length,
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
    `Repository contains ${stats.appCount} apps, ${stats.utilCount} shared modules, and ${stats.fileCount} root files. Last checked: ${stats.lastChecked.toLocaleString()}`;

  const handleBack = () => {
    window.parent.postMessage('close-app', '*');
  };

  if (isLoading) {
    return (
      <div>
        <div className="header">
          <h1>📊 Dashboard</h1>
          <p>Repository Statistics</p>
        </div>
        <div className="container">
          <div className="card">
            <p style={{ textAlign: 'center', color: '#718096' }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="header">
          <h1>📊 Dashboard</h1>
          <p>Repository Statistics</p>
        </div>
        <div className="container">
          <div className="card">
            <p style={{ color: '#ef4444' }}>Error: {error}</p>
            <button className="btn" onClick={loadStats} style={{ marginTop: '16px' }}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <h1>📊 Dashboard</h1>
        <p>Repository Statistics</p>
      </div>

      <div className="container">
        <div className="grid">
          <StatCard title="Applications" value={stats?.appCount || 0} />
          <StatCard title="Shared Utilities" value={stats?.utilCount || 0} />
          <StatCard title="Root Files" value={stats?.fileCount || 0} />
        </div>

        <div className="card">
          <h3>Recent Activity</h3>
          <p>{activityMessage}</p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button className="btn" onClick={handleBack}>
            ← Back to Gallery
          </button>
        </div>
      </div>
    </div>
  );
}
