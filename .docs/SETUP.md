# OAuth Setup

## 1. Create GitHub OAuth App

https://github.com/settings/developers → New OAuth App

- Application name: Duke Capstone
- Homepage URL: `https://capstone.neevs.io`
- Authorization callback URL: `https://oauth.neevs.io/callback`

Copy Client ID and Client Secret.

## 2. Configure OAuth Proxy

```bash
cd ~/Documents/GitHub/agentivo/oauth-proxy
echo "OAUTH_SECRET_<CLIENT_ID>=<CLIENT_SECRET>" >> .env
```

## 3. Deploy

```bash
git push origin main
```

## Architecture

```
capstone.neevs.io → github-auth.js → oauth.neevs.io → GitHub OAuth
```

Branches:
- `main` - Private content
- `gh-pages` - Public auth shell

Update SRI when github-auth.js changes:
```bash
curl https://oauth.neevs.io/github-auth.js | openssl dgst -sha384 -binary | openssl base64 -A
```
