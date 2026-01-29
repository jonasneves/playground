const AUTH0_DOMAIN = 'neevs.us.auth0.com';
const AUTH0_CLIENT_ID = 'undefined';
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
    const authUrl = `https://${AUTH0_DOMAIN}/authorize?` + new URLSearchParams({
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
    const logoutUrl = `https://${AUTH0_DOMAIN}/v2/logout?` + new URLSearchParams({
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