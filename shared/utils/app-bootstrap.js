/**
 * App Bootstrap Utility
 * Checks for injected context from parent, falls back to full auth
 */

async function initApp(callback) {
  // Check if running in iframe with injected context
  if (window.INJECTED_TOKEN && window.INJECTED_USER) {
    // Use injected context (fast path)
    console.log('Using injected context from parent');

    // Create minimal GitHubAuth compatible object
    window.GitHubAuth = {
      getToken: () => window.INJECTED_TOKEN,
      getUser: () => window.INJECTED_USER,
      isAuthenticated: () => true,
      logout: () => window.parent.location.reload()
    };

    // Load GitHub API utility
    const response = await fetch(
      'https://api.github.com/repos/jonasneves/duke-capstone/contents/shared/utils/github-api.js',
      { headers: { 'Authorization': `Bearer ${window.INJECTED_TOKEN}` }}
    );
    const data = await response.json();
    eval(decodeURIComponent(escape(atob(data.content))));

    window.repo = initRepo(window.INJECTED_TOKEN);

    // Call app init
    if (callback) callback(window.INJECTED_USER);

  } else {
    // Full authentication flow (slow path)
    console.log('No injected context, performing full auth');

    window.GitHubAuth.init({
      autoRedirect: true,
      onLogin: async (user) => {
        // Load GitHub API utility
        const response = await fetch(
          'https://api.github.com/repos/jonasneves/duke-capstone/contents/shared/utils/github-api.js',
          { headers: { 'Authorization': `Bearer ${window.GitHubAuth.getToken()}` }}
        );
        const data = await response.json();
        eval(decodeURIComponent(escape(atob(data.content))));

        window.repo = initRepo(window.GitHubAuth.getToken());

        // Call app init
        if (callback) callback(user);
      }
    });
  }
}
