# Technical Details

## Architecture

React-based launcher with lazy-loaded apps. All apps are stored in GitHub and loaded dynamically via the Contents API.

### Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build**: Vite with code splitting
- **Router**: React Router (hash-based for GitHub Pages)
- **State**: Zustand stores
- **Data**: GitHub Contents API with SWR caching
- **Auth**: GitHub OAuth via external service

## API Constraints

- **Rate Limit**: 5,000 API requests/hour per authenticated user
- **Storage**: Static files only (no backend)
- **Scale**: Designed for 1-10 users
- **Traffic**: Not suitable for public or high-traffic applications

## Performance

### Load Times
- First load: 1-2s
- Cached load: 100-200ms

### Optimizations
- localStorage cache (5min TTL) reduces API usage by ~90%
- Code splitting by route and vendor chunks
- Lazy loading for images and components
- Virtualized lists for large datasets
- RAF batching for rapid updates
- Memoization to prevent unnecessary re-renders

## Caching Strategy

### localStorage Cache
- Key format: `gh_{owner}_{repo}_{path}`
- TTL: 5 minutes
- Reduces GitHub API calls significantly

### Cache Invalidation
- Automatic on write operations
- Manual via Settings > Clear Cache
- Expiration after TTL

## Debug Commands

Open browser console:

```javascript
// View analytics
window.analytics?.getStats()

// View errors
window.errorTracker?.getErrors()

// Clear cache
window.repo?.clearCache()

// View storage usage
localStorage.length
Object.keys(localStorage).length
```

## Bundle Analysis

```bash
npm run analyze
```

Opens visualization of bundle composition and chunk sizes.
