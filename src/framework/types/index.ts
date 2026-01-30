export interface FrameworkConfig {
  repository: {
    owner: string;
    name: string;
  };
  branding: {
    title: string;
    subtitle: string;
    theme: {
      primary: string;
      secondary: string;
    };
  };
  features: {
    analytics: boolean;
    errorTracking: boolean;
    caching: boolean;
  };
  api: {
    baseUrl: string;
    cacheTimeout: number;
  };
  oauth: {
    serviceUrl: string;
  };
}

export interface User {
  login: string;
  name: string;
  avatar_url: string;
  email?: string;
}

export interface AppManifest {
  name: string;
  description: string;
  thumbnail?: string;
  tech?: string[];
  minLauncherVersion?: string;
  reactRoute?: string; // If present, navigate to this route instead of iframe
}

export interface GitHubFile {
  content: string;
  sha: string;
  path: string;
  name?: string;
  size?: number;
}

export interface GitHubDirectory {
  name: string;
  path: string;
  type: 'file' | 'dir';
  sha: string;
}
