# Cloudflare Access Setup Plan

## Overview
Cloudflare Access provides true server-side authentication in front of GitHub Pages. Free tier: 50 users.

## Prerequisites
- Domain on Cloudflare (capstone.neevs.io) ✅
- Cloudflare account ✅
- GitHub Pages site

## Setup Steps

### 1. Enable Cloudflare Access
1. Go to https://one.dash.cloudflare.com/
2. Select your domain (neevs.io)
3. Navigate to **Zero Trust** > **Access** > **Applications**
4. Click **Add an application** > **Self-hosted**

### 2. Configure Application
- **Application name**: Duke Capstone
- **Session Duration**: 24 hours
- **Application domain**: `capstone.neevs.io`

### 3. Add Google Authentication
- **Identity providers**: Add Google OAuth
- Requires Google OAuth Client ID/Secret (create at console.cloud.google.com)

### 4. Create Access Policy
- **Policy name**: Capstone Access
- **Action**: Allow
- **Include**: Emails ending in `@gmail.com` or specific email: `jonasnvs@gmail.com`

### 5. Deploy
- Save and deploy
- Visit `https://capstone.neevs.io` - Cloudflare will intercept and require auth

## What Gets Protected
- ALL files on capstone.neevs.io
- Cannot bypass (server-side enforcement)
- Works with existing GitHub Pages site (no code changes needed)

## Advantages Over Auth0
- True security (not client-side)
- No code deployment needed
- Protects entire subdomain
- Built into Cloudflare (already using for DNS)
