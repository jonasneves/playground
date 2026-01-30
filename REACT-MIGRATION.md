# React Migration Guide

## Overview

This project is being migrated from vanilla JavaScript to React in 4 phases. The migration maintains GitHub Pages compatibility and includes performance optimizations from the serverless-llm project.

## Current Status: Phase 1 Complete ✓

Phase 1 establishes the React foundation with a hybrid architecture that supports both React components and legacy iframe apps.

### What Works Now

- React build system with Vite
- TypeScript support
- Zustand state management (auth, cache, analytics)
- GitHub API integration via hooks
- OAuth authentication flow
- App launcher with iframe support
- User menu and keyboard shortcuts
- Build output under 70KB gzipped

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:5173/index-react.html
```

### Building

```bash
# Production build
npm run build

# Analyze bundle size
npm run analyze

# Preview production build
npm run preview
```

## Architecture

### Directory Structure

```
src/
├── apps/               # React app components (Phase 2+)
├── components/         # Shared UI components
│   ├── OAuth.tsx      # GitHub OAuth integration
│   ├── UserMenu.tsx   # User dropdown menu
│   ├── AppCard.tsx    # App gallery cards
│   └── AppShell.tsx   # Main launcher shell
├── hooks/
│   └── useGitHubAPI.ts  # GitHub API integration
├── stores/
│   ├── authStore.ts     # Authentication state
│   ├── cacheStore.ts    # API cache layer
│   └── analyticsStore.ts # Event tracking
├── config/
│   └── app.ts          # App configuration
├── utils/
├── workers/            # Web Workers (Phase 2+)
└── styles/
    └── global.css      # Global styles
```

### Key Technologies

- **Vite** - Build tool (fast HMR, native ESM)
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management (1KB vs Redux 7KB)
- **SWR** - Data fetching with caching (planned)
- **Lucide React** - Icons

### State Management

#### Auth Store (Zustand + localStorage)
```typescript
const { token, user, isAuthenticated, setAuth, logout } = useAuthStore();
```

#### Cache Store (Zustand + localStorage)
```typescript
const { getCache, setCache, clearCache, invalidateCache } = useCacheStore();
```

#### Analytics Store
```typescript
const { track, logError, trackMetric } = useAnalyticsStore();
```

### GitHub API Hook

```typescript
const api = useGitHubAPI('owner', 'repo');

// Get file
const file = await api.getFile('path/to/file.txt');

// Update file
await api.updateFile('path/to/file.txt', content, sha, 'Commit message');

// List directory
const files = await api.listDirectory('apps');

// Get app manifest
const manifest = await api.getManifest('apps/chat');
```

## OAuth Flow

1. User loads app at capstone.neevs.io
2. OAuth component loads github-auth.js from oauth.neevs.io
3. If not authenticated, shows "Sign in with GitHub" button
4. On successful auth, stores token and user in authStore
5. Token persists in localStorage for subsequent visits

## Deployment

### GitHub Actions

The workflow in `.github/workflows/deploy-react.yml`:
1. Builds React app with Vite
2. Renames `index-react.html` to `index.html`
3. Copies legacy apps and shared folders
4. Deploys to gh-pages branch
5. Accessible at capstone.neevs.io

### Manual Deployment

```bash
npm run build
mv dist/index-react.html dist/index.html
cp -r apps dist/
cp -r shared dist/
# Push dist/ to gh-pages branch
```

## Phase 2 Plan: App Conversions

Convert legacy apps to React with performance optimizations:

### 1. Chat App
- Implement RAF batching via `useStreamAccumulator`
- Virtual scrolling for 100+ messages
- Target: 450ms → <85ms (5.3x faster)

### 2. CMS App
- Web Worker for markdown parsing
- Debounce preview updates (300ms)
- Target: 120ms → <15ms per keystroke (8x)

### 3. Dashboard
- Straightforward React conversion
- Use `useMemo` for computed stats

### 4. File Browser
- Virtual list for large directories
- React-window integration

## Performance Targets

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Initial bundle | 54KB | <150KB gzipped | ✓ 69KB |
| Time to interactive | 1.2s | <1.5s | TBD |
| Chat: 100 messages | 450ms | <85ms | Phase 2 |
| CMS: Markdown parse | 120ms | <15ms | Phase 2 |

## Migration Phases

- [x] **Phase 1**: Foundation & Build Setup
  - [x] Vite + React + TypeScript setup
  - [x] Directory structure
  - [x] Core hooks and stores
  - [x] AppShell with iframe support
  - [x] OAuth integration
  - [x] Build configuration
  - [x] GitHub Actions deployment

- [ ] **Phase 2**: High-Impact App Conversions
  - [ ] Chat app with RAF batching
  - [ ] CMS app with Web Worker
  - [ ] Dashboard conversion
  - [ ] File browser with virtualization

- [ ] **Phase 3**: Infrastructure & Monitoring
  - [ ] Performance monitoring hooks
  - [ ] Error boundaries
  - [ ] Lazy loading with Suspense
  - [ ] Bundle optimization

- [ ] **Phase 4**: Polish & Cleanup
  - [ ] Remove legacy code
  - [ ] Final optimizations
  - [ ] Documentation updates

## Testing

### Phase 1 Checklist
- [x] TypeScript compilation
- [x] Vite build completes
- [x] Bundle size under 150KB gzipped
- [ ] OAuth flow (requires deployment)
- [ ] Load legacy iframe apps (requires deployment)
- [ ] localStorage persistence (requires deployment)
- [ ] GitHub API calls (requires deployment)

## Troubleshooting

### Build Errors

If TypeScript compilation fails:
```bash
npm run build 2>&1 | grep error
```

### OAuth Issues

The OAuth script must load from oauth.neevs.io with SRI:
```typescript
script.integrity = 'sha384-yCvoyjf6LKk2Yc6oSRenxRV0yFNdjeQ5ANuXIcRN50VoX/X8S4YJ9mU2+cT9MGW1';
```

### Cache Issues

Clear all caches:
```typescript
useCacheStore.getState().clearCache('jonasneves', 'duke-capstone');
localStorage.clear();
```

## Contributing

When adding new features:
1. Follow the existing directory structure
2. Use TypeScript for type safety
3. Store state in Zustand stores
4. Cache GitHub API calls
5. Track important events with analytics store
6. Keep bundle size under budget

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Migration Plan](./MIGRATION-STATUS.md)
