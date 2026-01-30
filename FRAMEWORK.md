# Prototype Gallery Framework

## Overview

The React migration has been structured to separate **generic, reusable building blocks** (framework) from **private implementation details** (your apps and configuration).

This approach allows:
- Publishing only the framework to gh-pages (public)
- Keeping sensitive logic and data in the private repo
- Reusability of the framework for other projects
- Clean separation of concerns

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ gh-pages (Public)                                       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Framework (10 KB gzipped)                       │  │
│  │                                                 │  │
│  │  • OAuth component                              │  │
│  │  • AppShell component                           │  │
│  │  • UserMenu, AppCard components                 │  │
│  │  • createAuthStore()                            │  │
│  │  • createCacheStore()                           │  │
│  │  • createGitHubAPIHook()                        │  │
│  │  • Global styles                                │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ▲
                           │ imports framework
                           │
┌──────────────────────────┴──────────────────────────────┐
│ main branch (Private Repo)                              │
│                                                          │
│  ┌───────────────────┐  ┌───────────────────────────┐  │
│  │ Your Config       │  │ Your Apps                 │  │
│  │                   │  │                           │  │
│  │  • Repository     │  │  • Chat App               │  │
│  │    owner/name     │  │  • CMS App                │  │
│  │  • Branding       │  │  • Dashboard              │  │
│  │  • API endpoints  │  │  • File Browser           │  │
│  │  • Analytics      │  │  • Business logic         │  │
│  └───────────────────┘  └───────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## What's Published to gh-pages

### Framework Build (10 KB gzipped)
```
framework.es.js       # ES Module build
framework.umd.js      # UMD build
styles/global.css     # Default styles
README.md             # Usage documentation
index.html            # Framework landing page
```

### Components Included
- `OAuth` - Generic GitHub authentication
- `AppShell` - Configurable app gallery
- `AppCard` - App display cards
- `UserMenu` - User dropdown menu

### Utilities Included
- `createAuthStore()` - Authentication state factory
- `createCacheStore()` - API caching factory
- `createAnalyticsStore()` - Event tracking factory
- `createGitHubAPIHook()` - GitHub API integration factory

### Types Included
- `FrameworkConfig` - Configuration interface
- `User` - User object type
- `AppManifest` - App metadata type
- `GitHubFile`, `GitHubDirectory` - GitHub API types

## What Stays Private

### Configuration (`src/config/app.ts`)
```typescript
export const AppConfig = {
  repository: {
    owner: 'jonasneves',  // Private
    name: 'duke-capstone' // Private
  },
  // ... other sensitive config
};
```

### Apps (`src/apps/`)
- Chat app implementation
- CMS app implementation
- Dashboard implementation
- File browser implementation
- All business logic
- Algorithms and data structures

### Store Instances (`src/stores/index.ts`)
```typescript
// Your configured store instances
export const useAuthStore = createAuthStore('auth-storage');
export const useCacheStore = createCacheStore(300000);
export const useAnalyticsStore = createAnalyticsStore({ enabled: true });
```

## Usage in Your Private Repo

### 1. Import Framework
```typescript
import {
  OAuth,
  AppShell,
  createAuthStore,
  createCacheStore,
  createGitHubAPIHook
} from '@/framework';
```

### 2. Create Store Instances
```typescript
// src/stores/index.ts
import { createAuthStore, createCacheStore } from '@/framework';
import { AppConfig } from '@/config/app';

export const useAuthStore = createAuthStore('my-app-auth');
export const useCacheStore = createCacheStore(AppConfig.api.cacheTimeout);
```

### 3. Create API Hook
```typescript
// src/hooks/index.ts
import { createGitHubAPIHook } from '@/framework';
import { useAuthStore, useCacheStore } from '@/stores';

export const useGitHubAPI = createGitHubAPIHook(
  useAuthStore.getState(),
  useCacheStore.getState()
);
```

### 4. Use in Your App
```typescript
// src/App-impl.tsx
import { OAuth, AppShell } from '@/framework';
import { useAuthStore, useCacheStore } from '@/stores';
import { useGitHubAPI } from '@/hooks';
import { AppConfig } from '@/config/app';

function App() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
  const { clearCache } = useCacheStore();

  return (
    <OAuth
      oauthServiceUrl={AppConfig.oauth.serviceUrl}
      onAuthChange={(token, user) => {
        if (token && user) setAuth(token, user);
      }}
      isAuthenticated={isAuthenticated}
    >
      <AppShell
        config={AppConfig}
        user={user}
        token={token}
        useGitHubAPI={useGitHubAPI}
        onLogout={logout}
        onClearCache={() => clearCache(AppConfig.repository.owner, AppConfig.repository.name)}
      />
    </OAuth>
  );
}
```

## Building

### Build Everything (Local Development)
```bash
npm run build
```

### Build Framework Only (For Publishing)
```bash
npm run build:framework
```

### Build Both
```bash
npm run build:all
```

## Deployment

### Automatic via GitHub Actions

The workflow deploys **only the framework** to gh-pages when you push changes to:
- `src/framework/**`
- `src/styles/**`
- `vite.config.framework.ts`

