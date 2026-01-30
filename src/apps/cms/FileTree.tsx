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
            className={`dir-item ${isOpen ? 'open' : ''}`}
            style={{ paddingLeft: `${level * 16 + 16}px` }}
            onClick={() => toggleDirectory(item)}
          >
            <Folder size={16} />
            {item.name}
          </div>
          {isOpen && dirState.children.length > 0 && (
            <div className="dir-children">
              {dirState.children.map(child => renderItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={item.path}
        className={`file-item ${isSelected ? 'active' : ''}`}
        style={{ paddingLeft: `${level * 16 + 16}px` }}
        onClick={() => onFileSelect(item)}
      >
        <FileText size={16} />
        {item.name}
      </div>
    );
  };

  return (
    <div>
      {files.map(item => renderItem(item))}
    </div>
  );
}
