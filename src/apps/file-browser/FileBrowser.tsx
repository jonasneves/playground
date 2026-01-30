import { useState, useEffect, useCallback } from 'react';
import { Breadcrumb } from './Breadcrumb';
import { VirtualFileList } from './VirtualFileList';
import { useGitHubAPI } from '@/hooks';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { AppConfig } from '@/config/app';
import { sortFiles } from './utils';
import type { FileItem } from './types';
import './file-browser.css';

export default function FileBrowser() {
  const api = useGitHubAPI(AppConfig.repository.owner, AppConfig.repository.name);
  const { startTimer, endTimer } = usePerformanceMonitor('file-browser');
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  const loadDirectory = async (path: string) => {
    try {
      setIsLoading(true);
      setError(null);

      startTimer('directory_load_ms');
      const items = await api.listDirectory(path);
      const sortedFiles = sortFiles(items);
      endTimer('directory_load_ms');

      setFiles(sortedFiles);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = useCallback((path: string) => {
    setCurrentPath(path);
  }, []);

  const handleBack = () => {
    window.parent.postMessage('close-app', '*');
  };

  if (isLoading && files.length === 0) {
    return (
      <div>
        <div className="header">
          <h2>📁 File Browser</h2>
          <button className="btn" onClick={handleBack}>
            ← Back to Gallery
          </button>
        </div>
        <div className="container">
          <div className="loading">Loading files...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="header">
          <h2>📁 File Browser</h2>
          <button className="btn" onClick={handleBack}>
            ← Back to Gallery
          </button>
        </div>
        <div className="container">
          <div className="loading" style={{ color: '#ef4444' }}>
            Error: {error}
            <br />
            <button
              className="btn"
              onClick={() => loadDirectory(currentPath)}
              style={{ marginTop: '16px', background: '#667eea', color: 'white' }}
            >
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
        <h2>📁 File Browser</h2>
        <button className="btn" onClick={handleBack}>
          ← Back to Gallery
        </button>
      </div>

      <div className="container">
        <Breadcrumb currentPath={currentPath} onNavigate={handleNavigate} />

        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : files.length === 0 ? (
          <div className="file-list">
            <div className="empty-state">This directory is empty</div>
          </div>
        ) : (
          <VirtualFileList files={files} onNavigate={handleNavigate} />
        )}
      </div>
    </div>
  );
}