**What gets deployed:**
1. Framework build (`framework.es.js`, `framework.umd.js`)
2. Global styles (`styles/global.css`)
3. Landing page with documentation
4. README with usage examples

**What does NOT get deployed:**
- Your apps (`src/apps/`)
- Your configuration (`src/config/app.ts`)
- Store instances (`src/stores/`)
- Hook instances (`src/hooks/`)
- Any sensitive data

### Manual Deployment

```bash
# Build framework
npm run build:framework

# Deploy dist-framework/ to gh-pages
npx gh-pages -d dist-framework
```

## Framework API Reference

### Components

#### OAuth
```typescript
interface OAuthProps {
  children: React.ReactNode;
  oauthServiceUrl: string;
  onAuthChange: (token: string | null, user: User | null) => void;
  isAuthenticated: boolean;
}
```

#### AppShell
```typescript
interface AppShellProps {
  config: FrameworkConfig;
  user: User | null;
  token: string | null;
  useGitHubAPI: (owner: string, repo: string) => GitHubAPIHook;
  onLogout: () => void;
  onClearCache: () => void;
  onTrack?: (event: string, data?: Record<string, any>) => void;
}
```

#### UserMenu
```typescript
interface UserMenuProps {
  user: User | null;
  onLogout: () => void;
  onClearCache: () => void;
}
```

#### AppCard
```typescript
interface AppCardProps {
  appName: string;
  manifest: AppManifest | null;
  path: string;
  onLaunch: (path: string, name: string) => void;
  version?: string;
}
```

### Store Creators

#### createAuthStore
```typescript
function createAuthStore(storageKey?: string): StoreApi<AuthState>

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}
```

#### createCacheStore
```typescript
function createCacheStore(cacheTimeout?: number): StoreApi<CacheState>

interface CacheState {
  getCache: (owner: string, repo: string, path: string) => CacheEntry | null;
  setCache: (owner: string, repo: string, path: string, content: string, sha: string) => void;
  clearCache: (owner: string, repo: string) => void;
  invalidateCache: (owner: string, repo: string, path: string) => void;
}
```

#### createAnalyticsStore
```typescript
function createAnalyticsStore(options?: {
  enabled: boolean;
  maxEvents: number;
}): StoreApi<AnalyticsState>

interface AnalyticsState {
  track: (type: string, data?: Record<string, any>) => void;
  logError: (error: ErrorLog) => void;
  trackMetric: (app: string, metric: string, value: number) => void;
  getMetrics: (app: string) => MetricEntry[];
}
```

### Hook Creators

#### createGitHubAPIHook
```typescript
function createGitHubAPIHook(
  authStore: AuthStore,
  cacheStore: CacheStore
): (owner: string, repo: string) => GitHubAPIHook

interface GitHubAPIHook {
  getFile: (path: string) => Promise<GitHubFile>;
  updateFile: (path: string, content: string, sha: string, message?: string) => Promise<any>;
  createFile: (path: string, content: string, message?: string) => Promise<any>;
  deleteFile: (path: string, sha: string, message?: string) => Promise<any>;
  listDirectory: (path?: string) => Promise<GitHubDirectory[]>;
  getManifest: (appPath: string) => Promise<any>;
}
```

## Configuration Interface

```typescript
interface FrameworkConfig {
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
```

## Security Benefits

### Separation of Concerns
- **Public**: Generic, reusable code
- **Private**: Sensitive data and implementation

### No Hardcoded Secrets
- Repository credentials passed via configuration
- OAuth tokens managed by external service
- API keys never in framework code

### Minimal Attack Surface
- Framework has no knowledge of your apps
- Apps loaded dynamically from private repo via GitHub API
- Authentication required to access any app

## Performance

### Framework Bundle
- **ES Module**: 33 KB uncompressed, 10 KB gzipped
- **UMD**: 22 KB uncompressed, 9 KB gzipped
- **Styles**: 3 KB

### External Dependencies (not bundled)
- React (must be provided by consumer)
- React DOM (must be provided by consumer)
- Zustand (bundled in framework)
- Lucide React (bundled in framework)

## Versioning

Framework follows semantic versioning. Breaking changes to the API will increment the major version.

Current version: 1.0.0 (as of Phase 1)

## Next Steps

With the framework published to gh-pages, you can:

1. **Use it locally** - Import from `@/framework` in your private repo
2. **Share it** - Others can import from `https://capstone.neevs.io/framework.es.js`
3. **Extend it** - Add new generic components to `src/framework/`
4. **Version it** - Tag releases and update framework independently

## Example: Using the Published Framework

```html
<!DOCTYPE html>
<html>
<head>
  <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@19",
        "react-dom": "https://esm.sh/react-dom@19",
        "framework": "https://capstone.neevs.io/framework.es.js"
      }
    }
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import { createRoot } from 'react-dom';
    import { OAuth, AppShell, createAuthStore } from 'framework';

    const authStore = createAuthStore();
    // ... rest of your app
  </script>
</body>
</html>
```

## Contributing to the Framework

When adding features to the framework:

1. Add code to `src/framework/`
2. Keep it generic and configurable
3. Accept configuration via props or factory parameters
4. Document the API in this file
5. Test with your implementation
6. Push to trigger GitHub Actions deployment

## License

ISC
