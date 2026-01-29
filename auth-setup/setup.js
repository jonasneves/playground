#!/usr/bin/env node

import { ManagementClient } from 'auth0';
import { Octokit } from '@octokit/rest';
import prompts from 'prompts';
import { writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';

console.log('🔐 GitHub Pages + Google SSO Setup\n');

// Collect configuration
const config = await prompts([
  {
    type: 'text',
    name: 'domain',
    message: 'Your domain (e.g., capstone.neevs.io):',
    initial: 'capstone.neevs.io'
  },
  {
    type: 'text',
    name: 'auth0Domain',
    message: 'Auth0 Domain (e.g., tenant.us.auth0.com):',
    validate: value => value.includes('.auth0.com') || 'Must be an Auth0 domain'
  },
  {
    type: 'text',
    name: 'auth0ClientId',
    message: 'Auth0 Management API Client ID:'
  },
  {
    type: 'password',
    name: 'auth0ClientSecret',
    message: 'Auth0 Management API Client Secret:'
  },
  {
    type: 'text',
    name: 'githubToken',
    message: 'GitHub Personal Access Token (repo scope):',
    validate: value => value.startsWith('ghp_') || value.startsWith('github_pat_') || 'Invalid GitHub token format'
  },
  {
    type: 'text',
    name: 'githubUsername',
    message: 'Your GitHub username:'
  },
  {
    type: 'text',
    name: 'repoName',
    message: 'Repository name:',
    initial: 'duke-capstone'
  },
  {
    type: 'text',
    name: 'allowedEmail',
    message: 'Allowed email for login (your Google email):'
  }
]);

if (!config.domain) {
  console.error('Setup cancelled');
  process.exit(1);
}

console.log('\n📋 Configuration:', {
  domain: config.domain,
  auth0Domain: config.auth0Domain,
  repo: `${config.githubUsername}/${config.repoName}`
});

// Initialize clients
const auth0 = new ManagementClient({
  domain: config.auth0Domain,
  clientId: config.auth0ClientId,
  clientSecret: config.auth0ClientSecret
});

const octokit = new Octokit({ auth: config.githubToken });

console.log('\n🔧 Step 1: Creating Auth0 Application...');

// Create Auth0 application
const auth0App = await auth0.clients.create({
  name: `GitHub Pages - ${config.domain}`,
  app_type: 'spa',
  callbacks: [`https://${config.domain}/auth/callback`],
  allowed_logout_urls: [`https://${config.domain}`],
  web_origins: [`https://${config.domain}`],
  allowed_origins: [`https://${config.domain}`],
  grant_types: ['implicit', 'authorization_code', 'refresh_token'],
  jwt_configuration: {
    alg: 'RS256',
    lifetime_in_seconds: 36000
  }
});

console.log(`✅ Auth0 app created: ${auth0App.client_id}`);

console.log('\n🔧 Step 2: Enabling Google connection...');

// Check if Google connection exists
let googleConnection;
try {
  const connections = await auth0.connections.getAll({ strategy: 'google-oauth2' });
  googleConnection = connections[0];

  if (!googleConnection) {
    console.log('⚠️  Google connection not found. Please enable it manually in Auth0 dashboard:');
    console.log(`   https://manage.auth0.com/dashboard/us/${config.auth0Domain.split('.')[0]}/connections/social`);
  } else {
    console.log(`✅ Google connection found: ${googleConnection.name}`);

    // Enable connection for this app
    await auth0.connections.update(
      { id: googleConnection.id },
      { enabled_clients: [...(googleConnection.enabled_clients || []), auth0App.client_id] }
    );
  }
} catch (error) {
  console.log('⚠️  Could not auto-configure Google. Enable manually in Auth0 dashboard.');
}

console.log('\n🔧 Step 3: Creating Auth0 Action for access control...');

// Create Auth0 Action to restrict access
const actionCode = `
exports.onExecutePostLogin = async (event, api) => {
  const allowedEmails = ['${config.allowedEmail}'];

  if (!allowedEmails.includes(event.user.email)) {
    api.access.deny(\`Access restricted. Contact administrator.\`);
  }
};
`;

try {
  const action = await auth0.actions.create({
    name: `${config.domain}-access-control`,
    code: actionCode,
    runtime: 'node18',
    supported_triggers: [
      {
        id: 'post-login',
        version: 'v3'
      }
    ]
  });

  console.log(`✅ Auth0 Action created: ${action.id}`);
  console.log(`⚠️  Deploy the action manually in Auth0 dashboard and add to Login flow`);
} catch (error) {
  console.log('⚠️  Could not create action automatically. Create manually in Auth0 dashboard.');
}

console.log('\n🔧 Step 4: Generating auth module...');

// Generate auth module
const authModule = `
const AUTH0_DOMAIN = '${config.auth0Domain}';
const AUTH0_CLIENT_ID = '${auth0App.client_id}';
const REDIRECT_URI = window.location.origin + '/auth/callback';

class Auth {
  constructor() {
    this.user = null;
    this.loadUser();
  }

  loadUser() {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      this.user = JSON.parse(stored);
    }
  }

  saveUser(user) {
    this.user = user;
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  clearUser() {
    this.user = null;
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  }

  login(redirect = window.location.pathname) {
    const state = btoa(JSON.stringify({ redirect }));
    const authUrl = \`https://\${AUTH0_DOMAIN}/authorize?\` + new URLSearchParams({
      response_type: 'token id_token',
      client_id: AUTH0_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: 'openid profile email',
      state: state,
      nonce: Math.random().toString(36)
    });
    window.location.href = authUrl;
  }

  logout(redirect = '/') {
    this.clearUser();
    const logoutUrl = \`https://\${AUTH0_DOMAIN}/v2/logout?\` + new URLSearchParams({
      client_id: AUTH0_CLIENT_ID,
      returnTo: window.location.origin + redirect
    });
    window.location.href = logoutUrl;
  }

  isAuthenticated() {
    return this.user !== null;
  }

  currentUser() {
    return this.user;
  }

  accessToken() {
    return localStorage.getItem('auth_token');
  }

  async handleCallback() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get('access_token');
    const idToken = params.get('id_token');
    const state = params.get('state');

    if (accessToken && idToken) {
      localStorage.setItem('auth_token', accessToken);

      // Decode ID token to get user info (basic JWT decode)
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      this.saveUser({
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      });

      // Redirect back
      const stateData = state ? JSON.parse(atob(state)) : { redirect: '/' };
      window.location.href = stateData.redirect;
    }
  }
}

export const auth = new Auth();
export const { login, logout, isAuthenticated, currentUser, accessToken } = auth;
`;

// Create auth directory structure
mkdirSync('../public/auth', { recursive: true });
writeFileSync('../public/auth/api.js', authModule.trim());

// Create callback page
const callbackPage = `
<!DOCTYPE html>
<html>
<head>
  <title>Authentication Callback</title>
</head>
<body>
  <p>Authenticating...</p>
  <script type="module">
    import { auth } from './api.js';
    auth.handleCallback();
  </script>
</body>
</html>
`;

writeFileSync('../public/auth/callback.html', callbackPage.trim());

// Create example index page
const indexPage = `
<!DOCTYPE html>
<html>
<head>
  <title>${config.domain}</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
    }
    button {
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
    }
    .user-info {
      background: #f0f0f0;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <h1>🔐 Protected Site</h1>
  <div id="auth-status"></div>

  <script type="module">
    import { auth, login, logout } from './auth/api.js';

    const statusDiv = document.getElementById('auth-status');

    if (auth.isAuthenticated()) {
      const user = auth.currentUser();
      statusDiv.innerHTML = \`
        <div class="user-info">
          <p>✅ Logged in as: <strong>\${user.email}</strong></p>
          <button onclick="logout()">Logout</button>
        </div>
        <p>Welcome to your protected site!</p>
      \`;
      window.logout = () => logout();
    } else {
      statusDiv.innerHTML = \`
        <p>🔒 Please log in to access this site.</p>
        <button onclick="login()">Login with Google</button>
      \`;
      window.login = () => login();
    }
  </script>
</body>
</html>
`;

writeFileSync('../public/index.html', indexPage.trim());

console.log('✅ Auth module generated in public/auth/');

console.log('\n🔧 Step 5: Setting up GitHub Pages deployment...');

try {
  // Check if gh-pages branch exists
  let ghPagesBranch;
  try {
    ghPagesBranch = await octokit.repos.getBranch({
      owner: config.githubUsername,
      repo: config.repoName,
      branch: 'gh-pages'
    });
  } catch (e) {
    // Branch doesn't exist, create it
    const mainBranch = await octokit.repos.getBranch({
      owner: config.githubUsername,
      repo: config.repoName,
      branch: 'main'
    });

    await octokit.git.createRef({
      owner: config.githubUsername,
      repo: config.repoName,
      ref: 'refs/heads/gh-pages',
      sha: mainBranch.data.commit.sha
    });

    console.log('✅ Created gh-pages branch');
  }

  // Enable GitHub Pages
  await octokit.repos.createPagesSite({
    owner: config.githubUsername,
    repo: config.repoName,
    source: {
      branch: 'gh-pages',
      path: '/'
    }
  }).catch(() => {
    // Pages might already be enabled
    console.log('ℹ️  GitHub Pages already enabled');
  });

  // Update custom domain
  await octokit.repos.createPagesSite({
    owner: config.githubUsername,
    repo: config.repoName,
    source: {
      branch: 'gh-pages'
    },
    cname: config.domain
  }).catch(async () => {
    // Try update instead
    await octokit.repos.updateInformationAboutPagesSite({
      owner: config.githubUsername,
      repo: config.repoName,
      cname: config.domain
    }).catch(() => {
      console.log('⚠️  Set custom domain manually in GitHub repo settings');
    });
  });

  console.log('✅ GitHub Pages configured');
} catch (error) {
  console.log('⚠️  Could not auto-configure GitHub Pages:', error.message);
  console.log('   Configure manually in repository settings');
}

console.log('\n📝 Setup Summary:');
console.log('================');
console.log(`Auth0 App Client ID: ${auth0App.client_id}`);
console.log(`Domain: ${config.domain}`);
console.log(`\nNext steps:`);
console.log(`1. Deploy the public/ directory to gh-pages branch:`);
console.log(`   cd .. && git checkout -b gh-pages && git add public/ && git commit -m "Deploy auth" && git push -u origin gh-pages`);
console.log(`2. In Auth0 dashboard, deploy the Action and add it to the Login flow`);
console.log(`3. If needed, enable Google connection in Auth0 dashboard`);
console.log(`4. Visit https://${config.domain} to test`);
console.log('\n✅ Setup complete!');
