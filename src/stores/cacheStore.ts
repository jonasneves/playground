import { create } from 'zustand';

interface CacheEntry {
  content: string;
  sha: string;
  timestamp: number;
}

interface CacheState {
  cacheTimeout: number;
  getCache: (owner: string, repo: string, path: string) => CacheEntry | null;
  setCache: (owner: string, repo: string, path: string, content: string, sha: string) => void;
  clearCache: (owner: string, repo: string) => void;
  invalidateCache: (owner: string, repo: string, path: string) => void;
}

export const useCacheStore = create<CacheState>()((_, get) => ({
  cacheTimeout: 300000, // 5 minutes

  getCache: (owner, repo, path) => {
    const cacheKey = `gh_${owner}_${repo}_${path}`;
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    try {
      const entry: CacheEntry = JSON.parse(cached);
      if (Date.now() - entry.timestamp > get().cacheTimeout) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      return entry;
    } catch {
      return null;
    }
  },

  setCache: (owner, repo, path, content, sha) => {
    const cacheKey = `gh_${owner}_${repo}_${path}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        content,
        sha,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Cache storage failed:', e);
    }
  },

  clearCache: (owner, repo) => {
    const prefix = `gh_${owner}_${repo}_`;
    const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix));
    keys.forEach(key => localStorage.removeItem(key));
  },

  invalidateCache: (owner, repo, path) => {
    const cacheKey = `gh_${owner}_${repo}_${path}`;
    localStorage.removeItem(cacheKey);
  }
}));
