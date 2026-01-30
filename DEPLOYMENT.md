# Deployment Guide - React Migration

## Quick Start

Phase 1 of the React migration is complete. The app is ready for deployment.

## Local Testing

### Development Mode
```bash
npm run dev
```
Then open: `http://localhost:5173/index-react.html`

### Production Preview
```bash
npm run build
npm run preview
```
Then open: `http://localhost:4173/index-react.html`

## Deployment Options

### Option 1: Automatic via GitHub Actions (Recommended)

The workflow is already configured in `.github/workflows/deploy-react.yml`.

**To deploy:**
1. Commit and push to main branch:
   ```bash
   git add .
   git commit -m "Phase 1: React foundation complete"
   git push origin main
   ```

2. GitHub Actions will automatically:
   - Install dependencies
   - Build React app
   - Rename index-react.html → index.html
   - Copy legacy files (apps/, shared/)
   - Deploy to gh-pages branch
   - Available at: https://capstone.neevs.io

### Option 2: Manual Deployment

```bash
# 1. Build the React app
npm run build

# 2. Prepare for deployment
cd dist
mv index-react.html index.html
cd ..

# 3. Copy legacy files
cp -r apps dist/
cp -r shared dist/
cp favicon.svg dist/
cp CNAME dist/

# 4. Deploy (example with gh-pages package)
npx gh-pages -d dist
```

## Pre-Deployment Checklist

- [x] Build completes without errors
- [x] Bundle size under 150KB gzipped (current: 69KB ✓)
- [x] TypeScript compilation successful
- [x] All stores configured correctly
- [x] OAuth integration ready
- [x] GitHub API hook implemented
- [ ] Test OAuth flow (requires deployment to capstone.neevs.io)
- [ ] Verify legacy apps load in iframes
- [ ] Test cache persistence
- [ ] Verify authentication works

## Post-Deployment Testing

After deployment to capstone.neevs.io:

1. **Authentication Flow**
   - Visit https://capstone.neevs.io
   - Should redirect to GitHub OAuth
   - After authorization, should return to app
   - User menu should show your avatar/name

2. **App Loading**
   - Click "Launch App" on any app card
   - Should load in iframe
   - Press ESC to return to gallery

3. **Cache Verification**
   - Open DevTools → Application → Local Storage
   - Should see keys like `auth-storage`, `gh_jonasneves_duke-capstone_*`

4. **User Menu**
   - Click user pill (top right)
   - Test "Refresh", "Clear Cache", "Logout"

## Rollback Plan

If issues arise after deployment:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or restore gh-pages to previous state
git checkout gh-pages
git reset --hard HEAD~1
git push -f origin gh-pages
```

The old vanilla JS version remains accessible by:
- Reverting the index.html change
- Or accessing index-legacy.html (if preserved)

## Environment Variables

No environment variables needed. Configuration is in:
- `src/config/app.ts` - App settings
- OAuth service: https://oauth.neevs.io

## Monitoring

After deployment, monitor:
- Browser console for errors
- Network tab for failed API calls
- localStorage for cache entries
- Analytics events (if enabled)

## Bundle Analysis

To analyze bundle size:
```bash
npm run analyze
```

This opens a visualization showing:
- Chunk sizes
- Dependencies
- What's contributing to bundle size

Target: Total gzipped < 150KB (current: 69KB ✓)

## Performance Baseline

### Phase 1 Targets (All Met ✓)
- Bundle size: <150KB gzipped → **69KB**
- Build time: <5s → **738ms**
- Lighthouse score: >90 → TBD (requires deployment)

### Phase 2 Targets (Pending)
- Chat: 100 messages in <100ms
- CMS: Markdown parse <20ms
- Time to interactive: <1.5s

## Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### OAuth Not Working
- Verify CNAME: capstone.neevs.io
- Check OAuth script loads from oauth.neevs.io
- Verify SRI hash matches

### Apps Don't Load
- Check browser console for CORS errors
- Verify GitHub token in authStore
- Check iframe sandbox permissions

### Cache Issues
Clear via user menu or manually:
```javascript
localStorage.clear();
```

## GitHub Pages Configuration

Ensure repository settings:
- **Source**: gh-pages branch / (root)
- **Custom domain**: capstone.neevs.io
- **Enforce HTTPS**: Enabled

## Next Steps After Deployment

Once Phase 1 is deployed and tested:
1. Verify all functionality works
2. Gather performance metrics
3. Begin Phase 2: App conversions
   - Start with Chat app (highest impact)
   - Implement RAF batching
   - Add virtual scrolling

## Support

Issues? Check:
- [MIGRATION-STATUS.md](./MIGRATION-STATUS.md) - Current progress
- [REACT-MIGRATION.md](./REACT-MIGRATION.md) - Architecture guide
- GitHub Actions logs for deployment errors
