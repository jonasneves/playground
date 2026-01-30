import { useState, useEffect, useCallback } from 'react';
import { Breadcrumb } from './Breadcrumb';
import { VirtualFileList } from './VirtualFileList';
import { useGitHubAPI } from '@/hooks';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { AppConfig } from '@/config/app';
import { sortFiles } from './utils';
import type { FileItem } from './types';

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
      <div className="min-h-screen bg-neutral-50">
        <div className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-neutral-900">File Browser</h2>
          <button
            className="px-4 py-2 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 rounded-lg font-medium text-sm transition-colors"
            onClick={handleBack}
          >
            ← Back to Gallery
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="text-center text-neutral-500 py-8">Loading files...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-neutral-900">File Browser</h2>
          <button
            className="px-4 py-2 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 rounded-lg font-medium text-sm transition-colors"
            onClick={handleBack}
          >
            ← Back to Gallery
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="text-center text-red-600 py-8">
            Error: {error}
            <br />
            <button
              className="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium text-sm transition-colors"
              onClick={() => loadDirectory(currentPath)}
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
      <div className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-neutral-900">File Browser</h2>
        <button
          className="px-4 py-2 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 rounded-lg font-medium text-sm transition-colors"
          onClick={handleBack}
        >
          ← Back to Gallery
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb currentPath={currentPath} onNavigate={handleNavigate} />

        {isLoading ? (
          <div className="text-center text-neutral-500 py-8">Loading...</div>
        ) : files.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm">
            <div className="text-center text-neutral-400 py-8">This directory is empty</div>
          </div>
        ) : (
          <VirtualFileList files={files} onNavigate={handleNavigate} />
        )}
      </div>
    </div>
  );
}
