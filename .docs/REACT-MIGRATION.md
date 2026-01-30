# React Stack

## Setup

```bash
npm install
npm run dev  # http://localhost:5173/index-react.html
npm run build
```

## Structure

```
src/
├── apps/           # React apps (chat, cms, dashboard, file-browser)
├── components/     # OAuth, AppShell, UserMenu, AppCard
├── hooks/          # useGitHubAPI
├── stores/         # authStore, cacheStore, analyticsStore (Zustand)
├── config/app.ts   # App configuration
└── styles/
```

## State Management

Zustand with localStorage persistence:
- `useAuthStore` - token, user, authentication
- `useCacheStore` - 5min GitHub API cache
- `useAnalyticsStore` - event tracking

## GitHub API Hook

```typescript
const api = useGitHubAPI('owner', 'repo');
await api.getFile('path/to/file.txt');
await api.updateFile(path, content, sha, message);
await api.listDirectory('apps');
```

## Build

Bundle: 69KB gzipped (target: <150KB)

Manual chunks: vendor (React), ui (lucide-react), state (Zustand)
