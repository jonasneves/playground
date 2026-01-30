import { useState, useCallback, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { FileTree } from './FileTree';
import { Editor } from './Editor';
import { Preview } from './Preview';
import { useGitHubAPI } from '@/hooks';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { AppConfig } from '@/config/app';
import type { FileNode, FileData } from './types';
import './cms.css';

export default function CMSApp() {
  const api = useGitHubAPI(AppConfig.repository.owner, AppConfig.repository.name);
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
    window.parent.postMessage('close-app', '*');
  };

  const isMarkdown = currentFile?.path.endsWith('.md') || false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="header">
        <h2>Content Manager</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-success"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button className="btn" onClick={handleClose}>
            <X size={16} />
            Close
          </button>
        </div>
      </div>

      <div className="main">
        <div className="sidebar">
          <div className="sidebar-header">Repository Files</div>
          {isLoading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
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

        <div className="editor-area">
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
    </div>
  );
}
