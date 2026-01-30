export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  sha: string;
  size?: number;
}

export interface FileData {
  content: string;
  sha: string;
  path: string;
  name?: string;
  size?: number;
}

export interface DirectoryItem extends FileNode {
  isOpen?: boolean;
  children?: DirectoryItem[];
}
