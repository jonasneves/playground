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
      className={`file-item ${isDir ? 'clickable' : ''}`}
      onClick={handleClick}
      style={style}
    >
      <span className="icon">{icon}</span>
      <span className="file-name">{file.name}</span>
      <span className="file-size">{size}</span>
    </div>
  );
});

FileListItem.displayName = 'FileListItem';
