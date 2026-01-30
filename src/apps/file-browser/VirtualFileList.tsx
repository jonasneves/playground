import { useRef, useState, useEffect } from 'react';
import { FileListItem } from './FileListItem';
import type { FileItem } from './types';

interface VirtualFileListProps {
  files: FileItem[];
  onNavigate: (path: string) => void;
}

const ITEM_HEIGHT = 56; // Height of each file item in pixels
const OVERSCAN = 5; // Number of items to render outside viewport

export function VirtualFileList({ files, onNavigate }: VirtualFileListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  // Update container height on mount and resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Calculate visible range
  const totalHeight = files.length * ITEM_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    files.length,
    Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
  );

  const visibleFiles = files.slice(startIndex, endIndex);

  // For lists under 100 items, just render all (no virtualization needed)
  if (files.length < 100) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {files.map((file) => (
          <FileListItem
            key={file.path}
            file={file}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    );
  }

  // Virtual scrolling for large lists
  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-auto"
      onScroll={handleScroll}
      style={{ height: '600px' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleFiles.map((file, index) => {
          const actualIndex = startIndex + index;
          return (
            <FileListItem
              key={file.path}
              file={file}
              onNavigate={onNavigate}
              style={{
                position: 'absolute',
                top: actualIndex * ITEM_HEIGHT,
                left: 0,
                right: 0,
                height: ITEM_HEIGHT
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
