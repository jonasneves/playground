# Duke Capstone

Private prototype gallery with GitHub OAuth authentication.

## Architecture

Public gh-pages branch contains authentication shell. After OAuth login, apps load dynamically from private main branch via GitHub Contents API.

## Constraints

- 5,000 API requests/hour per user
- Static files only (no backend)
- Designed for 1-10 users
- Not suitable for public or high-traffic applications

## Performance

First load: 1-2s. Cached load: 100-200ms.

localStorage cache (5min TTL) reduces API usage by 90%.

## Debug

```javascript
analytics.getStats()
errorTracker.getErrors()
repo.clearCache()
```
