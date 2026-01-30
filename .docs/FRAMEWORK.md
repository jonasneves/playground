# Framework

## Architecture

Framework (generic components) published to gh-pages. Implementation (apps, config) stays private.

```
gh-pages (public) → framework.es.js (10KB gzipped)
main (private) → apps, config, data
```

## Published Components

- `OAuth` - GitHub authentication
- `AppShell` - App gallery
- `AppCard`, `UserMenu` - UI components
- `createAuthStore()`, `createCacheStore()`, `createAnalyticsStore()` - State factories
- `createGitHubAPIHook()` - API integration factory

## Private Implementation

```typescript
// src/stores/index.ts
import { createAuthStore, createCacheStore } from '@/framework';
export const useAuthStore = createAuthStore('my-app-auth');
export const useCacheStore = createCacheStore(300000);

// src/App-impl.tsx
import { OAuth, AppShell } from '@/framework';
import { AppConfig } from '@/config/app';
import { useAuthStore } from '@/stores';

function App() {
  const { user, token, setAuth, logout } = useAuthStore();
  return (
    <OAuth oauthServiceUrl={AppConfig.oauth.serviceUrl} onAuthChange={setAuth} isAuthenticated={!!token}>
      <AppShell config={AppConfig} user={user} token={token} onLogout={logout} />
    </OAuth>
  );
}
```

## Build

```bash
npm run build              # Full app (local)
npm run build:framework    # Framework only (publish)
```

Framework deploys automatically when pushing changes to:
- `src/framework/**`
- `src/styles/**`
- `vite.config.framework.ts`

## API

### createAuthStore(storageKey?)

```typescript
{
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token, user) => void;
  logout: () => void;
}
```

### createCacheStore(cacheTimeout?)

```typescript
{
  getCache: (owner, repo, path) => CacheEntry | null;
  setCache: (owner, repo, path, content, sha) => void;
  clearCache: (owner, repo) => void;
  invalidateCache: (owner, repo, path) => void;
}
```

### createGitHubAPIHook(authStore, cacheStore)

```typescript
(owner, repo) => {
  getFile: (path) => Promise<GitHubFile>;
  updateFile: (path, content, sha, message?) => Promise<any>;
  createFile: (path, content, message?) => Promise<any>;
  deleteFile: (path, sha, message?) => Promise<any>;
  listDirectory: (path?) => Promise<GitHubDirectory[]>;
  getManifest: (appPath) => Promise<any>;
}
```

## Config Interface

```typescript
interface FrameworkConfig {
  repository: { owner: string; name: string };
  branding: { title: string; subtitle: string; theme: { primary: string; secondary: string } };
  features: { analytics: boolean; errorTracking: boolean; caching: boolean };
  api: { baseUrl: string; cacheTimeout: number };
  oauth: { serviceUrl: string };
}
```
