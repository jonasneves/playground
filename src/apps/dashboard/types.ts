export interface RepoStats {
  appCount: number;
  utilCount: number;
  fileCount: number;
  lastChecked: Date;
}

export interface StatCardProps {
  title: string;
  value: number | string;
}
