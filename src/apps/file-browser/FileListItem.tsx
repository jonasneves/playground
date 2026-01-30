import { memo } from 'react';
import { Folder, FileText } from 'lucide-react';
import type { FileItem } from './types';
import { formatSize } from './utils';

interface FileListItemProps {
  file: FileItem;
  onNavigate: (path: string) => void;
  style?: React.CSSProperties;
}

export const FileListItem = memo(({ file, onNavigate, style }: FileListItemProps) => {
  const isDir = file.type === 'dir';
  const icon = isDir ? <Folder size={20} /> : <FileText size={20} />;
  const size = isDir ? '' : formatSize(file.size);

  const handleClick = () => {
    if (isDir) {
      onNavigate(file.path);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b border-neutral-100 last:border-b-0 ${
        isDir ? 'cursor-pointer hover:bg-neutral-50 transition-colors' : ''
      }`}
      onClick={handleClick}
      style={style}
    >
      <span className={`flex-shrink-0 ${isDir ? 'text-brand-600' : 'text-neutral-400'}`}>
        {icon}
      </span>
      <span className="flex-1 text-sm text-neutral-900 truncate">{file.name}</span>
      {size && <span className="flex-shrink-0 text-xs text-neutral-500">{size}</span>}
    </div>
  );
});

FileListItem.displayName = 'FileListItem';
