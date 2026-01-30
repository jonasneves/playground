# Deployment

## GitHub Actions (Automatic)

Push to main triggers workflow. Deploys to gh-pages at playground.neevs.io.

## Manual

```bash
npm run build
mv dist/index-react.html dist/index.html
cp -r apps shared favicon.svg CNAME dist/
npx gh-pages -d dist
```

## Verify

- OAuth redirects to GitHub
- Apps load in iframes
- localStorage persists (auth-storage, cache keys)
- User menu functions (Refresh, Clear Cache, Logout)

## Rollback

```bash
git revert HEAD && git push origin main
```

## Build Analysis

```bash
npm run analyze  # Opens bundle visualization
```

Target: <150KB gzipped (current: 69KB)
