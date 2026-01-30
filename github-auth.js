/**
 * GitHub OAuth Authentication Library
 * Uses oauth.neevs.io proxy for secure token exchange
 *
 * Usage:
 *   <script src="github-auth.js"></script>
 *   <script>
 *     GitHubAuth.init({
 *       clientId: 'your_client_id', // optional, will auto-detect if not provided
 *       allowedUsers: ['username1', 'username2'], // optional whitelist
 *       onLogin: (user) => console.log('Logged in:', user),
 *       onLogout: () => console.log('Logged out')
 *     });
 *   </script>
 */

(function(window) {
  'use strict';

  const OAUTH_PROXY = 'https://oauth.neevs.io';
  const STORAGE_KEY_TOKEN = 'gh_token';
  const STORAGE_KEY_USER = 'gh_user';

  class GitHubAuth {
    constructor() {
      this.config = {
        clientId: null,
        allowedUsers: null,
        onLogin: null,
        onLogout: null,
        autoRedirect: true
      };
      this.user = null;
      this.token = null;
    }

    /**
     * Initialize authentication
     * @param {Object} options - Configuration options
     * @param {string} options.clientId - GitHub OAuth client ID (optional, will auto-detect)
     * @param {string[]} options.allowedUsers - Array of allowed GitHub usernames (optional)
     * @param {Function} options.onLogin - Callback when user logs in
     * @param {Function} options.onLogout - Callback when user logs out
     * @param {boolean} options.autoRedirect - Auto redirect to login if not authenticated (default: true)
     */
    async init(options = {}) {
      this.config = { ...this.config, ...options };

      // Auto-detect client ID if not provided
      if (!this.config.clientId) {
        try {
          const config = await this.fetchProxyConfig();
          this.config.clientId = config.github.client_ids[0];
          if (!this.config.clientId) {
            throw new Error('No OAuth client configured in proxy');
          }
        } catch (err) {
          console.error('Failed to fetch OAuth config:', err);
          return;
        }
      }

      // Check for OAuth callback
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('token');
      const error = params.get('error');

      if (error) {
        console.error('OAuth error:', error);
        this.clearAuth();
        if (this.config.autoRedirect) {
          alert(`Authentication error: ${error}`);
        }
        return;
      }

      if (tokenFromUrl) {
        this.token = tokenFromUrl;
        localStorage.setItem(STORAGE_KEY_TOKEN, tokenFromUrl);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        // Try to load existing token
        this.token = localStorage.getItem(STORAGE_KEY_TOKEN);
      }

      if (this.token) {
        await this.verifyAndLoadUser();
      } else if (this.config.autoRedirect) {
        this.login();
      }
    }

    async fetchProxyConfig() {
      const response = await fetch(`${OAUTH_PROXY}/config`);
      if (!response.ok) {
        throw new Error('Failed to fetch proxy config');
      }
      return response.json();
    }

    async verifyAndLoadUser() {
      try {
        const user = await this.fetchGitHubUser(this.token);

        if (user.message || !user.login) {
          // Invalid token
          this.clearAuth();
          if (this.config.autoRedirect) {
            this.login();
          }
          return;
        }

        // Check whitelist if configured
        if (this.config.allowedUsers && !this.config.allowedUsers.includes(user.login)) {
          alert(`Access denied. User '${user.login}' is not authorized.`);
          this.clearAuth();
          return;
        }

        this.user = user;
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));

        if (this.config.onLogin) {
          this.config.onLogin(user);
        }

      } catch (err) {
        console.error('Failed to verify user:', err);
        this.clearAuth();
        if (this.config.autoRedirect) {
          this.login();
        }
      }
    }

    async fetchGitHubUser(token) {
      const response = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    }

    login() {
      const redirectUrl = window.location.origin + window.location.pathname;

      const state = btoa(JSON.stringify({
        provider: 'github',
        client_id: this.config.clientId,
        redirect_url: redirectUrl
      }));

      const authUrl = `https://github.com/login/oauth/authorize?` + new URLSearchParams({
        client_id: this.config.clientId,
        redirect_uri: `${OAUTH_PROXY}/callback`,
        state: state,
        scope: 'read:user'
      });

      window.location.href = authUrl;
    }

    logout() {
      this.clearAuth();
      if (this.config.onLogout) {
        this.config.onLogout();
      }
      window.location.reload();
    }

    clearAuth() {
      this.user = null;
      this.token = null;
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
    }

    isAuthenticated() {
      return !!this.user;
    }

    getUser() {
      return this.user;
    }

    getToken() {
      return this.token;
    }
  }

  // Create singleton instance
  window.GitHubAuth = new GitHubAuth();

})(window);
