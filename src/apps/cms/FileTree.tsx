import { useState } from 'react';
import { Folder, FileText } from 'lucide-react';
import type { FileNode } from './types';

interface FileTreeProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  selectedFile: FileNode | null;
  onLoadDirectory: (path: string) => Promise<FileNode[]>;
}

interface DirectoryState {
  [path: string]: {
    isOpen: boolean;
    children: FileNode[];
    isLoaded: boolean;
  };
}

export function FileTree({ files, onFileSelect, selectedFile, onLoadDirectory }: FileTreeProps) {
  const [directories, setDirectories] = useState<DirectoryState>({});

  const toggleDirectory = async (dir: FileNode) => {
    const currentState = directories[dir.path] || { isOpen: false, children: [], isLoaded: false };

    // Toggle open state
    if (currentState.isOpen) {
      setDirectories(prev => ({
        ...prev,
        [dir.path]: { ...currentState, isOpen: false }
      }));
      return;
    }

    // Load children if not loaded
    if (!currentState.isLoaded) {
      const children = await onLoadDirectory(dir.path);
      setDirectories(prev => ({
        ...prev,
        [dir.path]: { isOpen: true, children, isLoaded: true }
      }));
    } else {
      setDirectories(prev => ({
        ...prev,
        [dir.path]: { ...currentState, isOpen: true }
      }));
    }
  };

  const renderItem = (item: FileNode, level = 0) => {
    const isDir = item.type === 'dir';
    const dirState = directories[item.path];
    const isOpen = dirState?.isOpen || false;
    const isSelected = selectedFile?.path === item.path;

    if (isDir) {
      return (
        <div key={item.path}>
          <div
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-neutral-100 cursor-pointer text-sm text-neutral-700 transition-colors"
            style={{ paddingLeft: `${level * 16 + 16}px` }}
            onClick={() => toggleDirectory(item)}
          >
            <Folder size={16} className={isOpen ? 'text-brand-600' : ''} />
            <span className="font-medium">{item.name}</span>
          </div>
          {isOpen && dirState.children.length > 0 && (
            <div>
              {dirState.children.map(child => renderItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={item.path}
        className={`flex items-center gap-2 px-2 py-1.5 hover:bg-neutral-100 cursor-pointer text-sm transition-colors ${
          isSelected ? 'bg-brand-50 text-brand-700' : 'text-neutral-600'
        }`}
        style={{ paddingLeft: `${level * 16 + 16}px` }}
        onClick={() => onFileSelect(item)}
      >
        <FileText size={16} />
        <span>{item.name}</span>
      </div>
    );
  };

  return (
    <div>
      {files.map(item => renderItem(item))}
    </div>
  );
}
