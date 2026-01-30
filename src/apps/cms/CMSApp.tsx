import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { FileTree } from './FileTree';
import { Editor } from './Editor';
import { Preview } from './Preview';
import { useGitHubAPI } from '@/hooks';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { AppConfig } from '@/config/app';
import { useRepositoryStore } from '@/stores';
import type { FileNode, FileData } from './types';

export default function CMSApp() {
  const navigate = useNavigate();
  const { repository } = useRepositoryStore();
  const currentRepo = repository || AppConfig.repository;
  const api = useGitHubAPI(currentRepo.owner, currentRepo.name);
  const { startTimer, endTimer } = usePerformanceMonitor('cms');
  const [rootFiles, setRootFiles] = useState<FileNode[]>([]);
  const [currentFile, setCurrentFile] = useState<FileData | null>(null);
  const [content, setContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const filterSystemFiles = useCallback((items: FileNode[]) =>
    items.filter(item => !item.name.startsWith('.') && item.name !== 'node_modules'),
  []);

  useEffect(() => {
    loadRootDirectory();
  }, []);

  const loadRootDirectory = async () => {
    try {
      setIsLoading(true);
      const items = await api.listDirectory('');
      setRootFiles(filterSystemFiles(items));
    } catch (error: any) {
      console.error('Error loading directory:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDirectory = useCallback(async (path: string): Promise<FileNode[]> => {
    try {
      const items = await api.listDirectory(path);
      return filterSystemFiles(items);
    } catch (error: any) {
      console.error('Error loading directory:', error);
      return [];
    }
  }, [api, filterSystemFiles]);

  const handleFileSelect = useCallback(async (file: FileNode) => {
    if (file.type === 'dir') return;

    if (isDirty) {
      if (!confirm('You have unsaved changes. Discard them?')) {
        return;
      }
    }

    try {
      const data = await api.getFile(file.path);
      setCurrentFile(data);
      setContent(data.content);
      setIsDirty(false);
    } catch (error: any) {
      alert(`Error loading file: ${error.message}`);
    }
  }, [api, isDirty]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!currentFile || !isDirty) return;

    setIsSaving(true);
    try {
      startTimer('save_latency_ms');
      const message = `Update ${currentFile.path.split('/').pop()}`;
      await api.updateFile(currentFile.path, content, currentFile.sha, message);

      // Refresh file data to get new SHA
      const updatedData = await api.getFile(currentFile.path);
      endTimer('save_latency_ms');

      setCurrentFile(updatedData);
      setIsDirty(false);

      alert('Saved successfully!');
    } catch (error: any) {
      alert(`Error saving: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [currentFile, content, isDirty, api, startTimer, endTimer]);

  const handleClose = () => {
    if (isDirty) {
      if (!confirm('You have unsaved changes. Close anyway?')) {
        return;
      }
    }
    navigate('/');
  };

  const isMarkdown = currentFile?.path.endsWith('.md') || false;

  return (
    <div className="flex flex-col h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <h2 className="text-2xl font-semibold text-neutral-900">Content Manager</h2>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white border-r border-neutral-200 overflow-y-auto">
          <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 font-medium text-sm text-neutral-700">
            Repository Files
          </div>
          {isLoading ? (
            <div className="p-5 text-center text-neutral-400">
              Loading...
            </div>
          ) : (
            <FileTree
              files={rootFiles}
              onFileSelect={handleFileSelect}
              selectedFile={currentFile ? { ...currentFile, type: 'file' } as FileNode : null}
              onLoadDirectory={loadDirectory}
            />
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          <Editor
            content={content}
            onChange={handleContentChange}
            disabled={!currentFile}
          />

          <Preview
            content={content}
            isMarkdown={isMarkdown}
          />
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 z-40">
        <button
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium text-sm transition-colors shadow-lg disabled:bg-neutral-300 disabled:cursor-not-allowed"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 rounded-lg font-medium text-sm transition-colors shadow-lg"
          onClick={handleClose}
        >
          <X size={16} />
          Close
        </button>
      </div>
    </div>
  );
}
