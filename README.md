# Duke Capstone - Secure Prototype Gallery

A private, self-managing prototype gallery powered by GitHub Pages and GitHub API. All apps and content are protected behind GitHub OAuth with real access control.

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│ gh-pages Branch (Public - 1.5KB)       │
│ ├─ Minimal auth shell                   │
│ └─ Redirects to GitHub OAuth            │
└─────────────────────────────────────────┘
              ↓ (after authentication)
┌─────────────────────────────────────────┐
│ main Branch (Private Repository)        │
│ ├─ index.html (App Launcher)            │
│ ├─ apps/ (Prototype Applications)       │
│ ├─ shared/ (Utilities & Components)     │
│ └─ content/ (Markdown & Data)           │
└─────────────────────────────────────────┘
              ↓ (fetched via)
┌─────────────────────────────────────────┐
│ GitHub Contents API                     │
│ ├─ 5,000 requests/hour (authenticated)  │
│ └─ Cached locally (5-min TTL)           │
└─────────────────────────────────────────┘
```

## ✨ Features

### Security
- ✅ **Real Access Control** - Private repo enforced by GitHub
- ✅ **OAuth Protected** - GitHub authentication required
- ✅ **Token-based API** - All content fetched with user token
- ✅ **Minimal Public Footprint** - Only 1.5KB auth shell public

### Performance
- ✅ **5-Minute Caching** - localStorage cache with TTL
- ✅ **Lazy Loading** - Apps load on-demand
- ✅ **Preloading** - Shared resources loaded once
- ✅ **Service Worker** - Offline support & caching
- ✅ **Token Injection** - No re-auth in apps (5x faster)

### Developer Experience
- ✅ **Self-Managing** - Built-in CMS for editing content
- ✅ **Hot Reload** - Just refresh after changes
- ✅ **Version Checking** - Compatibility warnings
- ✅ **Error Tracking** - Automatic error logging
- ✅ **Analytics** - Usage tracking and stats
- ✅ **Keyboard Shortcuts** - ESC to close, Ctrl+R to refresh

## 💪 Strengths

### For Personal/Small Team Use
- **Zero Cost** - No hosting fees, uses GitHub infrastructure
- **Zero Maintenance** - No servers to manage
- **Instant Deployment** - Push to main → Live immediately
- **Built-in Version Control** - Git history for all changes
- **Self-Managing** - CMS included for non-technical edits
- **Offline Support** - Service Worker enables offline access
- **Fast** - Aggressive caching, instant subsequent loads
- **Secure** - Real GitHub-enforced access control

### Technical
- **Flexible** - Any tech stack (React, Vue, vanilla JS)
- **Isolated** - Apps run in iframes, can't break each other
- **Extensible** - Easy to add new apps/features
- **Debuggable** - Full browser DevTools access
- **Portable** - Clone repo = full backup

## ⚠️ Limitations & Trade-offs

### GitHub API Constraints
- **Rate Limit:** 5,000 requests/hour per user
  - *Mitigation:* 5-min cache reduces to ~50 req/hr
  - *Risk:* Heavy usage or multiple users could hit limits
  - *Solution:* Add Cloudflare Workers proxy if needed

### No Backend Capabilities
- **Cannot run server-side code**
  - *Workaround:* Use GitHub Actions for scheduled tasks
  - *Alternative:* Add Cloudflare Workers or Vercel Functions
- **No database** (GitHub repo is storage)
  - *Workaround:* Use JSON files in content/
  - *Alternative:* Add Supabase or Firebase
- **No real-time features**
  - *Workaround:* Polling via API
  - *Alternative:* Add Ably or Pusher

### Iframe Constraints
- **Debugging is harder** - Must inspect iframe separately
- **Some browser features restricted** - localStorage isolation
- *Not a major issue for most apps*

### Build Process
- **Complex apps need local build** (React, Vue, etc.)
  - Build locally → Commit dist/ → Deploy
  - No CI/CD (yet)

### Scalability
- **Designed for:** 1-10 users, personal/team prototypes
- **Not suitable for:** Public apps, high traffic, >50 concurrent users

## 📊 Performance Metrics

- **First Load:** ~1-2 seconds
- **Cached Load:** ~100-200ms (instant)
- **API Reduction:** 90% fewer calls with caching

## 🔧 Monitoring

```javascript
// View analytics
analytics.getStats()

// View errors
errorTracker.getErrors()

// Clear cache
repo.clearCache()
```

## 🚦 When to Migrate

| Scenario | Solution | Cost | Effort |
|----------|----------|------|--------|
| Multiple users hitting limits | Cloudflare Workers | $5/mo | 2-4 hrs |
| Need database | Supabase | Free tier | 4-8 hrs |
| Production app | Vercel/Netlify | $0-20/mo | 1-2 days |
| Real-time features | Ably/Pusher | $10/mo | 2-4 hrs |

## 🎯 Use Cases

### ✅ Perfect For:
- Personal prototype gallery
- Team internal tools
- Educational projects
- Demo applications
- Portfolio with access control

### ❌ Not Suitable For:
- Public production apps
- High-traffic (>1000 DAU)
- Apps requiring backend
- Real-time collaboration
- E-commerce

## 📝 Version

**v1.0.0** - Full-featured secure prototype gallery

## 📄 License

MIT License
