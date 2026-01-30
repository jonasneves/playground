export function formatSize(bytes: number | undefined): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function sortFiles(files: any[]): any[] {
  return [...files].sort((a, b) => {
    // Directories first
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }
    return a.type === 'dir' ? -1 : 1;
  });
}
