# GitHub Pages + Google SSO Setup

Automated setup script for adding Google SSO authentication to your GitHub Pages site using Auth0.

## Prerequisites

Before running the script, you need:

### 1. Auth0 Account
1. Sign up at https://auth0.com/signup
2. Create a tenant (or use default)
3. Go to **Applications > APIs > Auth0 Management API**
4. Create a **Machine to Machine** application
5. Grant it **all permissions** for Auth0 Management API
6. Save the **Domain**, **Client ID**, and **Client Secret**

### 2. GitHub Personal Access Token
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Grant **repo** scope
4. Save the token

### 3. DNS Configuration
Ensure your domain points to GitHub Pages:
- CNAME record: `capstone` → `{username}.github.io`

## Usage

1. Install dependencies:
```bash
npm install
```

2. Run the setup script:
```bash
node setup.js
```

3. Follow the interactive prompts to provide:
   - Your domain
   - Auth0 credentials
   - GitHub token
   - Allowed email address

4. Deploy to GitHub Pages:
```bash
cd ..
git checkout -b gh-pages
git add public/
git commit -m "Deploy authenticated site"
git push -u origin gh-pages
```

5. In Auth0 dashboard:
   - Deploy the created Action
   - Add it to the Login flow
   - Enable Google social connection if not already enabled

## What It Does

- Creates Auth0 application for your domain
- Configures OAuth callbacks
- Creates access control Action (restricts to allowed email)
- Generates authentication JavaScript module
- Creates example protected site
- Sets up GitHub Pages deployment

## Files Generated

- `public/auth/api.js` - Authentication API module
- `public/auth/callback.html` - OAuth callback handler
- `public/index.html` - Example protected page

## API Usage

```javascript
import { login, logout, isAuthenticated, currentUser } from './auth/api.js';

// Check if user is logged in
if (isAuthenticated()) {
  const user = currentUser();
  console.log(user.email);
} else {
  login(); // Redirect to login
}

// Logout
logout();
```
