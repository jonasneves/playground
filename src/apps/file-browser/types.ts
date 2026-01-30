export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  sha: string;
  size?: number;
}

export interface BreadcrumbPart {
  name: string;
  path: string;
}
